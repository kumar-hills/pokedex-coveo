// Custom element used inside Atomic result templates. It asks Atomic for the
// result it is rendered in, then draws that result's types.
//
// `resultContext` carries a deprecation note aimed at Coveo's own components.
// The replacement it names is not exported by @coveo/atomic 3.66, so this
// remains the public way for a custom element to read its result.
import {resultContext} from '@coveo/atomic';
import {createTypeChips, typeChipStyles} from './type-chips.js';

class PokemonTypes extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'}).adoptedStyleSheets = [typeChipStyles];
  }

  async connectedCallback() {
    try {
      const result = await resultContext(this);
      this.shadowRoot.replaceChildren(createTypeChips(result.raw.pokemontype));
    } catch (error) {
      console.error('<pokemon-types> must be used inside a result template.', error);
    }
  }
}

customElements.define('pokemon-types', PokemonTypes);
