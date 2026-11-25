import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import './components.js';
import {coveoConfig} from './config.js';

// Register every Atomic custom element (<atomic-search-interface>, etc.).
defineCustomElements();

const searchInterface = document.querySelector('atomic-search-interface');
await customElements.whenDefined('atomic-search-interface');

// Both facets list all of their values, so a search box inside them adds
// nothing. It is on by default, and Atomic deprecates with-search="false" in
// markup, so the property is set here instead.
await customElements.whenDefined('atomic-facet');
for (const facet of document.querySelectorAll('atomic-facet')) {
  facet.withSearch = false;
}

await searchInterface.initialize({
  organizationId: coveoConfig.organizationId,
  accessToken: coveoConfig.accessToken,
  // Coveo's Event Protocol ('next') is only supported for Commerce today, so
  // a search implementation has to log usage analytics in legacy mode.
  analytics: {analyticsMode: 'legacy'},
});

searchInterface.executeFirstSearch();
