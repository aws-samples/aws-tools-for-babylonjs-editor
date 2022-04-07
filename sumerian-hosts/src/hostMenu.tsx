/* eslint-disable import/no-unresolved */
import React from 'react';
import {MenuItem} from '@blueprintjs/core';
import {Editor, WorkSpace, SceneExporter} from 'babylonjs-editor';

import {
  AssetsNotFoundError,
  DependenciesNotInstalledError,
  SumerianHostAdder,
} from './hostAdder';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const configuration = require('../config/SceneRequirements.json');

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

export default class SumerianAddHostMenu extends React.Component<ISumerianAddHostMenuProps> {
  availableHosts: string[];

  public constructor(props) {
    super(props);
    this.availableHosts = SumerianHostAdder.getAvailableHosts();
  }

  private _handleAddClick = async (event) => {
    const {editor, pluginPath} = this.props;
    const currentScene = editor.scene;
    const selectedCharacter = event.target.textContent;

    const addHostProgress = editor.addTaskFeedback(100, 'Adding Sumerian Host');

    if (currentScene) {
      try {
        editor.updateTaskFeedback(
          addHostProgress,
          0,
          'Adding dependencies to scene'
        );
        const workSpaceDir = WorkSpace.DirPath ?? '';
        await SumerianHostAdder.prepareWorkspace(
          pluginPath,
          workSpaceDir,
          configuration.runtimeDependencies
        );

        editor.updateTaskFeedback(addHostProgress, 15, 'Validating assets');
        const hostAdder = new SumerianHostAdder(
          workSpaceDir,
          selectedCharacter
        );

        editor.updateTaskFeedback(addHostProgress, 25, 'Adding host to scene');
        const characterAsset = await hostAdder.addToScene(currentScene);

        editor.updateTaskFeedback(
          addHostProgress,
          50,
          'Attaching initialization script to host'
        );
        hostAdder.attachInitScriptToHost(characterAsset);

        editor.updateTaskFeedback(addHostProgress, 75, 'Updating editor');

        // update script mapping; this gets done automatically when the user hits 'play'
        // as the scene auto-saves (exports) before it runs, but we want to update ASAP
        // so that the scene code-base (which has the script mapping copied into it) reflects the changes
        await SceneExporter.GenerateScripts(editor);

        editor.updateTaskFeedback(
          addHostProgress,
          100,
          'Successfully added Sumerian host'
        );
      } catch (error) {
        let errorMessage =
          'An error has occurred while adding a Sumerian Host. See next line for details:';
        let errorStatus = 'An error has occurred while adding a Sumerian Host';
        switch (error.constructor) {
          case AssetsNotFoundError:
            errorMessage =
              'An error has occurred while initializing a Sumerian Host; the assets could not be found. Were they downloaded correctly when this plugin was installed?';
            errorStatus =
              'An error has ocurred while initializing a Sumerian Host';
            break;
          case DependenciesNotInstalledError:
            errorMessage =
              'An error has occurred while installing necessary npm dependencies in your workspace.';
            errorStatus = 'An error has ocurred while preparing the workspace';
            break;
          default:
            break;
        }

        console.log(error);
        editor.console.logError(errorMessage);
        editor.console.logError(error.message);
        editor.updateTaskFeedback(addHostProgress, 0, errorStatus);
      } finally {
        editor.graph.refresh(); // update editor's scene graph to show the new host node
        editor.closeTaskFeedback(addHostProgress, 15000);
      }
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
