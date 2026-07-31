"""
SeriesFlix - Recomendações de Séries
Backend Flask que faz proxy das chamadas ao TMDb
"""

from flask import Flask, jsonify, request, send_from_directory
import requests as req
import urllib3
import os

# Desabilita avisos SSL para ambientes com certificados incompletos
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')

app = Flask(__name__, static_folder=STATIC_DIR)

TMDB_KEY = os.environ.get('TMDB_API_KEY', '')
TMDB_BASE = 'https://api.themoviedb.org/3'
IMG_BASE = 'https://image.tmdb.org/t/p/w500'
IMG_SMALL = 'https://image.tmdb.org/t/p/w185'


def tmdb(endpoint, params=None):
    """Faz requisição à API do TMDb."""
    if not TMDB_KEY:
        return None
    if params is None:
        params = {}
    params['api_key'] = TMDB_KEY
    params['language'] = 'pt-BR'
    try:
        r = req.get(f'{TMDB_BASE}{endpoint}', params=params, timeout=10, verify=False)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Erro TMDb: {e}")
        return None


def fmt(serie):
    """Formata série para resposta JSON."""
    return {
        'id': serie.get('id'),
        'nome': serie.get('name', 'Sem nome'),
        'sinopse': serie.get('overview', ''),
        'poster': f"{IMG_BASE}{serie['poster_path']}" if serie.get('poster_path') else None,
        'nota': serie.get('vote_average', 0),
        'ano': (serie.get('first_air_date') or '')[:4]
    }


# ===== Rotas Estáticas =====

@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'index.html')


@app.route('/<path:filename>')
def serve(filename):
    return send_from_directory(STATIC_DIR, filename)


# ===== API =====

@app.route('/api/populares')
def populares():
    data = tmdb('/tv/popular', {'page': 1})
    if not data:
        return jsonify({'resultados': []}), 200
    return jsonify({'resultados': [fmt(s) for s in data.get('results', [])[:20]]})


@app.route('/api/buscar')
def buscar():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'Digite o nome de uma série'}), 400
    data = tmdb('/search/tv', {'query': q})
    if not data:
        return jsonify({'error': 'Erro ao buscar'}), 500
    return jsonify({'resultados': [fmt(s) for s in data.get('results', [])[:10]]})


@app.route('/api/detalhes/<int:sid>')
def detalhes(sid):
    data = tmdb(f'/tv/{sid}', {'append_to_response': 'credits'})
    if not data:
        return jsonify({'error': 'Erro ao buscar detalhes'}), 500

    generos = [g['name'] for g in data.get('genres', [])]
    elenco = []
    for a in (data.get('credits', {}).get('cast', []))[:10]:
        elenco.append({
            'id': a['id'], 'nome': a['name'],
            'personagem': a.get('character', ''),
            'foto': f"{IMG_SMALL}{a['profile_path']}" if a.get('profile_path') else None
        })

    return jsonify({
        'id': data['id'], 'nome': data.get('name', ''),
        'sinopse': data.get('overview', ''),
        'poster': f"{IMG_BASE}{data['poster_path']}" if data.get('poster_path') else None,
        'nota': data.get('vote_average', 0),
        'ano': (data.get('first_air_date') or '')[:4],
        'generos': generos,
        'genero_ids': [g['id'] for g in data.get('genres', [])],
        'elenco': elenco,
        'num_temporadas': data.get('number_of_seasons', 0),
        'status': data.get('status', '')
    })


@app.route('/api/recomendar/genero/<int:sid>')
def rec_genero(sid):
    det = tmdb(f'/tv/{sid}')
    if not det:
        return jsonify({'error': 'Erro'}), 500
    gids = [g['id'] for g in det.get('genres', [])]
    if not gids:
        return jsonify({'recomendacoes': [], 'criterio': ''}), 200

    data = tmdb('/discover/tv', {
        'with_genres': ','.join(str(g) for g in gids),
        'sort_by': 'vote_average.desc',
        'vote_count.gte': 100, 'page': 1
    })
    if not data:
        return jsonify({'error': 'Erro'}), 500

    recs = [fmt(s) for s in data.get('results', []) if s['id'] != sid][:12]
    nomes = [g['name'] for g in det.get('genres', [])]
    return jsonify({'tipo': 'genero', 'criterio': f"Mesmo gênero: {', '.join(nomes)}", 'recomendacoes': recs})


@app.route('/api/recomendar/estilo/<int:sid>')
def rec_estilo(sid):
    data = tmdb(f'/tv/{sid}/recommendations')
    if not data:
        return jsonify({'error': 'Erro'}), 500

    recs = [fmt(s) for s in data.get('results', []) if s['id'] != sid][:12]

    if len(recs) < 6:
        sim = tmdb(f'/tv/{sid}/similar')
        if sim:
            ids = {r['id'] for r in recs}
            for s in sim.get('results', []):
                if s['id'] != sid and s['id'] not in ids:
                    recs.append(fmt(s))
                if len(recs) >= 12:
                    break

    return jsonify({'tipo': 'estilo', 'criterio': 'Mesmo estilo e temática', 'recomendacoes': recs})


@app.route('/api/recomendar/ator/<int:sid>')
def rec_ator(sid):
    credits = tmdb(f'/tv/{sid}/credits')
    if not credits:
        return jsonify({'error': 'Erro'}), 500

    cast = credits.get('cast', [])[:5]
    if not cast:
        return jsonify({'recomendacoes': [], 'criterio': ''}), 200

    recs = []
    seen = {sid}
    nomes_atores = []

    for ator in cast:
        nomes_atores.append(ator['name'])
        ac = tmdb(f'/person/{ator["id"]}/tv_credits')
        if not ac:
            continue
        for s in ac.get('cast', []):
            if s['id'] in seen or (s.get('vote_count') or 0) < 20:
                continue
            seen.add(s['id'])
            item = fmt(s)
            item['ator_em_comum'] = ator['name']
            recs.append(item)
        if len(recs) >= 20:
            break

    recs.sort(key=lambda x: x.get('nota', 0), reverse=True)
    return jsonify({
        'tipo': 'ator',
        'criterio': f"Atores: {', '.join(nomes_atores)}",
        'recomendacoes': recs[:12]
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"\n  SeriesFlix rodando na porta {port}")
    print(f"  TMDb API Key: {'configurada' if TMDB_KEY else 'NÃO CONFIGURADA'}\n")
    app.run(debug=debug, host='0.0.0.0', port=port)
