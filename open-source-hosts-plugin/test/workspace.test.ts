

jest.mock("fs", () => ({
  promises: {
    copyFile: jest.fn(),
    mkdir: jest.fn()
  }
}));
import fs from 'fs-extra';

import {prepareWorkspace} from '../src/workspace';

const mockCopy = jest.fn();
const mockExistsSync = jest.fn();

describe('workspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(fs.promises, 'fs.promises.copyFile').mockResolvedValue();
    jest.spyOn(fs, 'copy').mockImplementation(mockCopy);
    jest.spyOn(fs, 'existsSync').mockImplementation(mockExistsSync);
  });

  it('should call fs.promise.copyFile', async () => {
    await prepareWorkspace('testPluginDir', 'testWorkspaceDir');
    expect(fs.promises.copyFile).toHaveBeenCalledTimes(1);
  });
});
