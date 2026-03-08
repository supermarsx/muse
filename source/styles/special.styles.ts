/**
 * CSS styles for the go-to-top and go-to-bottom navigation buttons.
 * @module styles/special
 */

/** CSS string for the navigation button styling. */
export const buttonGoToTopAndBottomStyle: string = `
.fast-shortcut {
  width: 40px;
  height: 40px;
  display: block;
  position: fixed;
  bottom: 20px;
  z-index: 99;
  font-size: 25px;
  outline: none;
  background-color: #FFFFFF;
  color: #000000;
  cursor: pointer;
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.fast-shortcut:hover {
  background-color: #f0f0f0;
}

.fast-shortcut.first-button {
  right: 30px;
}

.fast-shortcut.second-button {
  right: 75px;
}
`;
