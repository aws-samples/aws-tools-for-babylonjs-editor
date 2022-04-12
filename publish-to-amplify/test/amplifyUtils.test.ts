import {mockClient} from 'aws-sdk-client-mock';
import {
  AmplifyClient,
  CreateAppCommand,
  ListAppsCommand,
  GetBranchCommand,
  // GetJobCommand,
  CreateBranchCommand,
} from '@aws-sdk/client-amplify';
import {
  getExistingAmplifyAppId,
  createAmplifyApp,
  checkExistingAmplifyBranch,
  // waitJobToSucceed,
  createAmplifyBranch,
} from '../src/amplifyUtils';

/**
 * mock the given instance of the AWS SDK Client:
 */
const amplifyClient = new AmplifyClient({});
const amplifyMock = mockClient(amplifyClient);

// The mocked Amplify app object
const mockApp = {
  appId: '1234',
  name: 'testApp',
  appArn: '',
  description: 'The Mocked App Object',
  createTime: new Date(),
  updateTime: new Date(),
  repository: '',
  enableBranchAutoBuild: true,
  platform: '',
  environmentVariables: {},
  defaultDomain: '',
  enableBasicAuth: true,
};

const mockBranch = {
  branchName: 'testBranch',
  branchArn: '',
  description: 'The mocked Amplify branch',
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

// const mockSucceedJob = {
//   summary: {
//     jobArn: '',
//     jobId: 'testId',
//     commitId: '',
//     commitMessage: '',
//     commitTime: new Date(),
//     startTime: new Date(),
//     jobType: '',
//     status: 'SUCCEED',
//   },
//   steps: [],
// };

// const mockFailedJob = {
//   summary: {
//     jobArn: '',
//     jobId: 'testId',
//     commitId: '',
//     commitMessage: '',
//     commitTime: new Date(),
//     startTime: new Date(),
//     jobType: '',
//     status: 'FAILED',
//   },
//   steps: [],
// };

describe('getExistingAmplifyAppId', () => {
  /**
   * To be sure that unit tests are independent from each other,
   * reset mock behavior between the tests.
   */
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return appId from the Amplify after calling getExistingAmplifyAppId', async () => {
    amplifyMock.on(ListAppsCommand).resolves({
      apps: [mockApp],
    });

    const appId = await getExistingAmplifyAppId('testApp', amplifyClient);

    expect(appId).toBe('1234');
  });

  it('should return undefined from the Amplify after calling getExistingAmplifyAppId', async () => {
    amplifyMock.on(ListAppsCommand).resolves({
      apps: [mockApp],
    });

    const appId = await getExistingAmplifyAppId('wrongAppName', amplifyClient);

    expect(appId).toBe(undefined);
  });
});

describe('createAmplifyApp', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return appId from the Amplify after calling createAmplifyApp', async () => {
    amplifyMock.on(CreateAppCommand, {name: 'testApp'}).resolves({
      app: mockApp,
    });

    const appId = await createAmplifyApp('testApp', amplifyClient);

    expect(appId).toBe('1234');
  });
});

describe('checkExistingAmplifyBranch', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should return true from the Amplify after calling checkExistingAmplifyBranch with the existing amplify branch', async () => {
    amplifyMock
      .on(GetBranchCommand, {appId: '1234', branchName: 'testBranch'})
      .resolves({
        branch: mockBranch,
      });
    // amplifyClient.send(new CreateCommand({'1234', 'testBranch'}));
    const doesExist = await checkExistingAmplifyBranch(
      '1234',
      'testBranch',
      amplifyClient
    );
    console.log(`doesExist: ${doesExist}`);

    expect(doesExist).toBe(true);
  });

  it('should return false from the Amplify after calling checkExistingAmplifyBranch with the nonexisting amplify branch', async () => {
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

// describe('waitJobToSucceed', () => {
//   beforeEach(() => {
//     amplifyMock.reset();
//   });

//   it('should throw error after calling waitJobToSucceed with a failed job', async () => {
//     const mockCall = amplifyMock.on(GetJobCommand).resolves({
//       job: mockSucceedJob,
//     });
//     // jest.setTimeout(30000);
//     await waitJobToSucceed('1234', 'testBranch', 'testId', amplifyClient);
//     expect(mockCall).toHaveBeenCalledTimes(1);
//   });
// });

describe('createAmplifyBranch', () => {
  beforeEach(() => {
    amplifyMock.reset();
  });

  it('should throw error after calling waitJobToSucceed with a failed job', async () => {
    let passedCommand;
    amplifyClient.send = jest.fn((CreateBranchCommand) => {
      passedCommand = CreateBranchCommand;
      return Promise.resolve();
    });
    await createAmplifyBranch('1234', 'testBranch', amplifyClient);

    let expectCommand = new CreateBranchCommand({appId: '1234', branchName: 'testBranch'});

    expect(amplifyClient.send).toHaveBeenCalled();
    expect(passedCommand.input.appId).toBe(expectCommand.input.appId);
    expect(passedCommand.input.branchName).toBe(expectCommand.input.branchName);
  });
});

// describe('startAmplifyDeployment', () => {
//   beforeEach(() => {
//     amplifyMock.reset();
//   });

//   it('should throw error after calling startAmplifyDeployment with a failed job', async () => {
//     amplifyMock
//       .on(GetJobCommand, {appId: '1234'})
//       .resolves({})
//     await waitJobToSucceed('1234', 'testBranch', '1', amplifyClient);
//     expect(amplifyMock.calls()).toHaveLen
//   });
// });

// describe('createAmplifyDeployment', () => {
//   beforeEach(() => {
//     amplifyMock.reset();
//   });

//   it('should throw error after calling startAmplifyDeployment with a failed job', async () => {
//     amplifyMock
//       .on(GetJobCommand, {appId: '1234'})
//       .resolves({})
//     await waitJobToSucceed('1234', 'testBranch', '1', amplifyClient);
//     expect(amplifyMock.calls()).toHaveLen
//   });
// });
