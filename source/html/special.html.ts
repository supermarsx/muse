/**
 * Special (html)
 */


export const buttonGoToTopAndBottomHtml: string = `
    <button onclick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0;" class="fast-shortcut first-button" title="Go to top">↑</button>
    <button onclick="document.body.scrollTop = document.body.scrollHeight; document.documentElement.scrollTop = document.body.scrollHeight;" class="fast-shortcut second-button" title="Go to bottom">↓</button>
    `;