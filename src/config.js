// Coveo connection settings, shared by the search page and the detail page.
//
// The access token is an "Anonymous search" API key: it can only run queries
// and push usage analytics, and Coveo classifies it as safe to expose in
// client-side code.
export const coveoConfig = {
  organizationId: 'x1ipzxljbvcvoorg',
  accessToken: 'xx54453122-7020-4915-844f-86e51d140e92',
  // Identifies this app to Coveo: the "Pokemon" query pipeline is selected by
  // a condition on this value, and usage analytics are grouped by it.
  searchHub: 'PokemonSearch',
};
