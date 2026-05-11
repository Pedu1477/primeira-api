// ===== API ===== 
const BASE_URL = "https://pokeapi.co/api/v2";

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
      <div class="poke-card" style="--tipo-cor: ${cor}; --tipo-bg: ${bg}" data-tipo="${tipo}">
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

// ===== APP =====
const lista   = document.getElementById("lista");
const loading = document.getElementById("loading");
const erro    = document.getElementById("erro");
const btnMais = document.getElementById("btn-mais");
const inputBusca  = document.getElementById("busca");
const btnBuscar   = document.getElementById("btn-buscar");
const btnLimpar   = document.getElementById("btn-limpar");

const LIMITE = 20;
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

    lista.innerHTML += pokemons.map(renderizarCard).join("");

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
  if (!termo) return;

  modosBusca = true;
  btnMais.style.display = "none";
  lista.innerHTML = "";
  setLoading(loading, true);
  limparErro(erro);

  try {
    const pokemon = await buscarPokemonPorNome(termo);
    lista.innerHTML = renderizarCard(pokemon);
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

btnBuscar.addEventListener("click", () => {
  buscar();
  btnLimpar.style.display = "inline-block";
});

inputBusca.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    buscar();
    btnLimpar.style.display = "inline-block";
  }
});

btnLimpar.addEventListener("click", limparBusca);

carregarPagina();
