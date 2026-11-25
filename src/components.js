// Small custom elements used inside Atomic result templates. Each one asks
// Atomic for the result it is rendered in, then draws from that result's data.
import {resultContext} from '@coveo/atomic';

// The indexed title is the page's <title> tag, for example
// "Charizard Pokédex: stats, moves, evolution & locations | Pokémon Database".
// Only the name in front of " Pokédex:" is worth showing.
const TITLE_SUFFIX = /\s+Pokédex:.*$/u;

export function pokemonName(result) {
  return (result.title ?? '').replace(TITLE_SUFFIX, '').trim();
}

class PokemonName extends HTMLElement {
  async connectedCallback() {
    try {
      this.textContent = pokemonName(await resultContext(this));
    } catch (error) {
      console.error('<pokemon-name> must be used inside a result template.', error);
    }
  }
}

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

const typeChipStyles = new CSSStyleSheet();
typeChipStyles.replaceSync(`
  :host {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  .chip {
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
  .dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: var(--dot, #9aa0a6);
  }
`);

class PokemonTypes extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'}).adoptedStyleSheets = [typeChipStyles];
  }

  async connectedCallback() {
    let result;
    try {
      result = await resultContext(this);
    } catch (error) {
      console.error('<pokemon-types> must be used inside a result template.', error);
      return;
    }

    // A multi-value field comes back as an array; tolerate a single string.
    const types = [result.raw.pokemontype ?? []].flat();
    this.shadowRoot.replaceChildren(
      ...types.map((type) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (TYPE_COLORS[type]) {
          dot.style.setProperty('--dot', TYPE_COLORS[type]);
        }
        chip.append(dot, type);
        return chip;
      })
    );
  }
}

customElements.define('pokemon-name', PokemonName);
customElements.define('pokemon-types', PokemonTypes);
