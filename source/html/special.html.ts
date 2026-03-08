/**
 * HTML template for go-to-top and go-to-bottom navigation buttons.
 * @module html/special
 */

/** HTML string for the top/bottom navigation buttons. */
export const buttonGoToTopAndBottomHtml: string = `
  <button
    onclick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0;"
    class="fast-shortcut first-button"
    title="Go to top"
  >&#8593;</button>
  <button
    onclick="document.body.scrollTop = document.body.scrollHeight; document.documentElement.scrollTop = document.body.scrollHeight;"
    class="fast-shortcut second-button"
    title="Go to bottom"
  >&#8595;</button>
`;
