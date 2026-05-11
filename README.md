# Pokédex

Projeto desenvolvido para a disciplina de Desenvolvimento Web.

## Tecnologias
- HTML5
- CSS3 (custom, sem Bootstrap — menos dependência, mais controle)
- JavaScript (ES Modules)
- PokéAPI (https://pokeapi.co/)

## Funcionalidades
- Listagem paginada de Pokémon (20 por vez)
- Busca por nome com tratamento de erros detalhado
- Tipos com cores específicas por categoria
- Imagem oficial de artwork de alta resolução
- Fallback para imagem quebrada
- Layout responsivo (mobile-first)
- Animação de entrada nos cards

## Arquitetura

O projeto separa responsabilidades em três módulos:

```
js/
├── api.js   → apenas fetch e comunicação com a PokéAPI
├── ui.js    → apenas manipulação do DOM e renderização
└── app.js   → orquestra api.js e ui.js, gerencia o estado
```

### Por que essa separação importa?
- **api.js** pode ser trocado por outro serviço sem tocar na UI
- **ui.js** pode ser testado com dados falsos sem fazer requisições reais
- **app.js** é o único ponto de integração — fica fácil de entender o fluxo

## Como rodar

Por usar ES Modules (`type="module"`), o projeto precisa de um servidor HTTP local.

```bash
# Com Python
python -m http.server 8000

# Com Node.js (npx)
npx serve .
```

Depois acesse `http://localhost:8000`.

> ⚠️ Abrir o `index.html` diretamente no navegador (protocolo `file://`) não funciona com ES Modules por restrições de CORS.
