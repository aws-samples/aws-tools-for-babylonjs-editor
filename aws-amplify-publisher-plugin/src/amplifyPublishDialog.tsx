// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Dialog} from '@blueprintjs/core';
import fs from 'fs-extra';
// eslint-disable-next-line import/no-unresolved
import {Editor} from 'babylonjs-editor';

import {AmplifyClient} from '@aws-sdk/client-amplify';

import {Status, PLUGIN_VERSION} from './constants';



import {
  getAmplifyPublishingPreferences,
  setAmplifyPublishingPreferences,
} from './preferences';

import {httpPutFile, zipArtifacts, getDefaultDomainForBranch} from './utils';

import {
  getExistingAmplifyAppId,
  createAmplifyApp,
  createAmplifyBranch,
  checkExistingAmplifyBranch,
  createAmplifyDeployment,
  waitJobToSucceed,
  startAmplifyDeployment,
} from './amplifyUtils';

import {InputDialog} from './inputDialog';
import {OverwriteDialog} from './overwriteDialog';
import {ProgressDialog} from './progressDialog';
import {SuccessDialog} from './successDialog';
import {FailureDialog} from './failureDialog';

/**
 * The configuration that the Amplify publishing dialog should be initialized with
 */
export type AmplifyPublishDialogProps = {
  /**
   * The function that should be called when the dialog is closed
   */
  handleClose: () => void;

  /**
   * The boolean state that determines whether the dialog should be visible
   * to the user or not
   */
  isOpen: boolean;

  /**
   * A reference to the BabylonJS Editor object
   * @see {@link Editor}
   */
  editor: Editor;
};

/**
 * These represent the mutable values the user will change when interacting with the dialog
 */
export type AmplifyPublishDialogState = {
  /**
   * The Amplify application name that corresponds to the
   * project that should be published with this dialog
   */
  appName: string;

  /**
   * The unique environment name that corresponds to the Amplify branch
   * should be published to
   */
  envName: string;

  /**
   * The status of the publishing.
   */
  status: Status;

  /**
   * The domain address of successfully deployed the Amplify app.
   */
  domainAddress: string;

  /**
   * The error message.
   */
  error: string;
};

/**
 * This dialog component handles allowing the user to input any Amplify-related configuration
 * before pressing a button to publish their BabylonJS project. The configuration will be
 * persisted in the workspace.
 */
export class AmplifyPublishDialog extends React.Component<
  AmplifyPublishDialogProps,
  AmplifyPublishDialogState
> {
  private client: AmplifyClient;

  public constructor(props: AmplifyPublishDialogProps) {
    super(props);

    // grab the local preferences and set them in the local state
    // so they can be referenced as the default values in the render() function
    const preferences = getAmplifyPublishingPreferences();

    this.state = {
      appName: preferences.appName,
      envName: preferences.envName,
      status: Status.Publish,
      domainAddress: '',
      error: '',
    };

    this.client = new AmplifyClient({customUserAgent: `AWSToolsForBabylonJS-${PLUGIN_VERSION}`});
  }

  /**
   * Handle the close button when clicked
   */
  private _handleCloseClick = (): void => {
    setAmplifyPublishingPreferences({
      ...this.state,
    });

    this.setState({status: Status.Publish});
    const {handleClose} = this.props;
    handleClose();
  };

  /**
   * Handle the publish button when clicked
   * @param appName The Amplify application name.
   * @param envName The Amplify environment name.
   * @returns A Promise that resolves when the scene publishing process completes..
   * Otherwise, it will change to render the failure dialog with the
   * error message.
   */
  private _handlePublishClick = async (
    appName: string,
    envName: string
  ): Promise<void> => {
    try {
      if (!this.props.editor.scene) {
        throw new Error('No active scene to publish!');
      }

      // check whether the Amplify App exists
      let appId = await getExistingAmplifyAppId(appName, this.client);
      if (appId === null || appId === undefined) {
        appId = await createAmplifyApp(appName, this.client);
      }
      if (appId === undefined) {
        throw new Error(`The created app has an undefined appId.`);
      }
      // check whether the branch of the Amplify App exists
      const doesBranchExist = await checkExistingAmplifyBranch(
        appId,
        envName,
        this.client
      );

      if (!doesBranchExist) {
        await createAmplifyBranch(appId, envName, this.client);
      } else {
        this.setState({status: Status.ExistBranch});
        return;
      }
      await this._publishToAmplify(appId, envName);
    } catch (error) {
      this.setState({error, status: Status.Failure});
    }
  };

  /**
   * Publish the files to AWS Amplify.
   * @param appId The Amplify application Id.
   * @param envName The Amplify environment name.
   * @returns A Promise that resolves when publishing the scene to Amplify
   * and change to render the SuccessDialog. Otherwise, it will throw
   * the error to the upper level.
   * @throws An error once the url used to upload the file is undefined.
   */
  private _publishToAmplify = async (
    appId: string,
    envName: string
  ): Promise<void> => {
    let artifactsPath: string | undefined;
    this.setState({status: Status.Progress});

    try {
      artifactsPath = await zipArtifacts('tmpDir');

      // create an Amplify deployment
      const {jobId, zipUploadUrl} = await createAmplifyDeployment(
        appId,
        envName,
        this.client
      );
      if (jobId === undefined) {
        throw new Error('The Job Id is undefined. Please try it again!');
      }
      if (zipUploadUrl) {
        await httpPutFile(artifactsPath, zipUploadUrl);
      } else {
        throw new Error('The url used to upload the file is undefined.');
      }

      await startAmplifyDeployment(appId, envName, jobId, this.client);

      await waitJobToSucceed(appId, envName, jobId, this.client);

      const domainAddress = getDefaultDomainForBranch(appId, envName);
      this.setState({domainAddress, status: Status.Success});
      this.props.editor.console.logInfo(domainAddress);
    } finally {
      try {
        if (artifactsPath) {
          fs.unlinkSync(artifactsPath);
        }
      } catch (error) {
        const errorMessage = `An error has occurred while removing the compressed file at ${artifactsPath}. Please remove it manually. ${error}`;
        this.setState({error: errorMessage, status: Status.Failure});
      }
    }
  };

  /**
   * overwrite the branch to AWS Amplify application.
   * @param appName The Amplify application name.
   * @param envName The Amplify environment name.
   * @returns A Promise that resolves when the scene publishing process completes.
   * Otherwise, it will reject and change to render the Failure dialog
   * with error message.
   */
  private _overwriteAmplifyBranch = async (
    appName: string,
    envName: string
  ): Promise<void> => {
    try {
      const appId = await getExistingAmplifyAppId(appName, this.client);
      if (appId) {
        await this._publishToAmplify(appId, envName);
      } else {
        throw new Error(`The appId isn't valid.`);
      }
    } catch (error) {
      this.setState({error, status: Status.Failure});
    }
  };

  /**
   * Handle the back button when clicked.
   */
  private _handleBackClick = (): void => {
    this.setState({status: Status.Publish});
  };

  public render(): React.ReactNode {
    const {isOpen} = this.props;
    const {status, appName, envName, domainAddress, error} = this.state;

    return (
      <Dialog
        isOpen={isOpen}
        autoFocus
        usePortal={false}
        canOutsideClickClose={false}
        enforceFocus
        transitionDuration={1000}
      >
        {status === Status.Publish && (
          <InputDialog
            appName={appName}
            envName={envName}
            onAppNameChange={(newAppName: string) =>
              this.setState({appName: newAppName})
            }
            onEnvNameChange={(newEnvName: string) =>
              this.setState({envName: newEnvName})
            }
            onPublish={this._handlePublishClick}
            onClose={this._handleCloseClick}
          />
        )}
        {status === Status.ExistBranch && (
          <OverwriteDialog
            appName={appName}
            envName={envName}
            onBack={this._handleBackClick}
            onOverwrite={this._overwriteAmplifyBranch}
          />
        )}
        {status === Status.Progress && <ProgressDialog />}
        {status === Status.Success && (
          <SuccessDialog
            appName={appName}
            envName={envName}
            domainAddress={domainAddress}
            onClose={this._handleCloseClick}
          />
        )}
        {status === Status.Failure && (
          <FailureDialog error={error} onBack={this._handleBackClick} />
        )}
      </Dialog>
    );
  }
}
