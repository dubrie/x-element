import { assert, it } from '../../../@netflix/x-test/x-test.js';
import TestElement from './fixture-element-upgrade.js';

const setupEl = el => {
  el.className = 'marsupialia';
  el.readOnlyProperty = 'chlamyphoridae';
  el[Symbol.for('readOnlyKey')] = 'dasypodidae';
  el.reflectedProperty = 'plantigrade';
};

const hasNotUpgraded = el => {
  return (
    el instanceof HTMLElement &&
    el instanceof TestElement === false &&
    el.shadowRoot === null &&
    el.getAttribute('class') === 'marsupialia' &&
    el.readOnlyProperty === 'chlamyphoridae' &&
    el[Symbol.for('readOnlyKey')] === 'dasypodidae' &&
    el.readOnlyDefinedProperty === undefined &&
    el.reflectedProperty === 'plantigrade' &&
    el.getAttribute('reflected-property') === null
  );
};

const hasUpgraded = el => {
  // Properties are still shadowed after upgrade and before initialization.
  return (
    el instanceof TestElement &&
    el.getAttribute('class') === 'marsupialia' &&
    el.readOnlyProperty === 'didelphidae' &&
    el[Symbol.for('readOnlyKey')] === 'didelphimorphia' &&
    el.readOnlyDefinedProperty === 'phalangeriformes' &&
    el.reflectedProperty === 'plantigrade' &&
    el.getAttribute('reflected-property') === 'plantigrade'
  );
};

it('x-element upgrade lifecycle', () => {
  const localName = 'test-element-upgrade';
  assert(
    customElements.get(localName) === undefined,
    'localName is initially undefined'
  );

  const el1 = document.createElement(localName);
  el1.id = 'el1';
  setupEl(el1);
  document.body.appendChild(el1);

  const el2 = document.createElement(localName);
  el2.id = 'el2';
  setupEl(el2);

  assert(
    el1.localName === localName &&
      document.getElementById('el1') === el1 &&
      hasNotUpgraded(el1),
    'el1 is setup as expected'
  );

  assert(
    el1.localName === localName &&
      document.getElementById('el2') === null &&
      hasNotUpgraded(el2),
    'el2 is setup as expected'
  );

  customElements.define(localName, TestElement);

  const el3 = document.createElement(localName);
  el3.id = 'el3';
  el3.className = 'marsupialia';
  el3.reflectedProperty = 'plantigrade';

  const el4 = new TestElement();
  el4.id = 'el4';
  el4.className = 'marsupialia';
  el4.reflectedProperty = 'plantigrade';

  assert(
    hasUpgraded(el3) && hasUpgraded(el4),
    'elements created after definition do not need upgrading'
  );

  assert(hasUpgraded(el1), 'element in document is upgraded upon definition');
  assert(
    el1.shadowRoot.textContent === 'didelphidae',
    'element in document synchronously renders'
  );

  assert(hasNotUpgraded(el2), 'element out of document is still not upgraded');
  document.body.appendChild(el2);
  assert(
    el2.shadowRoot.textContent === 'didelphidae',
    'element out of document upgrades/renders after being added'
  );

  document.body.appendChild(el3);
  assert(
    el3.shadowRoot.textContent === 'didelphidae',
    'element created after definition upgrades/renders after being added'
  );
});
