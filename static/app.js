/**
 * SeriesFlix - Recomendações de Séries
 * Usa a API do TMDb diretamente do navegador
 * Acesso a TODAS as séries já publicadas
 */

// TMDb API - Chave salva no navegador
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const IMG_SMALL = 'https://image.tmdb.org/t/p/w185';

let TMDB_KEY = localStorage.getItem('tmdb_api_key') || '';
let selectedSerieId = null;
let selectedSerieGenres = [];
let searchTimeout = null;

// ======== INICIALIZAÇÃO ========
document.addEventListener('DOMContentLoaded', () => {
    if (!TMDB_KEY) {
        mostrarConfigApiKey();
    } else {
        carregarPopulares();
    }
    setupEventListeners();
});

function mostrarConfigApiKey() {
    const main = document.querySelector('main.container');
    const apiBox = document.createElement('div');
    apiBox.id = 'apiKeySetup';
    apiBox.className = 'api-key-setup';
    apiBox.innerHTML = `
        <div class="api-key-card">
            <h2>🔑 Configure sua chave da API (uma vez só)</h2>
            <p>Para acessar <strong>todas as séries que existem</strong>, usamos a base do TMDb (gratuita).</p>
            <ol>
                <li>Crie conta grátis em <a href="https://www.themoviedb.org/signup" target="_blank">themoviedb.org/signup</a></li>
                <li>Após confirmar o email, vá em <a href="https://www.themoviedb.org/settings/api" target="_blank">Configurações > API</a></li>
                <li>Clique em "Criar" > escolha "Developer" > preencha o formulário (pode colocar qualquer coisa)</li>
                <li>Copie a chave "API Key (v3 auth)" e cole abaixo:</li>
            </ol>
            <div class="api-key-input-group">
                <input type="text" id="apiKeyInput" placeholder="Cole sua API Key aqui..." autocomplete="off">
                <button id="apiKeySaveBtn">Salvar e Começar</button>
            </div>
            <p class="api-key-note">A chave é salva apenas no seu navegador. Não é enviada para nenhum servidor nosso.</p>
        </div>
    `;
    main.insertBefore(apiBox, main.querySelector('.search-section'));

    document.getElementById('apiKeySaveBtn').addEventListener('click', salvarApiKey);
    document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') salvarApiKey();
    });
}

async function salvarApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    if (!key) { input.focus(); return; }

    // Testa a chave
    try {
        const res = await fetch(`${TMDB_BASE}/configuration?api_key=${key}`);
        if (!res.ok) {
            alert('Chave inválida. Verifique e tente novamente.');
            return;
        }
    } catch (e) {
        alert('Erro de conexão. Verifique sua internet.');
        return;
    }

    TMDB_KEY = key;
    localStorage.setItem('tmdb_api_key', key);
    document.getElementById('apiKeySetup').remove();
    carregarPopulares();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const q = searchInput.value.trim();
        if (q.length >= 2) {
            searchTimeout = setTimeout(() => buscarSeries(q), 400);
        } else {
            fecharResultados();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); buscarSeries(searchInput.value.trim()); }
        if (e.key === 'Escape') fecharResultados();
    });

    searchBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        if (q.length >= 2) buscarSeries(q);
    });

    document.addEventListener('click', (e) => {
        const sr = document.getElementById('searchResults');
        if (!sr.contains(e.target) && e.target !== searchInput) fecharResultados();
    });

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!selectedSerieId) return;
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            buscarRecomendacoes(selectedSerieId, btn.dataset.type);
        });
    });
}

// ======== API TMDb ========
async function tmdb(endpoint, params = {}) {
    params.api_key = TMDB_KEY;
    params.language = 'pt-BR';
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${TMDB_BASE}${endpoint}?${qs}`);
    if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
    return res.json();
}

// ======== POPULARES ========
async function carregarPopulares() {
    try {
        const data = await tmdb('/tv/popular', { page: 1 });
        const grid = document.getElementById('popularGrid');
        grid.innerHTML = data.results.slice(0, 20).map(s => cardHTML(s)).join('');
    } catch (e) {
        console.error('Erro ao carregar populares:', e);
    }
}

// ======== BUSCA ========
async function buscarSeries(query) {
    if (!query || query.length < 2) return;
    try {
        const data = await tmdb('/search/tv', { query });
        mostrarResultadosBusca(data.results.slice(0, 10));
    } catch (e) {
        mostrarErro('Erro ao buscar. Verifique sua chave da API.');
    }
}

function mostrarResultadosBusca(results) {
    const sr = document.getElementById('searchResults');
    if (!results || results.length === 0) {
        sr.innerHTML = '<div class="search-result-item"><p style="color:var(--text-muted)">Nenhuma série encontrada</p></div>';
        sr.classList.add('active');
        return;
    }
    sr.innerHTML = results.map(s => `
        <div class="search-result-item" onclick="selecionarSerie(${s.id})">
            ${s.poster_path
                ? `<img src="${IMG_SMALL}${s.poster_path}" alt="${s.name}" loading="lazy">`
                : '<div class="no-poster">🎬</div>'}
            <div class="search-result-info">
                <h4>${s.name}</h4>
                <span>${(s.first_air_date || '').slice(0, 4) || 'N/A'} • ⭐ ${s.vote_average ? s.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
        </div>
    `).join('');
    sr.classList.add('active');
}

function fecharResultados() {
    document.getElementById('searchResults').classList.remove('active');
}

// ======== DETALHES ========
async function selecionarSerie(id) {
    fecharResultados();
    esconderErro();
    esconder('recommendations');
    esconder('popularSection');
    mostrarLoading();

    try {
        const data = await tmdb(`/tv/${id}`, { append_to_response: 'credits' });
        selectedSerieId = id;
        selectedSerieGenres = data.genres.map(g => g.id);
        mostrarDetalhes(data);
    } catch (e) {
        mostrarErro('Erro ao carregar detalhes da série.');
    } finally {
        esconderLoading();
    }
}

function mostrarDetalhes(s) {
    const poster = document.getElementById('selectedPoster');
    const placeholder = document.getElementById('selectedPosterPlaceholder');

    if (s.poster_path) {
        poster.src = `${IMG_BASE}${s.poster_path}`;
        poster.alt = s.name;
        poster.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        poster.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }

    document.getElementById('selectedName').textContent = s.name;
    document.getElementById('selectedYear').textContent = (s.first_air_date || '').slice(0, 4) || 'N/A';
    document.getElementById('selectedRating').textContent = `⭐ ${s.vote_average ? s.vote_average.toFixed(1) : 'N/A'}`;
    document.getElementById('selectedSeasons').textContent = s.number_of_seasons ? `${s.number_of_seasons} temporada${s.number_of_seasons > 1 ? 's' : ''}` : '';
    document.getElementById('selectedGenres').textContent = s.genres.map(g => g.name).join(' • ');
    document.getElementById('selectedSynopsis').textContent = s.overview || 'Sem sinopse disponível.';

    mostrar('selectedSeries');

    // Elenco
    const cast = (s.credits && s.credits.cast) ? s.credits.cast.slice(0, 10) : [];
    if (cast.length > 0) {
        document.getElementById('castList').innerHTML = cast.map(a => `
            <div class="cast-item">
                ${a.profile_path
                    ? `<img src="${IMG_SMALL}${a.profile_path}" alt="${a.name}" loading="lazy">`
                    : '<div class="no-photo">👤</div>'}
                <p title="${a.name}">${a.name}</p>
                <p class="character">${a.character || ''}</p>
            </div>
        `).join('');
        mostrar('castSection');
    } else {
        esconder('castSection');
    }

    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('selectedSeries').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======== RECOMENDAÇÕES ========
async function buscarRecomendacoes(id, tipo) {
    esconder('recommendations');
    esconderErro();
    mostrarLoading();

    try {
        let recs = [];
        let criterio = '';

        if (tipo === 'genero') {
            const data = await tmdb('/discover/tv', {
                with_genres: selectedSerieGenres.join(','),
                sort_by: 'vote_average.desc',
                'vote_count.gte': 100,
                page: 1
            });
            recs = data.results.filter(s => s.id !== id).slice(0, 12);
            criterio = 'Séries do mesmo gênero';
        } else if (tipo === 'estilo') {
            const data = await tmdb(`/tv/${id}/recommendations`);
            recs = data.results.filter(s => s.id !== id).slice(0, 12);
            if (recs.length < 6) {
                const sim = await tmdb(`/tv/${id}/similar`);
                const ids = new Set(recs.map(r => r.id));
                for (const s of sim.results) {
                    if (s.id !== id && !ids.has(s.id)) recs.push(s);
                    if (recs.length >= 12) break;
                }
            }
            criterio = 'Séries com estilo e temática similar';
        } else if (tipo === 'ator') {
            const credits = await tmdb(`/tv/${id}/credits`);
            const topCast = credits.cast.slice(0, 5);
            const seenIds = new Set([id]);
            const actorNames = [];

            for (const actor of topCast) {
                actorNames.push(actor.name);
                const actorCredits = await tmdb(`/person/${actor.id}/tv_credits`);
                for (const s of actorCredits.cast) {
                    if (seenIds.has(s.id) || (s.vote_count || 0) < 20) continue;
                    seenIds.add(s.id);
                    s._ator = actor.name;
                    recs.push(s);
                }
                if (recs.length >= 20) break;
            }
            recs.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
            recs = recs.slice(0, 12);
            criterio = `Atores: ${actorNames.join(', ')}`;
        }

        mostrarRecomendacoes(recs, criterio);
    } catch (e) {
        mostrarErro('Erro ao buscar recomendações.');
        console.error(e);
    } finally {
        esconderLoading();
    }
}

function mostrarRecomendacoes(recs, criterio) {
    if (!recs || recs.length === 0) {
        mostrarErro('Nenhuma recomendação encontrada.');
        return;
    }
    document.getElementById('recommendationCriteria').textContent = criterio;
    document.getElementById('recommendationsList').innerHTML = recs.map(s => {
        const actorBadge = s._ator ? `<span class="actor-badge">🌟 ${s._ator}</span>` : '';
        return cardHTML(s, actorBadge);
    }).join('');
    mostrar('recommendations');
    document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======== HELPERS ========
function cardHTML(s, extra = '') {
    const nome = s.name || s.original_name || 'Sem nome';
    const ano = (s.first_air_date || '').slice(0, 4);
    const nota = s.vote_average ? s.vote_average.toFixed(1) : 'N/A';
    return `
        <div class="rec-card" onclick="selecionarSerie(${s.id})" title="${nome}">
            ${s.poster_path
                ? `<img src="${IMG_BASE}${s.poster_path}" alt="${nome}" loading="lazy">`
                : '<div class="no-poster-card">🎬</div>'}
            ${extra}
            <div class="rec-card-info">
                <h4>${nome}</h4>
                <div class="rec-card-meta">
                    <span>${ano}</span>
                    <span class="rating-small">⭐ ${nota}</span>
                </div>
            </div>
        </div>
    `;
}

function mostrar(id) { document.getElementById(id).classList.remove('hidden'); }
function esconder(id) { document.getElementById(id).classList.add('hidden'); }
function mostrarLoading() { mostrar('loading'); }
function esconderLoading() { esconder('loading'); }
function mostrarErro(msg) {
    const el = document.getElementById('errorMessage');
    el.textContent = msg;
    el.classList.remove('hidden');
}
function esconderErro() { document.getElementById('errorMessage').classList.add('hidden'); }
