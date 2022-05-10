// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable class-methods-use-this */

import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {AssetContainer, Scene, SceneLoader} from 'babylonjs';
import {Editor, SceneImporterTools} from 'babylonjs-editor';
import path from 'path';
import {
  RELATIVE_ASSETS_DIR,
  RELATIVE_GLTF_ASSETS_DIR,
  validateAssetsPath,
} from './workspace';

/**
 * This class is responsible for the process of adding a Sumerian Host to a workspace,
 * copying over files from the plugin to the workspace as needed.
 */
class SumerianHostAdder {
  /**
   * The full path to the GLTF assets directory from which the Host files should be loaded
   */
  gLTFAssetsDir: string;

  workSpaceAssetsDir: string;

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
   * @param workspaceDir The absolute path to the workspace directory
   * @param characterId The identifier of the Host we wish to add
   */
  constructor(workSpaceDir: string, characterId: string) {
    this.workSpaceAssetsDir = path.join(workSpaceDir, RELATIVE_ASSETS_DIR);
    this.gLTFAssetsDir = path.join(workSpaceDir, RELATIVE_GLTF_ASSETS_DIR);
    validateAssetsPath(this.gLTFAssetsDir);

    this.characterConfig = HostObject.getCharacterConfig(
      this.gLTFAssetsDir,
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
  public async addToScene(scene: Scene, editor: Editor) {
    const absModelPath = this.characterConfig.modelUrl;
    const relModelPath = path.relative(this.workSpaceAssetsDir, absModelPath);

    // this renders the Host in the current scene
    const characterAsset = await SceneLoader.LoadAssetContainerAsync(
      this.characterConfig.modelUrl,
      undefined,
      scene
    );

    // rename mesh to something human-readable instead of the default '__root__'
    characterAsset.meshes[0].name = this.characterId;

    characterAsset.addAllToScene();

    // the editor expects the mesh to be configured a certain way, so that
    // saving and reloading the scene will work
    await SceneImporterTools.Configure(scene, {
      isGltf: true,
      relativePath: relModelPath,
      absolutePath: absModelPath,
      editor,
      result: characterAsset,
    });

    return characterAsset;
  }

  /**
   * This method takes a configuration object of absolute paths to animation files,
   * and returns the same object where the paths are instead relative to the workspace
   * directory
   * @param {Object} animUrls An object where the key-value pairs point to absolute paths
   *                          to animation files
   * @returns {Object} An object where the key-value pairs point to relative paths
   *                   to animation files
   */
  private convertToRelativeAnimationPaths(animUrls) {
    const relativeAnimUrls = {};
    Object.keys(animUrls).forEach((key) => {
      const relAnimationPath = this.getWorkspaceRelativePath(
        this.characterConfig.animUrls[key]
      );
      relativeAnimUrls[key] = relAnimationPath;
    });
    return relativeAnimUrls;
  }

  private getWorkspaceRelativePath(absolutePath: string) {
    const workspaceDir = path.join(this.workSpaceAssetsDir, '..');
    return path.relative(workspaceDir, absolutePath);
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
    const editorMetadata = metadata.editor ?? {};

    // This version of the Sumerian metadata includes absolute paths to local files --
    // these can be loaded by an application, such as the BabylonJS Editor
    editorMetadata.sumerian = {
      bindPoseOffsetName: characterAsset.animationGroups[0].name,
      poiConfigPath: this.characterConfig.pointOfInterestConfigUrl,
      gestureConfigPath: this.characterConfig.gestureConfigUrl,
      animClipPaths: this.characterConfig.animUrls,
      lookJoint: this.characterConfig.lookJoint,
      pollyConfig: {
        voice: SumerianHostAdder.selectPollyVoiceFromPath(
          this.characterConfig.modelUrl
        ),
        engine: 'neural',
        language: 'en-US',
      },
    };
    metadata.editor = editorMetadata;

    // This version of the metadata converts the paths to be relative to the workspace,
    // so that they can be served by a running server.
    // First, let's make a deep copy
    metadata.sumerian = {
      ...editorMetadata.sumerian,
      animClipPaths: {...editorMetadata.sumerian.animClipPaths},
      pollyConfig: {...editorMetadata.sumerian.pollyConfig},
    };
    metadata.sumerian.animClipPaths = this.convertToRelativeAnimationPaths(
      this.characterConfig.animUrls
    );
    metadata.sumerian.gestureConfigPath = this.getWorkspaceRelativePath(
      this.characterConfig.gestureConfigUrl
    );
    metadata.sumerian.poiConfigPath = this.getWorkspaceRelativePath(
      this.characterConfig.pointOfInterestConfigUrl
    );

    // This indicates to the BabylonJS editor to instantiate and run
    // this script at scene start
    metadata.script = {
      name: scriptPath,
    };

    rootMesh.metadata = metadata;
  }

  private static selectPollyVoiceFromPath(pathToCharacter: string): string {
    if (pathToCharacter.includes('_male')) {
      return 'Matthew';
    }

    return 'Joanna';
  }
}

export {SumerianHostAdder};
