import {Menu} from '@blueprintjs/core';
// eslint-disable-next-line import/no-unresolved
import {Editor} from 'babylonjs-editor';
import * as React from 'react';
import SumerianAddHostMenu from './hostMenu';

/**
 * The configuration that the Sumerian Toolbar should be initialized with.
 */
interface ISumerianToolbarProps {
  /**
   * A reference to the BabylonJS Editor object.
   * @see {@link Editor}
   */
  editor: Editor;

  /**
   * The absolute path to where the plugin package is found.
   */
  pluginPath: string;
}

/**
 * The Sumerian toolbar is a single button that, when clicked, shows a drop-down menu
 * of helpful tools and dialogs that allow the user to interact with AWS, the Sumerian hosts, etc.
 */
// eslint-disable-next-line react/prefer-stateless-function
class SumerianToolbar extends React.Component<ISumerianToolbarProps> {
  public render(): React.ReactNode {
    const {editor, pluginPath} = this.props;

    return (
      <Menu>
        <SumerianAddHostMenu
          editor={editor}
          pluginPath={pluginPath}
          key="sumerian-add-host-menu"
        />
      </Menu>
    );
  }
}

export default SumerianToolbar;
