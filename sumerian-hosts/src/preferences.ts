/**
 * These user preferences are used to store any configuration needed to
 * initialize or use a Sumerian Host.
 *
 * They are intended to be stored with the workspace and persisted between editor sessions --
 * @see getWorkspacePreferences
 */
export interface ISumerianHostPreferences {
  /**
   * The cognito identity pool identifier
   */
  cognitoIdentityPoolId: string;
}

/**
 * The saved preferences (declared inline with default values) for the plugin
 */
const preferences: ISumerianHostPreferences = {
  cognitoIdentityPoolId: '',
};

/**
 * Exports the preferences of the plugin to a dictionary.
 * @returns A dictionary containing the values defined by ISumerianHostPreferences
 */
export const getSumerianHostPreferences = (): ISumerianHostPreferences => ({
  cognitoIdentityPoolId: preferences.cognitoIdentityPoolId,
});

/**
 * Imports the preferences of the plugin from its JSON representation.
 */
export const setSumerianHostPreferences = (
  config: ISumerianHostPreferences
) => {
  preferences.cognitoIdentityPoolId = config.cognitoIdentityPoolId;
};
