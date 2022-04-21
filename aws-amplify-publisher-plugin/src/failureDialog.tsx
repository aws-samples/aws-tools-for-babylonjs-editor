// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Button, Classes, Icon, Intent} from '@blueprintjs/core';

type FailureDialogProps = {
  error: string;
  onBack: () => void;
};
/**
 * The dialog to show the failure information.
 * @param props The props passed in from the parent component
 * @returns the FailureDialog component.
 */
export function FailureDialog(props: FailureDialogProps) {
  const {error, onBack} = props;
  const failureTitle = `There was a problem!`;
  const failureText = `${error}`;

  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <p>
          <Icon icon="cross" intent={Intent.NONE} /> {failureTitle}
        </p>
        <p style={{overflowWrap: 'break-word'}}>{failureText}</p>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>
    </>
  );
}
