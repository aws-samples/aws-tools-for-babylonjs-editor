import childProcess from 'child_process';
import fs from 'fs-extra';
import {
  AssetsNotFoundError,
  installDependencies,
  prepareWorkspace,
  validateAssetsPath,
  WorkspaceNotPreparedError,
} from '../src/workspace';

jest.mock('fs-extra', () => ({
  ...jest.requireActual('fs-extra'),
  promises: {
    copyFile: jest.fn().mockResolvedValue(null),
    mkdir: jest.fn().mockResolvedValue(null),
  },
  copy: jest.fn(),
  existsSync: jest.fn(),
}));

jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  exec: jest.fn().mockImplementation(() => ({
    stdout: 'fake stdout',
    stderr: 'fake stderr',
  })),
}));
jest.mock('util', () => ({promisify: (fn) => fn}));

describe('workspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call copyFile and mkdir once separately', async () => {
    const mockCopy = jest.fn();
    jest.spyOn(fs, 'copy').mockImplementation(mockCopy);
    await prepareWorkspace('testPluginDir', 'testWorkSpaceDir');

    expect(fs.promises.copyFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.mkdir).toHaveBeenCalledTimes(1);
  });

  it('should throw custom WorkspaceNotPreparedError when there are errors with fs package', async () => {
    jest
      .spyOn(fs.promises, 'copyFile')
      .mockRejectedValue(new WorkspaceNotPreparedError('Mocked Error'));
    const mockCopy = jest.fn();
    jest.spyOn(fs, 'copy').mockImplementation(mockCopy);

    await expect(
      prepareWorkspace('testPluginDir', 'testWorkSpaceDir')
    ).rejects.toThrow(WorkspaceNotPreparedError);
  });

  it('should return nothing when the assetDir exists', () => {
    const spyExistsSync = jest
      .spyOn(fs, 'existsSync')
      .mockReturnValueOnce(true);
    validateAssetsPath('testPluginDir');

    expect(spyExistsSync).toHaveBeenCalledTimes(1);
  });

  it('should throw Error when the assetDir does not exist', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    function testValidateAsset() {
      validateAssetsPath('testPluginDir');
    }

    expect(testValidateAsset).toThrowError(
      'Sumerian Host assets could not be found at '
    );

    expect(testValidateAsset).toThrowError(AssetsNotFoundError);
  });

  it('should call exec once', async () => {
    await installDependencies('testWorkSpaceDir', {testKey: ''});

    expect(childProcess.exec).toHaveBeenCalledTimes(1);
  });
});
