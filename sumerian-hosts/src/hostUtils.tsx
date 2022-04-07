// eslint-disable-next-line import/no-unresolved
import {Scene} from 'babylonjs/scene';

import {HostObject} from '@amazon-sumerian-hosts/babylon';

import fs from 'fs';
import path from 'path';

class AssetsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * This utility method adds a Sumerian host to the scene provided.
 * @param {Scene} scene The scene that the Sumerian Host will be added to
 * @param pluginPath The absolute path to the plugin's location
 * @param characterId The identifier of the Host character to add
 */
const addHostToScene = async (
  scene: Scene,
  pluginPath: string,
  characterId: string
) => {
  const relativeAssetsPath = './assets/gLTF';
  const assetsPath = path.join(pluginPath, relativeAssetsPath);
  if (!fs.existsSync(assetsPath)) {
    throw new AssetsNotFoundError(
      `Sumerian host assets could not be found at ${assetsPath}`
    );
  }

  const characterConfig = HostObject.getCharacterConfig(
    assetsPath,
    characterId
  );

  // this renders the host in the current scene
  const characterAsset = await HostObject.loadCharacterMesh(
    scene,
    characterConfig.modelUrl
  );

  // rename mesh to something human-readable instead of the default '__root__'
  characterAsset.meshes[0].name = characterConfig.modelUrl.slice(
    characterConfig.modelUrl.lastIndexOf('/') + 1,
    characterConfig.modelUrl.lastIndexOf('.')
  );

  // TODO: add script to resulting object that will instantiate POI / TextToSpeech at runtime
};

const getAvailableHosts = () => HostObject.getAvailableCharacters();

export {AssetsNotFoundError, addHostToScene, getAvailableHosts};
