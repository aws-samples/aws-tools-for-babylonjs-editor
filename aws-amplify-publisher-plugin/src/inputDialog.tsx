// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Classes, Button, FormGroup, Label} from '@blueprintjs/core';

type InputDialogProps = {
  appName: string;
  envName: string;
  onPublish: (appName: string, envName: string) => void;
  onAppNameChange: (appName: string) => void;
  onEnvNameChange: (envName: string) => void;
  onClose: () => void;
};

/**
 * The dialog to show the input when publishing to Amplify.
 * @param props The props passed in from the parent component.
 * @returns the InputDialog component.
 */
export function InputDialog(props: InputDialogProps) {
  const {
    appName,
    envName,
    onPublish,
    onAppNameChange,
    onEnvNameChange,
    onClose,
  } = props;
  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <FormGroup>
          <Label>
            App Name
            <input
              onChange={(evt) => {
                onAppNameChange(evt.target.value);
              }}
              value={appName}
              className={Classes.INPUT}
              minLength={3}
              maxLength={1024}
              id="amplify-app-name"
              name="amplify-app-name"
            />
          </Label>
          <Label>
            Environment name (dev, test, prod, ...)
            <input
              onChange={(evt) => onEnvNameChange(evt.target.value)}
              value={envName}
              className={Classes.INPUT}
              minLength={1}
              maxLength={255}
              id="amplify-env-name"
              name="amplify-env-name"
            />
          </Label>
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={() => onPublish(appName, envName)}
            disabled={!appName || !envName}
            type="submit"
          >
            Publish
          </Button>
        </div>
      </div>
    </>
  );
}
