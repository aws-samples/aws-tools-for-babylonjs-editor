// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * These user preferences are used to configure various aspects of the Amplify application.
 *
 * They are intended to be stored with the workspace and persisted between editor sessions --
 * @see getWorkspacePreferences
 */
export type AmplifyPublishingPreferences = {
  /**
   * The unique Amplify application identifier
   */
  appName: string;

  /**
   * The environment name
   */
  envName: string;
};

/**
 * The saved preferences (declared inline with default values) for the plugin
 */
const preferences: AmplifyPublishingPreferences = {
  appName: '',
  envName: '',
};

/**
 * Exports the preferences of the plugin to a dictionary.
 * @returns A dictionary containing the values defined by AmplifyPublishingPreferences
 */
export const getAmplifyPublishingPreferences =
  (): AmplifyPublishingPreferences => ({...preferences});

/**
 * Imports the preferences of the plugin from its JSON representation.
 */
export const setAmplifyPublishingPreferences = (
  config: AmplifyPublishingPreferences
) => {
  preferences.appName = config.appName;
  preferences.envName = config.envName;
};
