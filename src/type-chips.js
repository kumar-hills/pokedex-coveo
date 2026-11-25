// Type chips, shared by the search results (rendered inside Atomic's shadow
// DOM) and the detail page (rendered in the plain document).

// One dot colour per type. Text stays neutral so every chip is readable.
const TYPE_COLORS = {
  Normal: '#a8a77a',
  Fire: '#ee8130',
  Water: '#6390f0',
  Electric: '#f7d02c',
  Grass: '#7ac74c',
  Ice: '#96d9d6',
  Fighting: '#c22e28',
  Poison: '#a33ea1',
  Ground: '#e2bf65',
  Flying: '#a98ff3',
  Psychic: '#f95587',
  Bug: '#a6b91a',
  Rock: '#b6a136',
  Ghost: '#735797',
  Dragon: '#6f35fc',
  Dark: '#705746',
  Steel: '#b7b7ce',
  Fairy: '#d685ad',
};

// Adopt this sheet wherever the chips are rendered: a shadow root or the document.
export const typeChipStyles = new CSSStyleSheet();
typeChipStyles.replaceSync(`
  .type-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  .type-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.625rem 0.125rem 0.5rem;
    border: 1px solid var(--atomic-neutral, #e5e8e8);
    border-radius: 999px;
    background: var(--atomic-background, #fff);
    color: var(--atomic-on-background, #282829);
    font-size: 0.8125rem;
    line-height: 1.4;
    white-space: nowrap;
  }
  .type-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: var(--dot, #9aa0a6);
  }
`);

// `types` is the value of the multi-value `pokemontype` field: normally an
// array, but a single string is tolerated.
export function createTypeChips(types) {
  const list = document.createElement('span');
  list.className = 'type-chips';

  for (const type of [types ?? []].flat()) {
    const chip = document.createElement('span');
    chip.className = 'type-chip';
    const dot = document.createElement('span');
    dot.className = 'type-dot';
    if (TYPE_COLORS[type]) {
      dot.style.setProperty('--dot', TYPE_COLORS[type]);
    }
    chip.append(dot, type);
    list.append(chip);
  }

  return list;
}
