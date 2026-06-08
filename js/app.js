import { listarPokemons, buscarPokemonPorNome, carregarDetalhes } from "./api.js";
import { renderizarCard, mostrarErro, limparErro, setLoading, capitalizar, TIPO_CORES, TIPO_BG } from "./ui.js";
 
// --- Elementos do DOM ---
const lista   = document.getElementById("lista");
const loading = document.getElementById("loading");
const erro    = document.getElementById("erro");
const btnMais = document.getElementById("btn-mais");
const inputBusca  = document.getElementById("busca");
const btnBuscar   = document.getElementById("btn-buscar");
const btnLimpar   = document.getElementById("btn-limpar");

// --- Modal ---
const modalDetalhes = document.getElementById("modal-detalhes");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const detalhesContineudo = document.getElementById("detalhes-conteudo");
 
// --- Estado da aplicação ---
const LIMITE = 20;
let offset = 0;
let totalDisponivel = Infinity;
let modosBusca = false;
 
// --- Carregar lista paginada ---
async function carregarPagina() {
  setLoading(loading, true);
  limparErro(erro);
 
  try {
    const data = await listarPokemons(LIMITE, offset);
    totalDisponivel = data.count;
 
    const urls = data.results.map(p => p.url);
    const pokemons = await carregarDetalhes(urls);
 
    lista.innerHTML += pokemons.map(renderizarCard).join("");
    adicionarEventosCards();
 
    offset += LIMITE;
    btnMais.style.display = offset >= totalDisponivel ? "none" : "inline-block";
 
  } catch (e) {
    mostrarErro(erro, `Falha ao carregar Pokémon: ${e.message}`);
  } finally {
    setLoading(loading, false);
  }
}
 
// --- Busca por nome ---
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
    adicionarEventosCards();
  } catch (e) {
    mostrarErro(erro, e.message);
  } finally {
    setLoading(loading, false);
  }
}
 
// --- Limpar busca e voltar à lista ---
function limparBusca() {
  inputBusca.value = "";
  modosBusca = false;
  offset = 0;
  lista.innerHTML = "";
  btnLimpar.style.display = "none";
  carregarPagina();
}

// --- Abrir Modal com Detalhes ---
function abrirModalDetalhes(pokemon) {
  const tipo = pokemon.types[0]?.type.name ?? "normal";
  const cor = TIPO_CORES[tipo] ?? "#9E9E9E";
  const imagem = pokemon.sprites.other?.["official-artwork"]?.front_default
    ?? pokemon.sprites.front_default
    ?? "https://via.placeholder.com/200?text=?";

  const tipos = pokemon.types
    .map(t => `<span class="detalhes-tipo-badge" style="background:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}22; color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}; border-color:${TIPO_CORES[t.type.name] ?? '#9E9E9E'}">${capitalizar(t.type.name)}</span>`)
    .join("");

  const stats = pokemon.stats
    .map(s => {
      const percentual = Math.min((s.base_stat / 150) * 100, 100);
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
    .map(a => capitalizar(a.ability.name.replace("-", " ")))
    .join(", ");

  detalhesContineudo.innerHTML = `
    <div class="detalhes-header">
      <div class="detalhes-numero">#${String(pokemon.id).padStart(3, "0")}</div>
      <div class="detalhes-nome" style="color: ${cor}; text-shadow: 0 0 20px ${cor}33">${capitalizar(pokemon.name)}</div>
      <img src="${imagem}" alt="${pokemon.name}" class="detalhes-imagem" onerror="this.src='https://via.placeholder.com/200?text=?'">
      <div class="detalhes-tipos">${tipos}</div>
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
        <div class="info-label">Experiência</div>
        <div class="info-valor">${pokemon.base_experience || "N/A"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Habilidades</div>
        <div class="info-valor" style="font-size: 0.9rem">${habilidades}</div>
      </div>
    </div>

    <div class="detalhes-stats">
      <div class="stats-label">Estatísticas Base</div>
      ${stats}
    </div>
  `;

  modalDetalhes.classList.remove("d-none");
}

// --- Fechar Modal ---
function fecharModal() {
  modalDetalhes.classList.add("d-none");
  detalhesContineudo.innerHTML = "";
}
 
// --- Eventos ---
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

// --- Fechar modal ao clicar no botão X ---
btnFecharModal.addEventListener("click", fecharModal);

// --- Fechar modal ao clicar fora (no overlay) ---
modalDetalhes.addEventListener("click", e => {
  if (e.target === modalDetalhes) {
    fecharModal();
  }
});

// --- Adicionar event listener aos cards ---
function adicionarEventosCards() {
  const cards = document.querySelectorAll(".poke-card");
  cards.forEach(card => {
    if (!card.hasListener) {
      card.addEventListener("click", async () => {
        const pokemonId = card.getAttribute("data-pokemon-id");
        if (pokemonId) {
          try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            if (!response.ok) throw new Error("Erro ao carregar detalhes");
            const pokemon = await response.json();
            abrirModalDetalhes(pokemon);
          } catch (e) {
            console.error("Erro:", e);
          }
        }
      });
      card.hasListener = true;
    }
  });
}
 
// --- Iniciar ---
carregarPagina();