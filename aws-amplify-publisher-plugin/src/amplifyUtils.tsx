// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  AmplifyClient,
  CreateAppCommand,
  CreateBranchCommand,
  CreateDeploymentCommand,
  ListAppsCommand,
  GetJobCommand,
  GetBranchCommand,
  CreateDeploymentCommandOutput,
  StartDeploymentCommand,
  StartDeploymentCommandOutput,
  CreateBranchCommandOutput,
} from '@aws-sdk/client-amplify';

/**
 * Check whether the given Amplify app exists.
 * @param appName The Amplify application name.
 * @param client The Amplify SDK client.
 * @returns A Promise that resolves to an app ID string.
 * If an app matching "appName" exists, that app ID will be returned.
 * Otherwise, an undefined variable will be returned.
 */
export const getExistingAmplifyAppId = async (
  appName: string,
  client: AmplifyClient
): Promise<string | undefined> => {
  let nextToken;
  /* eslint-disable no-await-in-loop */
  do {
    const listAppResponse = await client.send(new ListAppsCommand({nextToken}));
    if (listAppResponse?.apps) {
      const existingApp = listAppResponse.apps.find(
        (app) => app.name === appName && app.appId
      );
      if (existingApp && existingApp.appId) {
        return existingApp.appId;
      }
    }
    nextToken = listAppResponse?.nextToken;
  } while (nextToken);
  /* eslint-enable no-await-in-loop */
  return undefined;
};

/**
 * Create an Amplify App and a branch.
 * @param appName The Amplify application name.
 * @param client The Amplify SDK client.
 * @returns A Promise that resolves to an app ID string.
 * If an app created with the input "appName", that app ID will be returned.
 * Otherwise, an error will be thrown.
 * @throws An error with the specific error information why the app fails to be created.
 */
export const createAmplifyApp = async (
  appName: string,
  client: AmplifyClient
): Promise<string | undefined> => {
  try {
    const createAppResponse = await client.send(
      new CreateAppCommand({name: appName})
    );
    return createAppResponse.app?.appId;
  } catch (error) {
    throw new Error(
      `The app ${appName} could not be created due to: ${error.message}`
    );
  }
};

/**
 * Check whether the given Amplify branch exists in the Amplify app.
 * @param appId The Amplify application Id.
 * @param branchName The Amplify environment branch name.
 * @param client The Amplify SDK Client
 * @returns A Promise that resolves to a boolean variable.
 * If the branch with the input "branchName" exists, it will return true.
 * Otherwise, it will return false;
 */
export const checkExistingAmplifyBranch = async (
  appId: string,
  branchName: string,
  client: AmplifyClient
): Promise<boolean> => {
  try {
    const getBranchResponse = await client.send(
      new GetBranchCommand({appId, branchName})
    );
    if (getBranchResponse.branch) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * wait the submitted job to succeed.
 * @param job The job of Amplify deployment.
 * @param client The Amplify SDK Client.
 * @returns A Promise that resolves when getting a response by given jobId.
 * Otherwise, it will reject when it fails to get job.
 * @throws An error if it failed to get the job.
 */
export const waitJobToSucceed = async (
  appId: string,
  branchName: string,
  jobId: string,
  client: AmplifyClient
): Promise<void> => {
  let processing = true;
  while (processing) {
    /* eslint-disable no-await-in-loop */
    const getResponse = await client.send(
      new GetJobCommand({appId, branchName, jobId})
    );

    const jobSummary = getResponse.job?.summary;
    if (jobSummary?.status === 'FAILED') {
      processing = false;
      throw new Error(`Job failed.${JSON.stringify(jobSummary)}`);
    }
    if (jobSummary?.status === 'SUCCEED') {
      processing = false;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * 3);
    });
  }
};

/**
 * The wrapper of Amplify CreateBranchCommend.
 * @param appId The Amplify application ID.
 * @param branchName The Amplify Environment Name.
 * @param client The Amplify SDK Client.
 * @return A Promise that resolves when the Amplify branch is created.
 */
export const createAmplifyBranch = async (
  appId: string,
  branchName: string,
  client: AmplifyClient
): Promise<CreateBranchCommandOutput> =>
  client.send(new CreateBranchCommand({appId, branchName}));

/**
 * The wrapper of Amplify StartAmplifyDeployment.
 * @param appId The Amplify application ID.
 * @param branchName The Amplify Environment Name.
 * @param jobId The Amplify Application job ID
 * @param client The Amplify SDK Client.
 * @returns A Promise that resolves when the amplify deployment is started.
 */
export const startAmplifyDeployment = async (
  appId: string,
  branchName: string,
  jobId: string,

  client: AmplifyClient
): Promise<StartDeploymentCommandOutput> =>
  client.send(
    new StartDeploymentCommand({
      appId,
      branchName,
      jobId,
    })
  );

/**
 * The wrapper of Amplify CreateDeploymentCommand.
 * @param appId The Amplify application ID.
 * @param branchName The Amplify Environment Name.
 * @param client The Amplify SDK Client.
 * @returns A Promise that resolves when the amplify deployment is created.
 */
export const createAmplifyDeployment = async (
  appId: string,
  branchName: string,
  client: AmplifyClient
): Promise<CreateDeploymentCommandOutput> =>
  client.send(
    new CreateDeploymentCommand({
      appId,
      branchName,
    })
  );
