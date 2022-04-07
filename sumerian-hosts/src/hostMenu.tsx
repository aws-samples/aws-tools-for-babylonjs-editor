import React from 'react';
import {MenuItem} from '@blueprintjs/core';
// eslint-disable-next-line import/no-unresolved
import {Editor} from 'babylonjs-editor';

import {
  AssetsNotFoundError,
  addHostToScene,
  getAvailableHosts,
} from './hostUtils';

/**
 * The configuration that the Sumerian 'add host' menu should be initialized with
 */
interface ISumerianAddHostMenuProps {
  /**
   * A reference to the BabylonJS Editor object
   * @see {@link Editor}
   */
  editor: Editor;

  /**
   * The absolute path to where the plugin package is found.
   */
  pluginPath: string;
}

/**
 * This dialog component shows buttons that, when pressed, will add a Sumerian
 * host to the scene currently open in the editor.
 */
export default class SumerianAddHostMenu extends React.Component<ISumerianAddHostMenuProps> {
  availableHosts: string[];

  public constructor(props) {
    super(props);
    this.availableHosts = getAvailableHosts();
  }

  private _handleAddClick = async (event) => {
    const {editor, pluginPath} = this.props;
    const currentScene = editor.scene;
    const selectedCharacter = event.target.textContent;

    if (currentScene) {
      try {
        await addHostToScene(currentScene, pluginPath, selectedCharacter);
      } catch (error) {
        switch (error.constructor) {
          case AssetsNotFoundError:
            editor.console.logError(error.message);
            break;
          default:
            throw error;
        }
      }

      editor.graph.refresh();
    }
  };

  public render(): React.ReactNode {
    return (
      <MenuItem icon="new-object" text="Add host">
        {this.availableHosts.map((characterId) => (
          <MenuItem
            key={`add-${characterId}`}
            text={characterId}
            onClick={this._handleAddClick}
          />
        ))}
      </MenuItem>
    );
  }
}
