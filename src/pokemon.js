// Detail page for one Pokémon, built on Coveo Headless without Atomic: the
// page asks the index for a single item by its permanent ID and renders the
// fields it gets back.
import {
  buildResultList,
  buildSearchEngine,
  loadAdvancedSearchQueryActions,
} from '@coveo/headless';
import {coveoConfig} from './config.js';
import {createTypeChips, typeChipStyles} from './type-chips.js';

const DETAIL_FIELDS = [
  'pokemonname',
  'pokemonnumber',
  'pokemonimage',
  'pokemontype',
  'pokemongeneration',
  'pokemonspecies',
  'pokemonheight',
  'pokemonweight',
  'pokemonabilities',
  'pokemontotal',
  'pokemonentry',
];

const statusElement = document.getElementById('status');
const cardElement = document.getElementById('pokemon');

document.adoptedStyleSheets = [...document.adoptedStyleSheets, typeChipStyles];

// Coming from the search page, go back in history so its query and filters
// (kept in the URL hash) are restored.
document.getElementById('back-link').addEventListener('click', (event) => {
  const cameFromThisSite = document.referrer.startsWith(location.origin);
  if (cameFromThisSite && history.length > 1) {
    event.preventDefault();
    history.back();
  }
});

function showStatus(message) {
  statusElement.textContent = message;
  statusElement.hidden = false;
  cardElement.hidden = true;
}

function setText(id, text) {
  const element = document.getElementById(id);
  element.textContent = text ?? '';
  element.hidden = !text;
}

function addFact(list, label, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value;
  list.append(term, description);
}

function renderPokemon(result) {
  const raw = result.raw;
  const name = raw.pokemonname ?? result.title;

  document.title = `${name} · Pokédex Search`;

  const image = document.getElementById('pokemon-image');
  image.src = raw.pokemonimage ?? new URL('placeholder.svg', document.baseURI).href;
  image.alt = `${name} artwork`;

  // Pokémon revealed for an upcoming game have no National Pokédex number yet.
  setText(
    'pokemon-number',
    raw.pokemonnumber ? `#${String(raw.pokemonnumber).padStart(4, '0')}` : ''
  );
  setText('pokemon-name', name);
  setText('pokemon-species', raw.pokemonspecies);
  setText('pokemon-entry', raw.pokemonentry);

  document.getElementById('pokemon-types').replaceChildren(createTypeChips(raw.pokemontype));

  const facts = document.getElementById('pokemon-facts');
  facts.replaceChildren();
  addFact(facts, 'Generation', raw.pokemongeneration?.replace(/^Generation\s+/, ''));
  addFact(facts, 'Height', raw.pokemonheight);
  addFact(facts, 'Weight', raw.pokemonweight);
  addFact(facts, 'Abilities', [raw.pokemonabilities ?? []].flat().join(', '));
  addFact(facts, 'Base stat total', raw.pokemontotal);

  document.getElementById('source-link').href = result.clickUri;

  statusElement.hidden = true;
  cardElement.hidden = false;
}

function loadPokemon(permanentId) {
  const engine = buildSearchEngine({
    configuration: {
      organizationId: coveoConfig.organizationId,
      accessToken: coveoConfig.accessToken,
      search: {searchHub: coveoConfig.searchHub},
      // Looking an item up by ID is not a user search, so it stays out of
      // usage analytics. The click that led here was logged by the search page.
      analytics: {enabled: false},
    },
  });

  const {updateAdvancedSearchQueries} = loadAdvancedSearchQueryActions(engine);
  engine.dispatch(updateAdvancedSearchQueries({aq: `@permanentid=="${permanentId}"`}));

  const resultList = buildResultList(engine, {options: {fieldsToInclude: DETAIL_FIELDS}});
  resultList.subscribe(() => {
    const {firstSearchExecuted, isLoading, hasError, results} = resultList.state;
    if (!firstSearchExecuted || isLoading) {
      return;
    }
    if (hasError) {
      showStatus('The Pokédex could not be reached. Try again in a moment.');
    } else if (results.length === 0) {
      showStatus('No Pokémon matches this link.');
    } else {
      renderPokemon(results[0]);
    }
  });

  engine.executeFirstSearch();
}

// A permanent ID is a hexadecimal digest. Accepting nothing else keeps the
// value safe to place inside a query expression.
const permanentId = new URLSearchParams(location.search).get('id') ?? '';
if (/^[0-9a-f]{16,128}$/i.test(permanentId)) {
  loadPokemon(permanentId);
} else {
  showStatus('No Pokémon matches this link.');
}
