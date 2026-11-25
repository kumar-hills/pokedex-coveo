import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import './components.js';
import {coveoConfig} from './config.js';

// Register every Atomic custom element (<atomic-search-interface>, etc.).
defineCustomElements();

const searchInterface = document.querySelector('atomic-search-interface');
await customElements.whenDefined('atomic-search-interface');

// The Type and Generation facets list all of their values, so a search box
// inside them adds nothing. It is on by default, and Atomic deprecates
// with-search="false" in markup, so the property is set here instead.
await customElements.whenDefined('atomic-facet');
for (const facet of document.querySelectorAll('atomic-facet[data-lists-all-values]')) {
  facet.withSearch = false;
}

searchInterface.searchHub = coveoConfig.searchHub;

// Atomic discards link and image URLs that are neither absolute nor
// root-relative, and the app may be hosted under a sub-path. Both URLs below
// are therefore resolved against the current page into absolute ones.
const fromThisPage = (path) => new URL(path, document.baseURI).href;

// Result links open this app's detail page. An href-template can read values
// from `window`, so the page's URL is published there.
window.pokemonDetailPage = fromThisPage('pokemon.html');

// Image shown when a Pokémon's artwork is missing or fails to load.
for (const template of document.querySelectorAll('atomic-result-template template')) {
  for (const image of template.content.querySelectorAll('atomic-result-image')) {
    image.setAttribute('fallback', fromThisPage('placeholder.svg'));
  }
}

await searchInterface.initialize({
  organizationId: coveoConfig.organizationId,
  accessToken: coveoConfig.accessToken,
  // Coveo's Event Protocol ('next') is only supported for Commerce today, so
  // a search implementation has to log usage analytics in legacy mode.
  analytics: {analyticsMode: 'legacy'},
});

searchInterface.executeFirstSearch();
