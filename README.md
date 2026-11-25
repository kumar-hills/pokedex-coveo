# Pokédex Search

A search page for the Pokémon on [pokemondb.net](https://pokemondb.net), built
with [Coveo Atomic](https://docs.coveo.com/en/atomic/latest/) web components and
bundled with [Vite](https://vite.dev/).

## What it does

- Searches 1,028 Pokémon pages indexed in a Coveo organization
- Filters by **Type** and by **Generation**
- Shows each Pokémon's artwork, name, types and generation in the results

## Run it locally

Requires Node 22.12+ or 24.11+.

```sh
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## How it is put together

| File | Role |
| --- | --- |
| `index.html` | The search experience, declared as Atomic markup: search box, facets, result template, pager |
| `src/main.js` | Registers the Atomic components and connects the interface to the Coveo organization |
| `src/config.js` | Organization ID and API key |
| `src/components.js` | Two small custom elements used in the result template: `<pokemon-name>` and `<pokemon-types>` |
| `src/style.css` | Page chrome and Atomic theme variables |
| `vite.config.js` | Copies Atomic's `lang/` and `assets/` folders into `public/`, where Atomic loads them from at runtime |

The API key in `src/config.js` is a Coveo **Anonymous search** key. It can only
run queries and push usage analytics, and Coveo classifies it as safe to expose
in client-side code.

## Coveo configuration

- **Source**: a Sitemap source on `https://pokemondb.net/static/sitemaps/pokemondb.xml`.
  An inclusion rule keeps only `/pokedex/<name>` pages and an exclusion rule
  drops the three listing pages (`all`, `national`, `shiny`).
- **Web scraping**: removes navigation, move tables and sprite tables from the
  indexed body, and extracts three pieces of metadata per page.
- **Fields**: `pokemontype` (multi-value facet), `pokemongeneration` (facet),
  `pokemonimage` (displayable), each populated by a source mapping.
- **Search hub**: `PokemonSearch`, set on `<atomic-search-interface>`.
