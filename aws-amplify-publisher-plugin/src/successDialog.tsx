// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Button, Classes, Text, Icon, Intent} from '@blueprintjs/core';

type SuccessProps = {
  appName: string;
  envName: string;
  domainAddress: string;
  onClose: () => void;
};

/**
 * The dialog to show the successful deployment information.
 * @param props The props passed in from the parent component.
 * @returns the SuccessDialog component.
 */
export function SuccessDialog(props: SuccessProps) {
  const {appName, envName, domainAddress, onClose} = props;
  const successTitle = `Deployment complete.`;
  const successText = `${appName} (${envName})`;
  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <p>
          <Icon icon="tick" intent={Intent.NONE} /> {successTitle}
        </p>
        <Text>{successText}</Text>
        <Text>{domainAddress}</Text>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </>
  );
}
