import fs from 'fs-extra';
import {
  AssetsNotFoundError,
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

describe('workspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('prepareWorkspace', () => {
    it('should copy scripts to workspace', async () => {
      const mockCopy = jest.fn();
      jest.spyOn(fs, 'copy').mockImplementation(mockCopy);

      await prepareWorkspace('testPluginDir', 'testWorkSpaceDir');

      expect(mockCopy).toHaveBeenCalledWith(
        'testPluginDir/scripts/AwsTools',
        'testWorkSpaceDir/src/scenes/AwsTools',
        expect.anything()
      );
    });

    it('should copy glTF assets to workspace', async () => {
      const mockCopy = jest.fn();
      jest.spyOn(fs, 'copy').mockImplementation(mockCopy);

      await prepareWorkspace('testPluginDir', 'testWorkSpaceDir');

      expect(mockCopy).toHaveBeenCalledWith(
        'testPluginDir/assets/gLTF',
        'testWorkSpaceDir/assets/gLTF',
        expect.anything()
      );
    });

    it('should create workspace directories for scripts', async () => {
      const mockMkDir = jest.fn();
      jest.spyOn(fs.promises, 'mkdir').mockImplementation(mockMkDir);

      await prepareWorkspace('testPluginDir', 'testWorkSpaceDir');

      expect(mockMkDir).toHaveBeenCalledWith(
        'testWorkSpaceDir/src/scenes/AwsTools',
        { recursive: true }
      );
    });

    it('should create workspace directories for glTF assets', async () => {
      const mockMkDir = jest.fn();
      jest.spyOn(fs.promises, 'mkdir').mockImplementation(mockMkDir);

      await prepareWorkspace('testPluginDir', 'testWorkSpaceDir');

      expect(mockMkDir).toHaveBeenCalledWith(
        'testWorkSpaceDir/assets/gLTF',
        { recursive: true }
      );
    });

    it('should throw custom WorkspaceNotPreparedError when there are errors with fs package', async () => {
      // Fake a copy error.
      jest
        .spyOn(fs, 'copy')
        .mockImplementation(() => Promise.reject(new Error('mock copy error')));

      await expect(
        prepareWorkspace('testPluginDir', 'testWorkSpaceDir')
      ).rejects.toThrow(WorkspaceNotPreparedError);
    });
  });

  describe('validateAssetsPath', () => {
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
  });
});
