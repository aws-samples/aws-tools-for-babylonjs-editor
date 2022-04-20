// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Classes, Text, Button} from '@blueprintjs/core';

type OverwriteDialogProps = {
  appName: string;
  envName: string;
  onBack: () => void;
  onOverwrite: (appName: string, envName: string) => void;
};

/**
 * The dialog to show the whether overwrite the branch.
 * @param props The props passed in from the parent component.
 * @returns the OverwriteDialog component.
 */
export function OverwriteDialog(props: OverwriteDialogProps) {
  const {appName, envName, onBack, onOverwrite} = props;
  const overwriteText = `An application is already deployed to ${appName}(${envName}). Overwrite?`;

  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <Text>{overwriteText}</Text>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onBack}>Back</Button>
          <Button onClick={() => onOverwrite(appName, envName)}>
            Overwrite
          </Button>
        </div>
      </div>
    </>
  );
}
