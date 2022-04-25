// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable class-methods-use-this */

import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {
  AssetContainer,
  Material,
  Scene,
  SceneLoader,
  Skeleton,
  Texture,
} from 'babylonjs';
import {Tools} from 'babylonjs-editor';
import {existsSync} from 'fs';
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
  public async addToScene(scene: Scene) {
    // this renders the Host in the current scene
    const characterAsset = await SceneLoader.LoadAssetContainerAsync(
      this.characterConfig.modelUrl,
      undefined,
      scene
    );

    // rename mesh to something human-readable instead of the default '__root__'
    characterAsset.meshes[0].name = this.characterId;

    this.fixTextures(
      this.workSpaceAssetsDir,
      characterAsset.textures as Texture[]
    );
    this.fixMaterials(this.workSpaceAssetsDir, characterAsset.materials);
    this.fixBones(characterAsset.skeletons[0], scene);

    characterAsset.addAllToScene();

    return characterAsset;
  }

  /**
   * The editor expects the properties of textures that point to where they're
   * stored to be relative paths that are based off the workspace's asset directory,
   * rather than the absolute ones that the default GLTF asset loader sets.
   *
   * @param workspaceAssetsDir The absolute path to the workspace's assets directory
   * @param textures The array of textures to be fixed
   */
  private fixTextures(workspaceAssetsDir: string, textures: Texture[]) {
    textures.forEach((tex: Texture) => {
      if (tex.url && tex.url.startsWith('data:')) {
        const textureDir = tex.url.split(':')[1];

        // check to ensure that this is actually a directory, and not embedded data --
        // we expect it to be the absolute path to the texture directory
        if (!existsSync(textureDir)) {
          return;
        }

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
  private fixMaterials(workspaceAssetsDir: string, materials: Material[]) {
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
   * The editor expects certain properties about skeletons and bones to be true before
   * they will be exported/re-imported correctly
   * @param skeleton The host skeleton to fix
   * @param scene The scene the skeleton will be imported into
   */
  private fixBones(skeleton: Skeleton | null, scene: Scene) {
    if (!skeleton) return;

    // The editor will use the skeleton id as an index into an array,
    // so it needs to be a number - let's find a unique one
    let id = 0;
    while (scene.getSkeletonById(id as any)) {
      id += 1;
    }

    skeleton.id = id as any;
    skeleton.bones?.forEach((bone) => {
      // bone IDs also need to be unique, but can be strings
      bone.id = Tools.RandomId();

      // the editor expects these properties to be set
      bone.metadata ??= {};
      bone.metadata.originalId = bone.id;
    });
  }

  /**
   * This method takes a configuration object of absolute paths to animation files,
   * and returns the same object where the paths are instead relative to the workspace
   * directory
   * @param animUrls
   * @returns
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
      polyConfig: {...editorMetadata.sumerian.pollyConfig},
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
