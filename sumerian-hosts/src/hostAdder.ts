/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */

import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {AssetContainer, Material, Scene, SceneLoader, Texture} from 'babylonjs';
import path from 'path';
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

  public static getAvailableHosts() {
    return HostObject.getAvailableCharacters();
  }

  /**
   * This method adds the model and textures to the current scene,
   * enabling the host to be rendered and exported
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

    // the workspace assets dir is intended to be found one directory above the host assets
    const workspaceAssetsDir = path.join(this.assetsDir, '..');

    this.fixTextures(workspaceAssetsDir, characterAsset.textures);
    this.fixMaterials(workspaceAssetsDir, characterAsset.materials);

    characterAsset.addAllToScene();

    return characterAsset;
  }

  /**
   * The editor expects the properties of textures that point to where they're
   * stored to be relative paths that are based off the workspace's asset directory,
   * rather than the absolute ones that the default SceneLoader sets.
   *
   * @param workspaceAssetsDir The absolute path to the workspace's assets directory
   * @param textures The array of textures to be fixed
   */
  // eslint-disable-next-line class-methods-use-this
  private async fixTextures(workspaceAssetsDir: string, textures: any[]) {
    textures.forEach((tex: Texture) => {
      if (tex.url) {
        // the url is prefixed with 'data:' which we want to get rid of
        // to find the absolute path to the texture directory
        const textureDir = tex.url.split(':')[1];

        const relativeTextureDir = path.dirname(
          path.relative(workspaceAssetsDir, textureDir)
        );

        const textureFileName = path.basename(tex.url);
        const relativeTexturePath = path.join(
          relativeTextureDir,
          textureFileName
        );

        // the editor will call path.exists on the name property
        tex.name = relativeTexturePath;
        // the texture will then be loaded from the url
        tex.url = relativeTexturePath;
      }
    });
  }

  /**
   * The editor expects certain pieces of metadata on materials to be set in order for it to
   * export and then re-import them correctly.
   * @param workspaceAssetsDir The absolute path to the workspace's assets directory
   * @param materials The array of materials to be fixed
   */
  private async fixMaterials(
    workspaceAssetsDir: string,
    materials: Material[]
  ) {
    // the model file points to textures stored in a subdirectory called 'textures'
    // this will be the absolute path to that directory
    const textureDirectory = path.join(
      path.dirname(this.characterConfig.modelUrl),
      'textures'
    );

    const relTextureDirectory = path.relative(
      workspaceAssetsDir,
      textureDirectory
    );

    materials.forEach((material: Material) => {
      material.metadata ??= {};
      // if this metadata property is not set, the editor
      // will not export the material
      material.metadata.editorPath = path.join(
        relTextureDirectory,
        `${material.name}.material`
      );
    });
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
