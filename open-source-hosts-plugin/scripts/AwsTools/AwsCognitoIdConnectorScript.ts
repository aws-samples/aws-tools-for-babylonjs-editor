// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {Node} from '@babylonjs/core/node';
import * as AWS from 'aws-sdk';
import {visibleInInspector} from '../decorators';
import IAwsConnector from './IAwsConnector';

export default class AwsCognitoIdConnectorScript
  extends Node
  implements IAwsConnector
{
  @visibleInInspector('string', 'Cognito Identity Pool ID', '')
    cognitoIdentityPoolId = '';

  // @ts-ignore DO NOT EDIT this empty constructor!
  protected constructor() {}

  /**
   * The AWS region to use when calling AWS services.
   */
  getRegion(): string | null {
    const cognitoId = this.cognitoIdentityPoolId.trim();
    if (AwsCognitoIdConnectorScript.validateCognitoIdentityPoolId(cognitoId)) {
      return cognitoId.split(':')[0];
    }

    return null;
  }

  protected _credentials: AWS.Credentials | null = null;

  /**
   * The credentials to be used when calling AWS services.
   */
  getCredentials(): AWS.Credentials | null {
    // We're using lazy initialization of this property because there are
    // no BJS Editor lifecyle methods that would allow initialization to
    // happen *after* the Inspector-exposed "cognitoIdentityPoolId" value
    // has been injected but *before* other scripts may request this
    // property.
    if (!this._credentials) {
      const cognitoId = this.cognitoIdentityPoolId.trim();
      if (
        !AwsCognitoIdConnectorScript.validateCognitoIdentityPoolId(cognitoId)
      ) {
        alert(
          `Error: You must set a valid Cognito Identity Pool ID on the "${this.name}" node.`
        );
        return null;
      }
      this._credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.cognitoIdentityPoolId,
      });
    }

    return this._credentials;
  }

  /**
   * Confirms whether the provided value is in the form of a valid
   * Cognito Identity Pool ID.
   *
   * @param value Any string
   * @returns true if the value is valid. Othewise, false.
   */
  static validateCognitoIdentityPoolId(value: string): boolean {
    const cognitoIdRegExp = /[a-z]+-[a-z]+-[0-9]:[a-f0-9-]+([\W]{1}|$)/g;
    return cognitoIdRegExp.test(value);
  }
}
