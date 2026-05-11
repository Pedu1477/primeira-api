const BASE_URL = "https://pokeapi.co/api/v2";
 
export async function listarPokemons(limit = 20, offset = 0) {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
 
export async function buscarPokemonPorNome(nome) {
  const res = await fetch(`${BASE_URL}/pokemon/${nome.toLowerCase().trim()}`);
  if (res.status === 404) throw new Error("Pokémon não encontrado.");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
 
export async function carregarDetalhes(urls) {
  const promises = urls.map(url =>
    fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
  );
  return Promise.all(promises);
}
 