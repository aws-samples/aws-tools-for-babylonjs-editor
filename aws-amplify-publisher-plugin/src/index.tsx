// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-unresolved
import {Editor, IPlugin} from 'babylonjs-editor';

import {AmplifyPublisherToolbar} from './toolbar';
import {
  AmplifyPublishingPreferences,
  getAmplifyPublishingPreferences,
  setAmplifyPublishingPreferences,
} from './preferences';

/**
 * Registers the plugin by returning the IPlugin content.
 * @param editor defines the main reference to the editor.
 * @returns an object that implements IPlugin
 */
export const registerEditorPlugin = (editor: Editor): IPlugin => ({
  /**
   * Defines the list of all toolbar elements to add when the plugin has been loaded.
   */
  toolbar: [
    {
      buttonLabel: 'AWS Amplify Publisher Tools',
      buttonIcon: 'export',
      content: <AmplifyPublisherToolbar editor={editor} />,
    },
  ],

  /**
   * This will return a dictionary that will be saved as JSON
   * in the workspace file. This will be typically used to store preferences of the plugin
   * work a given workspace and not globally.
   * The preferences will be saved in the .editorworkspace file each time the user
   * saves the project.
   */
  getWorkspacePreferences: () => getAmplifyPublishingPreferences(),

  /**
   * When the plugin is loaded, this function will be called,
   * giving the plain JSON representation of the user's preferences for
   * the current plugin.
   */
  setWorkspacePreferences: (preferences: AmplifyPublishingPreferences) => {
    setAmplifyPublishingPreferences(preferences);
  },
});
