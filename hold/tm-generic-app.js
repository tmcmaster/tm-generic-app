import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `tm-generic-app`
 * Generic Polymer application that can be configured with application content.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TmGenericApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'tm-generic-app',
      },
    };
  }
}

window.customElements.define('tm-generic-app', TmGenericApp);
