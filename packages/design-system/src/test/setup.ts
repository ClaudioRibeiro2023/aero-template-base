import '@testing-library/jest-dom'

/**
 * jsdom não implementa as APIs de observação/ponteiro que primitivas com
 * posicionamento flutuante (Radix Popover/Tooltip via floating-ui) usam ao
 * montar o conteúdo. Polyfills guardados para que componentes como
 * InfoTooltip/InfoPopover possam abrir em testes. Idempotente.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
}
