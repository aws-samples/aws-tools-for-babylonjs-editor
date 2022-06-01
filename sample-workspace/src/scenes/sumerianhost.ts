// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { HostObject } from '@amazon-sumerian-hosts/babylon';
import { Mesh, Observable } from '@babylonjs/core';
import * as AWS from 'aws-sdk';
import { fromScene, visibleInInspector } from './decorators';
import IAwsConnector from "./IAwsConnector";

/**
 * This is the script attached to a Sumerian Host. You will typically not need
 * to edit this script. Instead, other scripts in your scene should interact 
 * with the host via the `SumerianHost.host` property which provides a
 * HostObject instance.
 * 
 * Host initialization is asynchronous. Your scripts can subscribe to the
 * SumerianHost.onHostReadyObserver to be notified when the host is fully
 * initialized and ready for use.
 * 
 * Example:
 * _In your own script..._
 ```
// Assume hostNode references a SumerianHost instance.
hostNode.onHostReadyObserver.add(() -> {
  hostNode.host.TextToSpeechFeature.play("Hello, world!");
});
 ```
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
export const PLUGIN_VERSION = 'development';

export default class SumerianHost extends Mesh {

  // ==== Inspector parameters ====

  @visibleInInspector('string', 'Voice ID', 'Joanna')
  public pollyVoiceId: string;

  @visibleInInspector('string', 'Language ID', 'en-US')
  public pollyLanguageId: string;

  @visibleInInspector('string', 'Polly Engine ("standard" or "neural")', 'neural')
  public pollyEngine: string;
    
  @fromScene('AWS Connector')
  public awsConnector: IAwsConnector;

  /**
   * Observer which signals when the SumerianHost.host instance is fully
   * initialized and ready for use.
   */
  public onHostReadyObserver: Observable<any> = new Observable();

  /**
   * Provides access to the APIs that control host functionality, namely:
   * 
   * Text-to-speech functions, available via `SumerianHost.host.TextToSpeechFeature`.
   * See [TextToSpeechFeature API documentation](https://aws-samples.github.io/amazon-sumerian-hosts/babylonjs_TextToSpeechFeature.html).
   * 
   * Point-of-interest tracking, available via `SumerianHost.host.PointOfInterestFeature`.
   * See [PointOfInterestFeature API documentation](https://aws-samples.github.io/amazon-sumerian-hosts/babylonjs_PointOfInterestFeature.html).
   * 
   * Gesture functions, available via `SumerianHost.host.GestureFeature`.
   * See [GestureFeature API documentation](https://aws-samples.github.io/amazon-sumerian-hosts/core_GestureFeature.html)
   * 
   * Developer note: This property is typed as "HostObject | any" because 
   * the HostObject's TypeScript definition doesn't include some properties 
   * that are dynamically added to the object at runtime such as
   * HostObject.TextToSpeechFeature and others. The "any" designation
   * prevents the TypeScript compiler from reporting errors when accessing those
   * dynamic properties.
   */
  public host: HostObject | any;

  /**
   * Override constructor.
   * @warn do not fill.
   */
  // @ts-ignore ignoring the super call as we don't want to re-init
  protected constructor() {}

  /**
   * This method gets called immediately after the constructor.
   */
  public async onInitialize(): Promise<void> {
    const config: SumerianHostMetadata = this.getMetadata();
    const poiConfig = await HostObject.loadJson(config.poiConfigPath);

    await this.initHostCharacter(config, poiConfig);
    this.initPointOfInterestTracking(poiConfig, config.lookJoint);
    await this.initTextToSpeech();
    this.onHostReady();
  }

  protected async initHostCharacter(config: any, poiConfig: any, ): Promise<void> {
    const bindPoseOffset = this._scene.animationGroups.find(
      (animGroup) => animGroup.name === config.bindPoseOffsetName
    );

    const animClips = await HostObject.loadCharacterAnimations(
      this.getScene(),
      this,
      bindPoseOffset,
      config.animClipPaths
    );
    const gestureConfig = await HostObject.loadJson(config.gestureConfigPath);

    // set up animations
    const assets = {
      characterMesh: this,
      animClips,
      gestureConfig,
      poiConfig,
      bindPoseOffset,
    };
    this.host = HostObject.assembleHost(assets, this.getScene());
  }

  protected initPointOfInterestTracking(poiConfig, lookJoint): void {
    // have the Host track the scene's active camera
    HostObject.addPointOfInterestTracking(
      this.host,
      this._scene,
      poiConfig,
      lookJoint
    );

    // Track the active camera by default.
    const camera = this.getScene().activeCamera;
    this.host.PointOfInterestFeature.setTarget(camera);
  }

  protected async initTextToSpeech(): Promise<void> {
    const region = this.awsConnector.getRegion();
    const credentials = this.awsConnector.getCredentials();

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
      this.host,
      this.getScene(),
      this.pollyVoiceId,
      this.pollyEngine,
      this.pollyLanguageId
    );
  }

  /**
   * Call this method to signal when the host has finished its asynchronous
   * initialization and is ready for use.
   */
  protected onHostReady(): void {
    this.onHostReadyObserver.notifyObservers(this);
  }

  /**
   * If the scene is being run from the editor, this method will return the version of
   * the configuration that uses local paths.
   * Otherwise, this method will return the version of the configuration that uses paths
   * relative to the workspace directory.
   * @returns {SumerianHostMetadata}
   */
  protected getMetadata(): SumerianHostMetadata {
    if (this.isRunFromEditor()) {
      return this.metadata.editor.sumerian;
    }

    return this.metadata.sumerian;
  }

  /**
   * NodeJS defines the global variable 'process' -- as does recent versions of
   * FireFox, which is why we check the name as well.
   * We use this to determine whether the code is being run locally from the editor,
   * or is running in the browser
   * @returns boolean
   */
  protected isRunFromEditor(): boolean {
    return (
      typeof process !== 'undefined' &&
      process &&
      process.release.name === 'node'
    );
  }

}
