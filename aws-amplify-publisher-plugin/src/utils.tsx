// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs-extra';
import archiver from 'archiver-promise';
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
export async function httpPutFile(
  filePath: fs.PathLike,
  url: string
): Promise<void> {
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
    throw new Error(
      `Please ensure the build artifacts path ${sourceDir} exists.`
    );
  }
  const archive = archiver(destFilePath, {store: true});
  await archive.directory(sourceDir, false);
  await archive.finalize();
  return destFilePath;
}

/**
 * Compress the files needed to be host on the server.
 * @returns A Promise object that resolves the zip file path.
 */
export async function zipArtifacts(): Promise<string> {
  const workSpaceDirPath = WorkSpace.DirPath;
  if (workSpaceDirPath == null || !fs.existsSync(workSpaceDirPath)) {
    throw new Error(
      `Cannot get WorkSpace directory ${workSpaceDirPath}, or it does not exist.`
    );
  }
  const zipFilePath = `${workSpaceDirPath}.zip`;
  return zipFile(workSpaceDirPath, zipFilePath);
}

/**
 * Get the default Domain URL for the given appId and branch.
 * @param appId The Amplify application Id.
 * @param branch The Amplify environment branch name.
 * @returns The domain url for the given appId with the branch.
 */
export function getDefaultDomainForBranch(
  appId: string,
  branch: string
): string {
  return `https://${branch}.${appId}.amplifyapp.com`;
}
