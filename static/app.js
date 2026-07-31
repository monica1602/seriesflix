/**
 * SeriesFlix - Recomendações de Séries
 * Frontend que chama a API do backend
 */

let selectedSerieId = null;
let selectedSerieGenres = [];
let searchTimeout = null;

// ======== INICIALIZAÇÃO ========
document.addEventListener('DOMContentLoaded', () => {
    carregarPopulares();
    setupEventListeners();
});

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

// ======== POPULARES ========
async function carregarPopulares() {
    try {
        const res = await fetch('/api/populares');
        const data = await res.json();
        if (!data.resultados || data.resultados.length === 0) return;
        const grid = document.getElementById('popularGrid');
        grid.innerHTML = data.resultados.map(s => cardHTML(s)).join('');
    } catch (e) {
        console.error('Erro ao carregar populares:', e);
    }
}

// ======== BUSCA ========
async function buscarSeries(query) {
    if (!query || query.length < 2) return;
    try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok) {
            mostrarResultadosBusca(data.resultados);
        }
    } catch (e) {
        mostrarErro('Erro ao buscar séries.');
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
            ${s.poster
                ? `<img src="${s.poster}" alt="${s.nome}" loading="lazy">`
                : '<div class="no-poster">🎬</div>'}
            <div class="search-result-info">
                <h4>${s.nome}</h4>
                <span>${s.ano || 'N/A'} • ⭐ ${s.nota ? s.nota.toFixed(1) : 'N/A'}</span>
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
        const res = await fetch(`/api/detalhes/${id}`);
        const data = await res.json();
        if (!res.ok) { mostrarErro(data.error || 'Erro'); return; }
        selectedSerieId = id;
        selectedSerieGenres = data.genero_ids || [];
        mostrarDetalhes(data);
    } catch (e) {
        mostrarErro('Erro ao carregar detalhes.');
    } finally {
        esconderLoading();
    }
}

function mostrarDetalhes(s) {
    const poster = document.getElementById('selectedPoster');
    const placeholder = document.getElementById('selectedPosterPlaceholder');

    if (s.poster) {
        poster.src = s.poster;
        poster.alt = s.nome;
        poster.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        poster.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }

    document.getElementById('selectedName').textContent = s.nome;
    document.getElementById('selectedYear').textContent = s.ano || 'N/A';
    document.getElementById('selectedRating').textContent = `⭐ ${s.nota ? s.nota.toFixed(1) : 'N/A'}`;
    document.getElementById('selectedSeasons').textContent = s.num_temporadas ? `${s.num_temporadas} temporada${s.num_temporadas > 1 ? 's' : ''}` : '';
    document.getElementById('selectedGenres').textContent = (s.generos || []).join(' • ');
    document.getElementById('selectedSynopsis').textContent = s.sinopse || 'Sem sinopse disponível.';

    mostrar('selectedSeries');

    // Elenco
    if (s.elenco && s.elenco.length > 0) {
        document.getElementById('castList').innerHTML = s.elenco.map(a => `
            <div class="cast-item">
                ${a.foto
                    ? `<img src="${a.foto}" alt="${a.nome}" loading="lazy">`
                    : '<div class="no-photo">👤</div>'}
                <p title="${a.nome}">${a.nome}</p>
                <p class="character">${a.personagem || ''}</p>
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
        const res = await fetch(`/api/recomendar/${tipo}/${id}`);
        const data = await res.json();
        if (!res.ok) { mostrarErro(data.error || 'Erro'); return; }
        mostrarRecomendacoes(data);
    } catch (e) {
        mostrarErro('Erro ao buscar recomendações.');
    } finally {
        esconderLoading();
    }
}

function mostrarRecomendacoes(data) {
    if (!data.recomendacoes || data.recomendacoes.length === 0) {
        mostrarErro('Nenhuma recomendação encontrada.');
        return;
    }
    document.getElementById('recommendationCriteria').textContent = data.criterio || '';
    document.getElementById('recommendationsList').innerHTML = data.recomendacoes.map(s => {
        const extra = s.ator_em_comum ? `<span class="actor-badge">🌟 ${s.ator_em_comum}</span>` : '';
        return cardHTML(s, extra);
    }).join('');
    mostrar('recommendations');
    document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======== HELPERS ========
function cardHTML(s, extra = '') {
    const nome = s.nome || 'Sem nome';
    const ano = s.ano || '';
    const nota = s.nota ? s.nota.toFixed(1) : 'N/A';
    return `
        <div class="rec-card" onclick="selecionarSerie(${s.id})" title="${nome}">
            ${s.poster
                ? `<img src="${s.poster}" alt="${nome}" loading="lazy">`
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
