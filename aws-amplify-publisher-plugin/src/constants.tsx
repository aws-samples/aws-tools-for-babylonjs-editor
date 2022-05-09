// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * The Status Enum represents different publishing status.
 */
export enum Status {
  Publish = 'publish',
  ExistBranch = 'existBranch',
  Progress = 'progress',
  Success = 'success',
  Failure = 'failure',
}

// Our Github Actions will replace this with a commit SHA at release time
export const PLUGIN_VERSION = 'development';
