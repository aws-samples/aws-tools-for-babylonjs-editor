/**
 * @module
 * A set of utility functions for working with the browser DOM.
 */

/**
 * Makes the specified UI screen visible and hides all other UI screens.
 * @param {string} id HTMLElement id of the screen to display.
 */
export function showUiScreen(id: string) {
  document.querySelectorAll('#uiScreens .screen').forEach(element => {
    const isTargetScreen = element.id === id;
    setElementVisibility(element.id, isTargetScreen);
  });
}

/**
 * Shows or hides an HTML element.
 * @param {string} id HTMLElement id
 * @param {boolean} visible `true` shows the element. `false` hides it.
 */
export function setElementVisibility(id: string, visible: boolean) {
  const element = document.getElementById(id);
  if (visible) {
    element.classList.remove('hide');
  } else {
    element.classList.add('hide');
  }
}

export default {
    showUiScreen,
    setElementVisibility,
}