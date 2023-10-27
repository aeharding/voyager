const ION_CONTENT_ELEMENT_SELECTOR = "ion-content";

export function findCurrentPage() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const el = document.elementFromPoint(width / 2, height / 2) as Element | null;
  if (!el) return;
  return findClosestIonContent(el);
}

const ION_CONTENT_SELECTOR = `${ION_CONTENT_ELEMENT_SELECTOR}`;

/**
 * Queries the closest element matching the selector for IonContent.
 */
function findClosestIonContent(el: Element) {
  return el.closest<HTMLElement>(ION_CONTENT_SELECTOR);
}
