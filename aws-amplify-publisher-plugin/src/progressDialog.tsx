// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {ProgressBar, Classes, Text} from '@blueprintjs/core';

/**
 * The dialog to show the progress information of the current deployment.
 * @returns the ProgressDialog component.
 */
export function ProgressDialog() {
  const progressText = `Deploying application...`;
  return (
    <div className={Classes.DIALOG_BODY}>
      <Text>{progressText}</Text>
      <ProgressBar />
    </div>
  );
}
