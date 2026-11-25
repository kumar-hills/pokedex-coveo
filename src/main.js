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

// Result links open this app's detail page. Atomic discards link URLs that are
// neither absolute nor root-relative, and an href-template can read values
// from `window`, so the page's absolute URL is published here. Resolving it
// against the current page keeps links right under any hosting path.
window.pokemonDetailPage = new URL('pokemon.html', document.baseURI).href;

await searchInterface.initialize({
  organizationId: coveoConfig.organizationId,
  accessToken: coveoConfig.accessToken,
  // Coveo's Event Protocol ('next') is only supported for Commerce today, so
  // a search implementation has to log usage analytics in legacy mode.
  analytics: {analyticsMode: 'legacy'},
});

searchInterface.executeFirstSearch();
