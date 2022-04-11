import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {Mesh} from '@babylonjs/core';

/**
 * This is the script attached to a Sumerian Host, which loads animations
 * and configures several features at runtime.
 */

type SumerianHostConfiguration = {
  bindPoseOffsetName: string;
  poiConfigPath: string;
  gestureConfigPath: string;
  animClipPaths: Object;
  lookJoint: string;
};

type SumerianHostAssets = {
  characterMesh: Mesh;
  animClips: Object;
  gestureConfig: Object;
  poiConfig: Object;
};

export default class SumerianHost extends Mesh {
  /**
   * Override constructor.
   * @warn do not fill.
   */
  // @ts-ignore ignoring the super call as we don't want to re-init
  protected constructor() {}

  /**
   * This method gets called immediately after the constructor
   */
  public async onInitialize(): Promise<any> {
    const config: SumerianHostConfiguration = this.metadata.sumerian;

    // load necessary files - animations, gesture and point of interest configurations
    const bindPoseOffset = this._scene.animationGroups.find(
      (animGroup) => animGroup.name === config.bindPoseOffsetName
    );
    const animClips = await HostObject.loadCharacterAnimations(
      this._scene,
      this,
      bindPoseOffset,
      config.animClipPaths
    );
    const gestureConfig = await HostObject.loadJson(config.gestureConfigPath);
    const poiConfig = await HostObject.loadJson(config.poiConfigPath);

    // set up animations
    const assets: SumerianHostAssets = {
      characterMesh: this,
      animClips,
      gestureConfig,
      poiConfig,
    };
    const host = HostObject.assembleHost(assets, this._scene);

    // have the Host track the scene's active camera
    // TODO: let camera be set through inspector property
    HostObject.addPointOfInterestTracking(
      host,
      this._scene,
      poiConfig,
      config.lookJoint
    );
    host.PointOfInterestFeature.setTarget(this._scene.activeCamera);
  }
}
