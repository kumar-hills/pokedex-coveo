# Pokédex Search

A search app for the Pokémon on [pokemondb.net](https://pokemondb.net), built on
the Coveo platform: a search page made with
[Atomic](https://docs.coveo.com/en/atomic/latest/) web components and a detail
page made with [Headless](https://docs.coveo.com/en/headless/latest/), bundled
with [Vite](https://vite.dev/).

**Live demo:** https://kumar-hills.github.io/pokedex-coveo/

## What it does

- Searches 1,028 Pokémon pages indexed in a Coveo organization
- Answers questions with an AI-generated answer and its source citations
  (Coveo Relevance Generative Answering)
- Suggests Pokémon names as you type
- Filters by **Type**, **Generation** and **Ability**
- Sorts by relevance, Pokédex number, name or base stat total
- Shows each Pokémon's artwork, name, types and generation in the results
- Opens a detail page for a single Pokémon: number, species, types, Pokédex
  entry, height, weight, abilities and base stat total

## Run it locally

Requires Node 22.12+ or 24.11+.

```sh
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Hosting

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app
and publishes `dist/` to GitHub Pages. The build uses relative asset URLs, so
it runs under the `/pokedex-coveo/` path Pages serves it from.

## How it is put together

| File | Role |
| --- | --- |
| `index.html` | The search page, declared as Atomic markup: search box, facets, sort, result template, pager |
| `src/main.js` | Registers the Atomic components and connects the interface to the Coveo organization |
| `pokemon.html` | The detail page shell |
| `src/pokemon.js` | Builds a Headless engine, fetches one item by its permanent ID and renders its fields |
| `src/config.js` | Organization ID, API key and search hub, shared by both pages |
| `src/components.js` | `<pokemon-types>`, a custom element used in the Atomic result template |
| `src/type-chips.js` | Type chip rendering shared by both pages |
| `src/style.css` | Page chrome, detail page layout and Atomic theme variables |
| `vite.config.js` | Two-page build, and copies Atomic's `lang/` and `assets/` folders into `public/` |
| `coveo/` | Coveo configuration kept with the code (see below) |

The API key in `src/config.js` is a Coveo **Anonymous search** key. It can only
run queries and push usage analytics, and Coveo classifies it as safe to expose
in client-side code.

Search results link to the detail page with the item's `permanentid`. The
detail page looks that item up with an advanced query
(`@permanentid=="<id>"`) and keeps the lookup out of usage analytics, since it
is not a user search.

## Coveo configuration

### Source

A Sitemap source on `https://pokemondb.net/static/sitemaps/pokemondb.xml`. The
sitemap lists about 12,900 URLs; two crawling rules keep only the Pokémon pages:

- Inclusion (regex): `^https://pokemondb\.net/pokedex/[a-z0-9-]+$`
- Exclusion (regex): `^https://pokemondb\.net/pokedex/(all|national|shiny)$`

### Web scraping

[`coveo/web-scraping.json`](coveo/web-scraping.json) is the source's web
scraping configuration. It does two jobs:

- **Cleans the indexed text.** It removes navigation, move tables, sprite
  tables, the locations table, user Q&A links, other-language tables and the
  game labels attached to every Pokédex entry. Before this, a search for
  "pikachu" matched 810 pages because each page names the game
  "Let's Go Pikachu"; it now matches 8.
- **Extracts metadata.** For Pokémon with several forms, type selectors read
  only the first data table, so Charizard is indexed as Fire and Flying and not
  with the types of its Mega forms.

### Fields and mappings

Each field is populated by a source mapping of the form `%[fieldname]`.

| Field | Type | Options | Used for |
| --- | --- | --- | --- |
| `pokemontype` | String | Multi-value facet | Type facet, type chips |
| `pokemongeneration` | String | Facet | Generation facet |
| `pokemonabilities` | String | Multi-value facet | Ability facet, detail page |
| `pokemonimage` | String | | Artwork in results and on the detail page |
| `pokemonname` | String | Sortable | Sort by name, item title |
| `pokemonnumber` | Integer 32 | Sortable | Sort by Pokédex number, detail page |
| `pokemontotal` | Integer 32 | Sortable | Sort by base stat total, detail page |
| `pokemonspecies` | String | | Detail page |
| `pokemonheight` | String | | Detail page |
| `pokemonweight` | String | | Detail page |
| `pokemonentry` | String | | Detail page |

The built-in `title` field is mapped to `%[pokemonname]` first, falling back to
`%[title:crawler]`, so an item is titled "Charizard" and not with the page's
full `<title>` text.

### Query pipeline and search hub

Both pages send the search hub `PokemonSearch`. A query pipeline named
`Pokemon` has the condition "Search Hub is PokemonSearch", so every query from
this app is routed to it. Machine learning models are associated with that
pipeline.

### Machine learning models

All four models are built from the `pokemon-db` source and associated with the
`Pokemon` pipeline.

| Model | Role | Association condition |
| --- | --- | --- |
| Query Suggestions | Type-ahead in the search box | none |
| Semantic Encoder | Vector retrieval, required by the two models below | none |
| Relevance Generative Answering | The generated answer above the results | Query is not empty |
| Passage Retrieval | Passages for the Passage Retrieval API | none |

The RGA condition must use the **Is not empty** operator. Built as "Query is"
with the value "not empty", it reads the same in the console but only matches
a search for those two words, and no answer is ever generated.

### How results are retrieved

A query is matched in two ways, and the matches are ranked together:

1. **Keyword matching.** The index returns pages that contain every word of the
   query. Words are stemmed, so "destroyer" also matches "destroy".
2. **Semantic matching.** The Semantic Encoder compares the meaning of the
   query with the meaning of each page's title and text, and adds pages that
   are close in meaning even when they share no word with the query.

"universe destroyer" shows both at work. No page contains both words, so
keyword matching alone finds nothing: the same query on a pipeline without
models returns 0 results. Through the `Pokemon` pipeline it returns 78. The top
three each contain one of the two words (Cosmoem mentions "universe";
Annihilape and Gyarados mention "destroy"). The ones below, such as Spiritomb
and Darkrai, contain neither and are there for their meaning alone.

This is also why a result count can look high for a simple query: the count
includes the semantic matches.

### When an answer is generated

The RGA model reads passages from the top results and writes an answer only
when those passages contain one. It does not compare all 1,028 pages. A
question such as "which is the strongest pokemon" asks for a ranking that no
single page states (the data is in the `pokemontotal` field), so the model
declines and the page says so, pointing to the sort options. Asking about one
Pokémon, or about something a Pokédex entry describes, gets an answer with its
source cited.

### Query Suggestions

[`coveo/query-suggest-default-queries.csv`](coveo/query-suggest-default-queries.csv)
is the default queries file uploaded to the Query Suggestions model
(`DEFAULT_QUERIES`, language `en`): one Pokémon name per line. It gives the
model suggestions to offer before there is enough usage data to learn from.
