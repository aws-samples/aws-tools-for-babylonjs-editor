// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {HostObject} from '@amazon-sumerian-hosts/babylon';
import {Mesh, Scene} from '@babylonjs/core';
import * as AWS from 'aws-sdk';
import {visibleInInspector} from './decorators';

/**
 * This is the script attached to a Sumerian Host, which loads animations
 * and configures several features at runtime.
 */

type SumerianHostMetadata = {
  bindPoseOffsetName: string;
  poiConfigPath: string;
  gestureConfigPath: string;
  animClipPaths: any;
  lookJoint: string;
  pollyConfig: SumerianHostVoiceConfiguration;
};

type SumerianHostVoiceConfiguration = {
  voice: string;
  engine: string;
  language: string;
};

// Our Github Actions will replace this with a commit SHA at release time
// Right now this script is the only runtime asset published by our plugin
// As we build out more runtime complexity into this plugin, this versioning should move there 
export const PLUGIN_VERSION = "development";

export default class SumerianHost extends Mesh {
  // Inspector fields
  private static initialCognitoIdValue = 'Fill in';

  @visibleInInspector(
    'string',
    'Cognito Identity Pool ID',
    SumerianHost.initialCognitoIdValue
  )
  private cognitoId: string;

  // Class members
  private host;

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
    const config: SumerianHostMetadata = this.getMetadata();

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
    const assets = {
      characterMesh: this,
      animClips,
      gestureConfig,
      poiConfig,
      bindPoseOffset,
    };
    this.host = HostObject.assembleHost(assets, this._scene);

    // have the Host track the scene's active camera
    HostObject.addPointOfInterestTracking(
      this.host,
      this._scene,
      poiConfig,
      config.lookJoint
    );
    this.host.PointOfInterestFeature.setTarget(this._scene.activeCamera);

    // if you wish to specify a different voice for the host,
    // override the pollyConfig defined in the metadata
    await SumerianHost.instantiateTextToSpeech(
      this.host,
      this._scene,
      this.cognitoId,
      config.pollyConfig
    );
  }

  /**
   * NodeJS defines the global variable 'process' -- as does recent versions of
   * FireFox, which is why we check the name as well.
   * We use this to determine whether the code is being run locally from the editor,
   * or is running in the browser
   * @returns boolean
   */
  private isRunFromEditor(): boolean {
    return (
      typeof process !== 'undefined' &&
      process &&
      process.release.name === 'node'
    );
  }

  /**
   * If the scene is being run from the editor, this method will return the version of
   * the configuration that uses local paths.
   * Otherwise, this method will return the version of the configuration that uses paths
   * relative to the workspace directory.
   * @returns {SumerianHostMetadata}
   */
  private getMetadata(): SumerianHostMetadata {
    if (this.isRunFromEditor()) {
      return this.metadata.editor.sumerian;
    }

    return this.metadata.sumerian;
  }

  private static instantiateAWSCredentials(
    cognitoIdentityPoolId: string
  ): AWS.CognitoIdentityCredentials {
    return new AWS.CognitoIdentityCredentials({
      IdentityPoolId: cognitoIdentityPoolId,
    });
  }

  private static getRegionFromCognitoIdentityPoolID(
    cognitoIdentityPoolId: string
  ): string {
    return cognitoIdentityPoolId.split(':')[0];
  }

  private static validateCognitoIdentityPoolId(
    cognitoIdentityPoolId: string
  ): boolean {
    return (
      cognitoIdentityPoolId &&
      cognitoIdentityPoolId !== SumerianHost.initialCognitoIdValue
    );
  }

  private static async instantiateTextToSpeech(
    host,
    scene: Scene,
    cognitoIdentityPoolId: string,
    pollyConfig: SumerianHostVoiceConfiguration
  ): Promise<void> {
    if (SumerianHost.validateCognitoIdentityPoolId(cognitoIdentityPoolId)) {
      const credentials = SumerianHost.instantiateAWSCredentials(
        cognitoIdentityPoolId
      );
      const region = SumerianHost.getRegionFromCognitoIdentityPoolID(
        cognitoIdentityPoolId
      );

      // setting this global config is necessary -
      // else the Polly SDK's first call to Cognito.getID(...) will fail
      AWS.config.region = region;

      const customUserAgent = `AWSToolsForBabylonJSEditor-${PLUGIN_VERSION}`;

      const pollyClient = new AWS.Polly({credentials, region, customUserAgent});
      const pollyPresigner = new AWS.Polly.Presigner({
        service: pollyClient,
      });

      await HostObject.initTextToSpeech(pollyClient, pollyPresigner);

      HostObject.addTextToSpeech(
        host,
        scene,
        pollyConfig.voice,
        pollyConfig.engine,
        pollyConfig.language
      );
    } else {
      console.error(
        'Invalid cognito identity pool ID - did you set it on the script node on the Sumerian Host?'
      );
    }
  }

  public speak(speech: string): void {
    this.host.TextToSpeechFeature.play(speech);
  }
}
