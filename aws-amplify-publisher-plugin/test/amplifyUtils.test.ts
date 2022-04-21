// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {mockClient} from 'aws-sdk-client-mock';
import {
  AmplifyClient,
  CreateAppCommand,
  ListAppsCommand,
  GetBranchCommand,
  GetJobCommand,
  CreateBranchCommand,
  StartDeploymentCommand,
  CreateDeploymentCommand,
} from '@aws-sdk/client-amplify';
import {
  getExistingAmplifyAppId,
  createAmplifyApp,
  checkExistingAmplifyBranch,
  waitJobToSucceed,
  createAmplifyBranch,
  startAmplifyDeployment,
  createAmplifyDeployment,
} from '../src/amplifyUtils';

/**
 * mock the given instance of the AWS SDK Client:
 */
const amplifyClient = new AmplifyClient({});
const amplifyMock = mockClient(amplifyClient);

// The mocked Amplify App object
const mockApp1 = {
  appId: '1234',
  name: 'testApp1',
  appArn: '',
  description: 'The mocked Amplify App object',
  createTime: new Date(),
  updateTime: new Date(),
  repository: '',
  enableBranchAutoBuild: true,
  platform: '',
  environmentVariables: {},
  defaultDomain: '',
  enableBasicAuth: true,
};
const mockApp2 = {
  appId: '5678',
  name: 'testApp2',
  appArn: '',
  description: 'The mocked Amplify App object',
  createTime: new Date(),
  updateTime: new Date(),
  repository: '',
  enableBranchAutoBuild: true,
  platform: '',
  environmentVariables: {},
  defaultDomain: '',
  enableBasicAuth: true,
};

// The mocked Amplify Branch object
const mockBranch = {
  branchName: 'testBranch',
  branchArn: '',
  description: 'The mocked Amplify Branch object',
  stage: '',
  displayName: '',
  enableNotification: true,
  createTime: new Date(),
  updateTime: new Date(),
  environmentVariables: {},
  framework: '',
  enableAutoBuild: true,
  customDomains: [],
  activeJobId: '',
  totalNumberOfJobs: '',
  enableBasicAuth: true,
  ttl: '',
  enablePullRequestPreview: true,
};

// The mocked Amplify succeed job object
const mockSucceedJob = {
  summary: {
    jobArn: '',
    jobId: 'testId',
    commitId: '',
    commitMessage: '',
    commitTime: new Date(),
    startTime: new Date(),
    jobType: '',
    status: 'SUCCEED',
  },
  steps: [],
};

// The mocked Amplify failed job object
const mockFailedJob = {
  summary: {
    jobArn: '',
    jobId: 'testId',
    commitId: '',
    commitMessage: '',
    commitTime: new Date(),
    startTime: new Date(),
    jobType: '',
    status: 'FAILED',
  },
  steps: [],
};

describe('getExistingAmplifyAppId', () => {
  // To be sure that unit tests are independent from each other,
  // reset mock behavior between the tests.
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return appId after calling getExistingAmplifyAppId with an existing app name', async () => {
    amplifyMock.on(ListAppsCommand).resolves({
      apps: [mockApp1, mockApp2],
    });

    const appId = await getExistingAmplifyAppId('testApp1', amplifyClient);

    expect(appId).toBe('1234');
  });

  it('should return undefined after calling getExistingAmplifyAppId with a nonexisting app name', async () => {
    amplifyMock.on(ListAppsCommand).resolves({
      apps: [mockApp1, mockApp2],
    });

    const appId = await getExistingAmplifyAppId(
      'nonExistingAppName',
      amplifyClient
    );

    expect(appId).toBe(undefined);
  });

  it('should return undefined after calling getExistingAmplifyAppId with an empty app name', async () => {
    amplifyMock.on(ListAppsCommand).resolves({
      apps: [mockApp1, mockApp2],
    });

    const appId = await getExistingAmplifyAppId('', amplifyClient);

    expect(appId).toBe(undefined);
  });

  it('should return the second appId since there is a nextToken in first time ListAppsCommand API call', async () => {
    amplifyMock
      .on(ListAppsCommand)
      .resolvesOnce({
        apps: [mockApp1],
        nextToken: 'nextToken',
      })
      .resolvesOnce({apps: [mockApp2]});

    const appId = await getExistingAmplifyAppId('testApp2', amplifyClient);

    expect(appId).toBe('5678');
  });

  it('should return undefined since there is no nextToken in first time ListAppsCommand API call', async () => {
    amplifyMock
      .on(ListAppsCommand)
      .resolvesOnce({
        apps: [mockApp1],
      })
      .resolvesOnce({apps: [mockApp2]});

    const appId = await getExistingAmplifyAppId('testApp2', amplifyClient);

    expect(appId).toBe(undefined);
  });
});

describe('createAmplifyApp', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return appId from createAmplifyApp function with the right app name', async () => {
    amplifyMock.on(CreateAppCommand, {name: 'testApp1'}).resolves({
      app: mockApp1,
    });

    const appId = await createAmplifyApp('testApp1', amplifyClient);

    expect(appId).toBe('1234');
  });

  it('should throw error from createAmplifyApp function when CreateAppCommand throws an error.', async () => {
    amplifyMock
      .on(CreateAppCommand, {name: 'invalidName'})
      .rejects('mocked rejection');

    await expect(
      createAmplifyApp('invalidName', amplifyClient)
    ).rejects.toThrow(
      'The app invalidName could not be created due to: mocked rejection'
    );
  });
});

describe('checkExistingAmplifyBranch', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return true after calling checkExistingAmplifyBranch with the existing amplify branch', async () => {
    amplifyMock
      .on(GetBranchCommand, {appId: '1234', branchName: 'testBranch'})
      .resolves({
        branch: mockBranch,
      });
    const doesExist = await checkExistingAmplifyBranch(
      '1234',
      'testBranch',
      amplifyClient
    );

    expect(doesExist).toBe(true);
  });

  it('should return false after calling checkExistingAmplifyBranch with the nonexisting amplify branch', async () => {
    amplifyMock.on(GetBranchCommand, {appId: '1234'}).resolves({
      branch: undefined,
    });

    const doesExist = await checkExistingAmplifyBranch(
      '1234',
      'nonexistingBranch',
      amplifyClient
    );

    expect(doesExist).toBe(false);
  });

  it('should return false after calling checkExistingAmplifyBranch with error thrown', async () => {
    amplifyMock
      .on(GetBranchCommand, {appId: '1234'})
      .rejects('mocked rejection');

    const doesExist = await checkExistingAmplifyBranch(
      '1234',
      'testBranch',
      amplifyClient
    );

    expect(doesExist).toBe(false);
  });
});

describe('waitJobToSucceed', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should resolve Promise<void> when the job succeeds', async () => {
    amplifyMock.on(GetJobCommand).resolves({
      job: mockSucceedJob,
    });
    // Since the waitJobToSucceed will return Promise<void> when the job succeeds and a
    // Promise<void> resolves to an undefined, we test the resolves result to be undefined here.
    await expect(
      waitJobToSucceed('1234', 'testBranch', 'testJob', amplifyClient)
    ).resolves.toBe(undefined);
  });

  it('should throw error after calling waitJobToSucceed with a failed job', async () => {
    amplifyMock.on(GetJobCommand).resolves({
      job: mockFailedJob,
    });

    await expect(
      waitJobToSucceed('1234', 'testBranch', 'testJob', amplifyClient)
    ).rejects.toThrow('Job failed.');
  });
});

describe('createAmplifyBranch', () => {
  it('check whether the amplify CreateBranchCommand is called with the right arguments', async () => {
    let actualCommand;
    amplifyClient.send = jest.fn((command) => {
      actualCommand = command;
      return Promise.resolve();
    });
    await createAmplifyBranch('1234', 'testBranch', amplifyClient);

    const expectCommand = new CreateBranchCommand({
      appId: '1234',
      branchName: 'testBranch',
    });

    expect(amplifyClient.send).toHaveBeenCalledTimes(1);
    expect(actualCommand.input.appId).toBe(expectCommand.input.appId);
    expect(actualCommand.input.branchName).toBe(expectCommand.input.branchName);
  });
});

describe('startAmplifyDeployment', () => {
  it('check whether the amplify StartDeploymentCommand is called with the right arguments', async () => {
    let actualCommand;
    amplifyClient.send = jest.fn((command) => {
      actualCommand = command;
      return Promise.resolve();
    });
    await startAmplifyDeployment(
      '1234',
      'testBranch',
      'testJob',
      amplifyClient
    );

    const expectCommand = new StartDeploymentCommand({
      appId: '1234',
      branchName: 'testBranch',
      jobId: 'testJob',
    });

    expect(amplifyClient.send).toHaveBeenCalledTimes(1);
    expect(actualCommand.input.appId).toBe(expectCommand.input.appId);
    expect(actualCommand.input.branchName).toBe(expectCommand.input.branchName);
    expect(actualCommand.input.jobId).toBe(expectCommand.input.jobId);
  });
});

describe('createAmplifyDeployment', () => {
  it('check whether the amplify CreateDeploymentCommand is called with the right arguments', async () => {
    let actualCommand;
    amplifyClient.send = jest.fn((command) => {
      actualCommand = command;
      return Promise.resolve();
    });
    await createAmplifyDeployment('1234', 'testBranch', amplifyClient);

    const expectCommand = new CreateDeploymentCommand({
      appId: '1234',
      branchName: 'testBranch',
    });

    expect(amplifyClient.send).toHaveBeenCalledTimes(1);
    expect(actualCommand.input.appId).toBe(expectCommand.input.appId);
    expect(actualCommand.input.branchName).toBe(expectCommand.input.branchName);
  });
});
