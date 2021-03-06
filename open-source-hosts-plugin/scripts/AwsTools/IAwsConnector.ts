// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as AWS from 'aws-sdk';

/**
 * Interface implemented by any script that can vend AWS credentials to other
 * scripts.
 */
export default interface IAwsConnector {
  /**
   * The AWS region to use when calling AWS services.
   */
  getRegion(): string | null;

  /**
   * The credentials to be used when calling AWS services.
   */
  getCredentials(): AWS.Credentials | null;
}
