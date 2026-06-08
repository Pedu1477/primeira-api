export function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const TIPO_CORES = {
  fire: "#FF6B35", water: "#4FC3F7", grass: "#81C784",
  electric: "#FFD54F", psychic: "#F48FB1", ice: "#80DEEA",
  dragon: "#7E57C2", dark: "#546E7A", fairy: "#F06292",
  fighting: "#EF5350", flying: "#90CAF9", poison: "#AB47BC",
  ground: "#BCAAA4", rock: "#8D6E63", bug: "#AED581",
  ghost: "#7E57C2", steel: "#B0BEC5", normal: "#9E9E9E",
};

export const TIPO_BG = {
  fire: "#2d1a0e", water: "#0d1f2d", grass: "#0d2010",
  electric: "#2d2600", psychic: "#2d1020", ice: "#0d2428",
  dragon: "#1a1030", dark: "#12181c", fairy: "#2d1020",
  fighting: "#2d0e0e", flying: "#0e1828", poison: "#1e0d2a",
  ground: "#2a1e18", rock: "#1e1612", bug: "#1a2210",
  ghost: "#1a1030", steel: "#1c2228", normal: "#1e1e1e",
};

export function renderizarCard(dados) {
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
      <div class="poke-card" style="--tipo-cor: ${cor}; --tipo-bg: ${bg}" data-tipo="${tipo}" data-pokemon-id="${dados.id}">
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

export function mostrarErro(elemento, mensagem) {
  elemento.classList.remove("d-none");
  elemento.innerHTML = `<span>⚠️ ${mensagem}</span>`;
}

export function limparErro(elemento) {
  elemento.classList.add("d-none");
  elemento.innerText = "";
}

export function setLoading(elemento, visivel) {
  elemento.style.display = visivel ? "block" : "none";
}
