// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

// eslint-disable-next-line import/no-unresolved
import {Editor} from 'babylonjs-editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {Menu, MenuItem} from '@blueprintjs/core';

import {AmplifyPublishDialog} from './amplifyPublishDialog';

/**
 * The configuration that the Sumerian Toolbar should be initialized with.
 */
type SumerianToolbarProps = {
  /**
   * A reference to the BabylonJS Editor object.
   * @see {@link Editor}
   */
  editor: Editor;
};

/**
 * Mutable values that will change at runtime
 */
type SumerianToolbarState = {
  /**
   * This boolean state determines whether the Amplify publish dialog
   * is visible and therefore should be rendered to the user
   */
  isPublishDialogOpen: boolean;
};

/**
 * The Sumerian toolbar is a single button that, when clicked, shows a drop-down menu
 * of helpful tools and dialogs that allow the user to interact with AWS, the Sumerian hosts, etc.
 */
export class SumerianToolbar extends React.Component<
  SumerianToolbarProps,
  SumerianToolbarState
> {
  public constructor(props: Readonly<SumerianToolbarProps>) {
    super(props);

    this.state = {
      isPublishDialogOpen: false,
    };
  }

  private _handleClose = () => {
    this._hidePublishDialog();
  };

  private _handlePublishClick = () => {
    this._showPublishDialog();
  };

  private _showPublishDialog() {
    this.setState({isPublishDialogOpen: true});
  }

  private _hidePublishDialog() {
    this.setState({isPublishDialogOpen: false});
  }

  public render(): React.ReactNode {
    const {editor} = this.props;
    const {isPublishDialogOpen} = this.state;

    return (
      <>
        <Menu>
          <MenuItem
            text="AWS Amplify Hosting"
            onClick={this._handlePublishClick}
            shouldDismissPopover={false}
          />
        </Menu>
        <AmplifyPublishDialog
          editor={editor}
          isOpen={isPublishDialogOpen}
          handleClose={this._handleClose}
        />
      </>
    );
  }
}
