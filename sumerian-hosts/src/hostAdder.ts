/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */

import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {AssetContainer, Scene, SceneLoader} from 'babylonjs';
import {validateAssetsPath} from './workspace';

/**
 * This class is responsible for the process of adding a Sumerian Host to a workspace,
 * copying over files from the plugin to the workspace as needed.
 */
class SumerianHostAdder {
  /**
   * The full path to the assets directory from which the Host files should be loaded
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
   * @param projectDir The absolute path to the assets directory
   * @param characterId The identifier of the Host we wish to add
   */
  constructor(assetsDir: string, characterId: string) {
    this.assetsDir = assetsDir;
    validateAssetsPath(this.assetsDir);

    this.characterConfig = HostObject.getCharacterConfig(
      this.assetsDir,
      characterId
    );

    this.characterId = characterId;
  }

  static getAvailableHosts() {
    return HostObject.getAvailableCharacters();
  }

  /**
   * This method adds the model and textures to the current scene,
   * enabling the host to be rendered
   * @param {Babylon.Scene} scene
   * @returns {Babylon.AssetContainer}
   */
  public async addToScene(scene: Scene) {
    // this renders the Host in the current scene
    const characterAsset = await SceneLoader.LoadAssetContainerAsync(
      this.characterConfig.modelUrl,
      undefined,
      scene
    );

    // rename mesh to something human-readable instead of the default '__root__'
    characterAsset.meshes[0].name = this.characterId;

    characterAsset.addAllToScene();

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
  public attachInitScriptToHost(
    characterAsset: AssetContainer,
    scriptPath: string
  ) {
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
      name: scriptPath,
    };

    rootMesh.metadata = metadata;
  }
}

export {SumerianHostAdder};
