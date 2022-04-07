/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */

import {Scene} from 'babylonjs/scene';
import {AssetContainer} from 'babylonjs/assetContainer';
import util from 'util';
import {exec} from 'child_process';

import {HostObject} from '@amazon-sumerian-hosts/babylon';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

class AssetsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class DependenciesNotInstalledError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

/**
 * This class is responsible for the process of adding a Sumerian Host to a workspace,
 * copying over files from the plugin to the workspace as needed.
 */
class SumerianHostAdder {
  // These are all relative to the package.json file of the respective projects
  static relativeAssetsDir = 'assets/gLTF/';

  static relativePluginScriptPath = 'scripts/sumerianhost.ts';

  // BabylonJS Editor expects to find scripts here, in the sense that
  // if you were to create a script in the editor, it would be created here
  static relativeWorkspaceScriptsPath = 'src/scenes/sumerianhost.ts';

  /**
   * The full path to the assets directory from which the host files should be loaded
   */
  assetsDir: string;

  /**
   * The configuration object contains paths to the model, textures,
   * animations, and configuration files that a Sumerian Host needs.
   * See: HostObject
   */
  characterConfig: any;

  /**
   * The identifier of the character we'd like to add to the scene.
   */
  characterId: string;

  /**
   *
   * @param projectDir The absolute path to the project directory
   * @param characterId The identifier of the host we wish to add
   */
  constructor(projectDir: string, characterId: string) {
    this.assetsDir = path.join(projectDir, SumerianHostAdder.relativeAssetsDir);
    SumerianHostAdder.validateAssetsPath(this.assetsDir);

    this.characterConfig = HostObject.getCharacterConfig(
      this.assetsDir,
      characterId
    );

    this.characterId = characterId;
  }

  /**
   * This method validates that the assets directory exists - the assets
   * must be asynchronously downloaded as part of the plugin, and are thus not
   * guaranteed to exist.
   */
  static validateAssetsPath(assetsDir: string) {
    if (!fs.existsSync(assetsDir)) {
      throw new AssetsNotFoundError(
        `Sumerian host assets could not be found at ${assetsDir}`
      );
    }
  }

  static async copyDirectory(fromDir: string, toDir: string) {
    await fs.promises.mkdir(toDir, {recursive: true}); // will create nested directories if they don't exist
    await fs.copy(fromDir, toDir, {
      overwrite: false,
      errorOnExist: false,
    });
  }

  static getAvailableHosts() {
    return HostObject.getAvailableCharacters();
  }

  /**
   * This method runs `npm install` of all required runtime directories on the workspace directory,
   * and copies any necessary files over - assets, scripts, etc.
   * @param pluginDir The absolute path to the directory where the plugin resides
   * @param workSpaceDir The absolute path to the workspace open in the BabylonJS Editor
   * @param runtimeDependencies An object that contains runtime dependencies and their versions as key-value pairs
   */
  public static async prepareWorkspace(
    pluginDir: string,
    workSpaceDir: string,
    runtimeDependencies: {
      [name: string]: string;
    }
  ) {
    try {
      // Check the environment for the path to the interactive shell,
      // which is likely to have $PATH set correctly to find npm.
      // Note that BabylonJS Editor requires npm to be installed locally,
      // so we're reasonably confident it exists.
      const shell =
        process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

      const preparePromises: any[] = [];

      const execPromise = util.promisify(exec);

      // queue up `npm install` commands
      Object.keys(runtimeDependencies).forEach((name) => {
        const version = runtimeDependencies[name];
        preparePromises.push(
          execPromise(`npm install ${name}@${version}`, {
            cwd: workSpaceDir,
            shell,
          })
        );
      });

      // copy runtime script `sumerianhost.ts`
      const pluginScriptPath = path.join(
        pluginDir,
        SumerianHostAdder.relativePluginScriptPath
      );
      const workspaceScriptPath = path.join(
        workSpaceDir,
        SumerianHostAdder.relativeWorkspaceScriptsPath
      );

      preparePromises.push(
        fs.promises.copyFile(pluginScriptPath, workspaceScriptPath)
      );

      // copy assets into the workspace, so that they will be bundled relative to the workspace
      const pluginAssetDir = path.join(
        pluginDir,
        SumerianHostAdder.relativeAssetsDir
      );
      const workspaceAssetDir = path.join(
        workSpaceDir,
        SumerianHostAdder.relativeAssetsDir
      );

      preparePromises.push(
        SumerianHostAdder.copyDirectory(pluginAssetDir, workspaceAssetDir)
      );

      await Promise.all(preparePromises);
    } catch (error) {
      // Ideally we'd like to pass the old error as the cause for the new error,
      // but BabylonJS Editor uses an old version of typescript that doesn't use this field
      // for errors.
      console.log(`Original error's stack: ${error.stack}`);
      throw new DependenciesNotInstalledError(error.message, error);
    }
  }

  /**
   * This method adds the model and textures to the current scene,
   * enabling the host to be rendered
   * @param {Babylon.Scene} scene
   * @returns {Babylon.AssetContainer}
   */
  public async addToScene(scene: Scene) {
    // this renders the host in the current scene
    const characterAsset = await HostObject.loadCharacterMesh(
      scene,
      this.characterConfig.modelUrl
    );

    // rename mesh to something human-readable instead of the default '__root__'
    characterAsset.meshes[0].name = this.characterId;

    return characterAsset;
  }

  /**
   * This method configures the character so that the attached script
   * will be invoked at startup by the Babylon engine.
   *
   * Note that - by current design in the BabylonJS editor - a mesh
   * can only have one script attached to it at a time.
   * @param characterAsset
   */
  public attachInitScriptToHost(characterAsset: AssetContainer) {
    const rootMesh = characterAsset.meshes[0];
    const metadata = rootMesh.metadata ?? {};

    metadata.sumerian = {
      assetsPath: this.assetsDir,
      bindPoseOffsetName: characterAsset.animationGroups[0].name,
      poiConfigPath: this.characterConfig.pointOfInterestConfigUrl,
      gestureConfigPath: this.characterConfig.gestureConfigUrl,
      animClipPaths: this.characterConfig.animUrls,
      lookJoint: this.characterConfig.lookJoint,
    };

    metadata.script = {
      name: SumerianHostAdder.relativeWorkspaceScriptsPath,
    };

    rootMesh.metadata = metadata;
  }
}

export {AssetsNotFoundError, SumerianHostAdder, DependenciesNotInstalledError};
