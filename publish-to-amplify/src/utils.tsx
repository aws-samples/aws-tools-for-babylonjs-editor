// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs-extra';
import archiver from 'archiver-promise';
import path from 'path';
// eslint-disable-next-line import/no-unresolved
import {WorkSpace} from 'babylonjs-editor';
/**
 * Put file into a HTTP URL request body.
 * @param filePath the path of the file.
 * @param url the url string.
 * @returns A Promise that resolves when the file upload is complete.
 * @throws Can throw the same errors thrown by fetch().
 * See [fetch documentation]{@link https://developer.mozilla.org/en-US/docs/Web/API/fetch} for details.
 */
async function httpPutFile(filePath: fs.PathLike, url: string): Promise<void> {
  await fetch(url, {
    method: 'PUT',
    body: fs.readFileSync(filePath),
  });
}

/**
 * Compress files to a zip file.
 * @param sourceDir the path of the source directory.
 * @param destFilePath the path of the destination file.
 * @returns A Promise object that resolves the zip file path.
 * Otherwise, it will reject if no file exists or any errors appear
 * and throw error message to the upper level.
 * @throws An error once the path does not exist.
 */
async function zipFile(
  sourceDir: string,
  destFilePath: string
): Promise<string> {
  if (!fs.pathExistsSync(sourceDir)) {
    throw new Error('Please ensure your build artifacts path exists.');
  }
  const archive = archiver(destFilePath, {store: true});
  await archive.directory(sourceDir, false);
  await archive.finalize();
  return destFilePath;
}

/**
 * Compress the files needed to be host on the server.
 * @param folderPrefix the prefix of the folder's name.
 * @returns A Promise object that resolves the zip file path.
 * @throws An error if it fails to get WorkSpace DirPath or it does not exist.
 */
async function zipArtifacts(folderPrefix: string): Promise<string> {
  let tmpDir: string | undefined;
  const workSpaceDirPath = WorkSpace.DirPath;
  try {
    if (workSpaceDirPath !== null && fs.existsSync(workSpaceDirPath)) {
      const now = new Date();
      tmpDir = fs.mkdtempSync(
        path.join(workSpaceDirPath, `${folderPrefix}${now.getTime()}`)
      );

      // get the scenes folder from the Editor project directory
      const tmpDirScenes = path.join(tmpDir, 'scenes');
      const scenesFolder = path.join(workSpaceDirPath, 'scenes');
      fs.copySync(scenesFolder, tmpDirScenes);

      // get the dist folder from the Editor project directory
      const tmpDirDist = path.join(tmpDir, 'dist');
      const distFolder = path.join(workSpaceDirPath, 'dist');
      fs.copySync(distFolder, tmpDirDist);

      // get the index.html from the Editor project directory
      const tempIndexHTML = path.join(tmpDir, 'index.html');
      const indexHTML = path.join(workSpaceDirPath, 'index.html');
      fs.copyFileSync(indexHTML, tempIndexHTML);
    } else {
      throw new Error(`Cannot get WorkSpace DirPath or it does not exist.`);
    }
    const zipFilePath = `${tmpDir}.zip`;
    return await zipFile(tmpDir, zipFilePath);
  } finally {
    try {
      if (tmpDir) {
        fs.rmdirSync(tmpDir, {recursive: true});
      }
    } catch (error) {
      console.error(
        `An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. ${error}`
      );
    }
  }
}

/**
 * Get the default Domain URL for the given appId and branch.
 * @param appId The Amplify application Id.
 * @param branch The Amplify environment branch name.
 * @returns The domain url for the given appId with the branch.
 */
function getDefaultDomainForBranch(appId: string, branch: string): string {
  return `https://${branch}.${appId}.amplifyapp.com`;
}

export {httpPutFile, zipArtifacts, getDefaultDomainForBranch};
