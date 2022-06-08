// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {execFile} from 'child_process';
import fixPath from 'fix-path';
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

class WorkspaceNotPreparedError extends Error {
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
const RELATIVE_ASSETS_DIR = 'assets';
const RELATIVE_GLTF_ASSETS_DIR = path.join(RELATIVE_ASSETS_DIR, 'gLTF');

// Any scripts in this plugin subdirectory will be copied to the workspace.
const RELATIVE_PLUGIN_SCRIPTS_PATH = path.join('scripts', 'AwsTools');

// BabylonJS Editor requires scripts be stored anywhere below the
// `src/scenes/` directory within the workspace.
const RELATIVE_WORKSPACE_SCRIPTS_PATH = path.join('src', 'scenes', 'AwsTools');

/**
 * Copy the directory from one path to the other one.
 * @param fromDir The source directory
 * @param toDir The destination directory
 */
const copyDirectory = async (fromDir: string, toDir: string): Promise<void> => {
  await fs.promises.mkdir(toDir, {recursive: true}); // will create nested directories if they don't exist
  await fs.copy(fromDir, toDir, {
    overwrite: false,
    errorOnExist: false,
  });
};

/**
 * This method runs `npm install` of all required runtime directories on the workspace directory
 * @param workSpaceDir The absolute path to the workspace open in the BabylonJS Editor
 * @param runtimeDependencies An object that contains runtime dependencies and their versions as key-value pairs
 * @throws {DependenciesNotInstalledError}
 */
const installDependencies = async (
  workSpaceDir: string,
  runtimeDependencies: {
    [name: string]: string;
  }
): Promise<void> => {
  try {
    // Check the environment for the path to the interactive shell,
    // which is likely to have $PATH set correctly to find npm.
    // Note that BabylonJS Editor expects npm to be installed locally,
    // so we're reasonably confident it exists.
    const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];

    fixPath();

    const installPromises: any[] = [];

    const execFilePromise = util.promisify(execFile);

    // queue up `npm install` commands
    Object.keys(runtimeDependencies).forEach((name) => {
      const version = runtimeDependencies[name];
      installPromises.push(
        execFilePromise('npm', ['install', `${name}@${version}`], {
          cwd: workSpaceDir,
          shell,
        })
      );
    });

    await Promise.all(installPromises);
  } catch (error) {
    // Ideally we'd like to pass the old error as the cause for the new error,
    // but BabylonJS Editor uses an old version of typescript that doesn't use this field
    // for errors.
    console.log(`Original error's stack: ${error.stack}`);
    throw new DependenciesNotInstalledError(error.message, error);
  }
};

/**
 * This method runs copies any necessary files over from the
 * plugin directory to the workspace directory - assets, scripts, etc.
 * @param pluginDir The absolute path to the directory where the plugin resides
 * @param workSpaceDir The absolute path to the workspace open in the BabylonJS Editor
 * @throws {WorkspaceNotPreparedError}
 */
const prepareWorkspace = async (
  pluginDir: string,
  workSpaceDir: string
): Promise<void> => {
  try {
    const copyPromises: any[] = [];

    // Copy our custom Editor scripts to the workspace.
    const scriptsSourceDirectory = path.join(
      pluginDir,
      RELATIVE_PLUGIN_SCRIPTS_PATH
    );
    const scriptsTargetDirectory = path.join(
      workSpaceDir,
      RELATIVE_WORKSPACE_SCRIPTS_PATH
    );
    copyPromises.push(
      copyDirectory(scriptsSourceDirectory, scriptsTargetDirectory)
    );

    // copy asset directory into the workspace, so that they will be bundled relative to the workspace
    const pluginAssetDir = path.join(pluginDir, RELATIVE_GLTF_ASSETS_DIR);
    const workspaceAssetDir = path.join(workSpaceDir, RELATIVE_GLTF_ASSETS_DIR);

    copyPromises.push(copyDirectory(pluginAssetDir, workspaceAssetDir));

    await Promise.all(copyPromises);
  } catch (error) {
    // Ideally we'd like to pass the old error as the cause for the new error,
    // but BabylonJS Editor uses an old version of typescript that doesn't use this field
    // for errors.
    console.log(`Original error's stack: ${error.stack}`);
    throw new WorkspaceNotPreparedError(error.message, error);
  }
};

/**
 * This method validates that the assets directory exists - the assets
 * must be asynchronously downloaded as part of the plugin, and are thus not
 * guaranteed to exist.
 * @param assetsDir The path to the assets directory
 * @throws {AssetsNotFoundError}
 */
const validateAssetsPath = (assetsDir: string): void => {
  if (!fs.existsSync(assetsDir)) {
    throw new AssetsNotFoundError(
      `Sumerian Host assets could not be found at ${assetsDir}`
    );
  }
};

export {
  prepareWorkspace,
  validateAssetsPath,
  installDependencies,
  AssetsNotFoundError,
  DependenciesNotInstalledError,
  WorkspaceNotPreparedError,
  RELATIVE_ASSETS_DIR,
  RELATIVE_GLTF_ASSETS_DIR,
  RELATIVE_WORKSPACE_SCRIPTS_PATH as RELATIVE_WORKSPACE_SCRIPT_PATH,
};
