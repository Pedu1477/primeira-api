// ===== API ===== 
const BASE_URL = "https://pokeapi.co/api/v2/";

async function listarPokemons(limit = 20, offset = 0) {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function buscarPokemonPorNome(nome) {
  const res = await fetch(`${BASE_URL}/pokemon/${nome.toLowerCase().trim()}`);
  if (res.status === 404) throw new Error("Pokémon não encontrado.");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function carregarDetalhes(urls) {
  const promises = urls.map(url =>
    fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
  );
  return Promise.all(promises);
}

// ===== UI =====
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const TIPO_CORES = {
  fire: "#FF6B35", water: "#4FC3F7", grass: "#81C784",
  electric: "#FFD54F", psychic: "#F48FB1", ice: "#80DEEA",
  dragon: "#7E57C2", dark: "#546E7A", fairy: "#F06292",
  fighting: "#EF5350", flying: "#90CAF9", poison: "#AB47BC",
  ground: "#BCAAA4", rock: "#8D6E63", bug: "#AED581",
  ghost: "#7E57C2", steel: "#B0BEC5", normal: "#9E9E9E",
};

const TIPO_BG = {
  fire: "#2d1a0e", water: "#0d1f2d", grass: "#0d2010",
  electric: "#2d2600", psychic: "#2d1020", ice: "#0d2428",
  dragon: "#1a1030", dark: "#12181c", fairy: "#2d1020",
  fighting: "#2d0e0e", flying: "#0e1828", poison: "#1e0d2a",
  ground: "#2a1e18", rock: "#1e1612", bug: "#1a2210",
  ghost: "#1a1030", steel: "#1c2228", normal: "#1e1e1e",
};

function renderizarCard(dados) {
  const tipo = dados.types[0]?.type.name ?? "normal";
  const cor = TIPO_CORES[tipo] ?? "#9E9E9E";
  const bg = TIPO_BG[tipo] ?? "#1e1e1e";
  const imagem = dados.sprites.other?.["official-artwork"]?.front_default
    ?? dados.sprites.front_default
    ?? "https://via.placeholder.com/120?text=?";

  const tipos = dados.types
    .map(t => `<span class="tipo-badge" style="background:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}22; color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}; border-color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}44">${capitalizar(t.type.name)}</span>`)
    .join("");

  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4">
      <div class="poke-card" style="--tipo-cor: ${cor}; --tipo-bg: ${bg}" data-tipo="${tipo}" data-pokemon='${JSON.stringify(dados)}'>
        <div class="poke-numero">#${String(dados.id).padStart(3, "0")}</div>
        <div class="poke-img-wrap">
          <img src="${imagem}" alt="${dados.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/120?text=?'">
        </div>
        <div class="poke-nome">${capitalizar(dados.name)}</div>
        <div class="poke-tipos">${tipos}</div>
        <div class="poke-stats">
          <span>📏 ${(dados.height / 10).toFixed(1)}m</span>
          <span>⚖️ ${(dados.weight / 10).toFixed(1)}kg</span>
        </div>
      </div>
    </div>
  `;
}

function mostrarErro(elemento, mensagem) {
  elemento.classList.remove("d-none");
  elemento.innerHTML = `<span>⚠️ ${mensagem}</span>`;
}

function limparErro(elemento) {
  elemento.classList.add("d-none");
  elemento.innerText = "";
}

function setLoading(elemento, visivel) {
  elemento.style.display = visivel ? "block" : "none";
}

function abrirModalDetalhes(pokemon) {
  const tipo = pokemon.types[0]?.type.name ?? "normal";
  const cor = TIPO_CORES[tipo] ?? "#9E9E9E";
  const imagem = pokemon.sprites.other?.["official-artwork"]?.front_default
    ?? pokemon.sprites.front_default
    ?? "https://via.placeholder.com/120?text=?";

  const tipos = pokemon.types
    .map(t => `<span class="detalhes-tipo-badge" style="background:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}22; color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}; border-color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}">${capitalizar(t.type.name)}</span>`)
    .join("");

  const stats = pokemon.stats
    .map(s => {
      const maxStat = 255;
      const percentual = (s.base_stat / maxStat) * 100;
      return `
        <div class="stat-item">
          <div class="stat-nome">
            <span class="stat-nome-text">${capitalizar(s.stat.name)}</span>
            <span class="stat-valor">${s.base_stat}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-preenchimento" style="width: ${percentual}%; --tipo-cor: ${cor}"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const habilidades = pokemon.abilities
    .map(a => `<span style="background:${cor}22; color:${cor}; padding:0.4rem 0.8rem; border-radius:999px; border:1px solid ${cor}44; font-size:0.85rem; font-weight:600">${capitalizar(a.ability.name)}</span>`)
    .join("");

  const conteudo = `
    <div class="detalhes-header">
      <div class="detalhes-numero">#${String(pokemon.id).padStart(3, "0")}</div>
      <div class="detalhes-nome" style="color:${cor}; text-shadow:0 0 20px ${cor}44">${capitalizar(pokemon.name)}</div>
      <img class="detalhes-imagem" src="${imagem}" alt="${pokemon.name}" style="filter: drop-shadow(0 8px 20px ${cor}44)" onerror="this.src='https://via.placeholder.com/120?text=?'">
      <div class="detalhes-tipos">${tipos}</div>
    </div>

    <div class="detalhes-stats">
      <div class="stats-label">⚔️ Estatísticas</div>
      ${stats}
    </div>

    <div class="detalhes-info">
      <div class="info-item">
        <div class="info-label">Altura</div>
        <div class="info-valor">${(pokemon.height / 10).toFixed(1)}m</div>
      </div>
      <div class="info-item">
        <div class="info-label">Peso</div>
        <div class="info-valor">${(pokemon.weight / 10).toFixed(1)}kg</div>
      </div>
      <div class="info-item">
        <div class="info-label">Experiência Base</div>
        <div class="info-valor">${pokemon.base_experience}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ordem</div>
        <div class="info-valor">#${pokemon.order}</div>
      </div>
    </div>

    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
      <div class="stats-label" style="margin-bottom: 0.8rem;">🎯 Habilidades</div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${habilidades}</div>
    </div>
  `;

  detalhesConteudo.innerHTML = conteudo;
  modalDetalhes.classList.remove("d-none");
}

function fecharModal() {
  modalDetalhes.classList.add("d-none");
  detalhesConteudo.innerHTML = "";
}

// ===== APP =====
const lista   = document.getElementById("lista");
const loading = document.getElementById("loading");
const erro    = document.getElementById("erro");
const btnMais = document.getElementById("btn-mais");
const inputBusca  = document.getElementById("busca");
const btnBuscar   = document.getElementById("btn-buscar");
const btnLimpar   = document.getElementById("btn-limpar");
const modalDetalhes = document.getElementById("modal-detalhes");
const detalhesConteudo = document.getElementById("detalhes-conteudo");
const btnFecharModal = document.getElementById("btn-fechar-modal");

const LIMITE = 1;
let offset = 0;
let totalDisponivel = Infinity;
let modosBusca = false;

async function carregarPagina() {
  setLoading(loading, true);
  limparErro(erro);

  try {
    const data = await listarPokemons(LIMITE, offset);
    totalDisponivel = data.count;

    const urls = data.results.map(p => p.url);
    const pokemons = await carregarDetalhes(urls);

    lista.innerHTML = pokemons.map(renderizarCard).join("");

    offset += LIMITE;
    btnMais.style.display = offset >= totalDisponivel ? "none" : "inline-block";

  } catch (e) {
    mostrarErro(erro, `Falha ao carregar Pokémon: ${e.message}`);
  } finally {
    setLoading(loading, false);
  }
}

async function buscar() {
  const termo = inputBusca.value.trim();
  if (!termo) {
    mostrarErro(erro, "Digite um nome ou ID de Pokémon para buscar.");
    return;
  }

  modosBusca = true;
  btnMais.style.display = "none";
  lista.innerHTML = "";
  setLoading(loading, true);
  limparErro(erro);

  try {
    const pokemon = await buscarPokemonPorNome(termo);
    lista.innerHTML = renderizarCard(pokemon);
    btnLimpar.style.display = "inline-block";
  } catch (e) {
    mostrarErro(erro, e.message);
  } finally {
    setLoading(loading, false);
  }
}

function limparBusca() {
  inputBusca.value = "";
  modosBusca = false;
  offset = 0;
  lista.innerHTML = "";
  btnLimpar.style.display = "none";
  carregarPagina();
}

btnMais.addEventListener("click", carregarPagina);

btnBuscar.addEventListener("click", buscar);

inputBusca.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    buscar();
  }
});

btnLimpar.addEventListener("click", limparBusca);

btnFecharModal.addEventListener("click", fecharModal);

modalDetalhes.addEventListener("click", (e) => {
  if (e.target === modalDetalhes) {
    fecharModal();
  }
});

lista.addEventListener("click", (e) => {
  const card = e.target.closest(".poke-card");
  if (card && card.dataset.pokemon) {
    const pokemon = JSON.parse(card.dataset.pokemon);
    abrirModalDetalhes(pokemon);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalDetalhes.classList.contains("d-none")) {
    fecharModal();
  }
});

carregarPagina();
