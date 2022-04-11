/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {exec} from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import util from 'util';

class DependenciesNotInstalledError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

class AssetsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// These are all relative to the package.json file of the respective projects
const RelativeAssetsDir = 'assets/gLTF/';

const RelativePluginScriptPath = 'scripts/sumerianhost.ts';

// BabylonJS Editor expects to find scripts here, in the sense that
// if you were to create a script in the editor, it would be created here
const RelativeWorkspaceScriptsPath = 'src/scenes/sumerianhost.ts';

const copyDirectory = async (fromDir: string, toDir: string) => {
  await fs.promises.mkdir(toDir, {recursive: true}); // will create nested directories if they don't exist
  await fs.copy(fromDir, toDir, {
    overwrite: false,
    errorOnExist: false,
  });
};

/**
 * This method runs `npm install` of all required runtime directories on the workspace directory,
 * and copies any necessary files over - assets, scripts, etc.
 * @param pluginDir The absolute path to the directory where the plugin resides
 * @param workSpaceDir The absolute path to the workspace open in the BabylonJS Editor
 * @param runtimeDependencies An object that contains runtime dependencies and their versions as key-value pairs
 */
const prepareWorkspace = async (
  pluginDir: string,
  workSpaceDir: string,
  runtimeDependencies: {
    [name: string]: string;
  }
) => {
  try {
    // Check the environment for the path to the interactive shell,
    // which is likely to have $PATH set correctly to find npm.
    // Note that BabylonJS Editor requires npm to be installed locally,
    // so we're reasonably confident it exists.
    const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

    const preparePromises: any[] = [];

    const execPromise = util.promisify(exec);

    // queue up `npm install` commands
    Object.keys(runtimeDependencies).forEach((name) => {
      const version = runtimeDependencies[name];
      preparePromises.push(
        execPromise(`npm install ${name}@${version}`, {
          cwd: workSpaceDir,
          shell,
        })
      );
    });

    // copy runtime script `sumerianhost.ts`
    const pluginScriptPath = path.join(pluginDir, RelativePluginScriptPath);
    const workspaceScriptPath = path.join(
      workSpaceDir,
      RelativeWorkspaceScriptsPath
    );

    preparePromises.push(
      fs.promises.copyFile(pluginScriptPath, workspaceScriptPath)
    );

    // copy assets into the workspace, so that they will be bundled relative to the workspace
    const pluginAssetDir = path.join(pluginDir, RelativeAssetsDir);
    const workspaceAssetDir = path.join(workSpaceDir, RelativeAssetsDir);

    preparePromises.push(copyDirectory(pluginAssetDir, workspaceAssetDir));

    await Promise.all(preparePromises);
  } catch (error) {
    // Ideally we'd like to pass the old error as the cause for the new error,
    // but BabylonJS Editor uses an old version of typescript that doesn't use this field
    // for errors.
    console.log(`Original error's stack: ${error.stack}`);
    throw new DependenciesNotInstalledError(error.message, error);
  }
};

/**
 * This method validates that the assets directory exists - the assets
 * must be asynchronously downloaded as part of the plugin, and are thus not
 * guaranteed to exist.
 */
const validateAssetsPath = (assetsDir: string) => {
  if (!fs.existsSync(assetsDir)) {
    throw new AssetsNotFoundError(
      `Sumerian host assets could not be found at ${assetsDir}`
    );
  }
};

export {
  prepareWorkspace,
  validateAssetsPath,
  AssetsNotFoundError,
  DependenciesNotInstalledError,
  RelativeAssetsDir,
  RelativeWorkspaceScriptsPath,
};
