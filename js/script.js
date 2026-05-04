const lista = document.getElementById("lista");
const loading = document.getElementById("loading");
const erro = document.getElementById("erro");

async function carregarPokemons() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");

    if (!res.ok) throw new Error();

    const data = await res.json();

    const detalhesPromises = data.results.map(p =>
      fetch(p.url).then(res => res.json())
    );

    const pokemons = await Promise.all(detalhesPromises);

    lista.innerHTML = "";

    pokemons.forEach(dados => {
      lista.innerHTML += `
        <div class="col-md-3 mb-4">
          <div class="card text-center">
            <img src="${dados.sprites.front_default}" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${dados.name}</h5>
              <p>Altura: ${dados.height}</p>
              <p>Peso: ${dados.weight}</p>
            </div>
          </div>
        </div>
      `;
    });

  } catch (e) {
    erro.classList.remove("d-none");
    erro.innerText = "Erro ao carregar dados 😢";
  } finally {
    loading.style.display = "none";
  }
}

carregarPokemons();