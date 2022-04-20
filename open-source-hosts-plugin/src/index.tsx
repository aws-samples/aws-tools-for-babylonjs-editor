// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.
// eslint-disable-next-line import/no-unresolved
import {Editor, IPlugin, IPluginConfiguration} from 'babylonjs-editor';
// We need to call this when the plugin is loaded so that the required file loaders
// (specifically for gltf) are properly loaded into the engine.
import 'babylonjs-loaders';
import * as React from 'react';
import OpenSourceHostsToolbar from './toolbar';

/**
 * Registers the plugin by returning the IPlugin content.
 * @param editor defines the main reference to the editor.
 * @param configuration defines the configuration of the plugin: its path, etc.).
 * @returns an object that implements IPlugin
 */
// The BabylonJS editor calls require(), which expects this function to be exported this way
// eslint-disable-next-line import/prefer-default-export
export const registerEditorPlugin = (
  editor: Editor,
  configuration: IPluginConfiguration
): IPlugin => ({
  /**
   * Defines the list of all toolbar elements to add when the plugin has been loaded.
   */
  toolbar: [
    {
      buttonLabel: 'Open Source Hosts Tools',
      buttonIcon: 'export',
      content: (
        <OpenSourceHostsToolbar
          editor={editor}
          pluginPath={configuration.pluginAbsolutePath}
        />
      ),
    },
  ],
});
