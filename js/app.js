import { listarPokemons, buscarPokemonPorNome, carregarDetalhes } from "./api.js";
import { renderizarCard, mostrarErro, limparErro, setLoading } from "./ui.js";
 
// --- Elementos do DOM ---
const lista   = document.getElementById("lista");
const loading = document.getElementById("loading");
const erro    = document.getElementById("erro");
const btnMais = document.getElementById("btn-mais");
const inputBusca  = document.getElementById("busca");
const btnBuscar   = document.getElementById("btn-buscar");
const btnLimpar   = document.getElementById("btn-limpar");
 
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
 
// --- Iniciar ---
carregarPagina();