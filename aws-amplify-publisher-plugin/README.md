# AWS Tools for Babylon.JS Editor: AWS Amplify Publisher Plugin

AWS Tools for Babylon.JS Editor: AWS Amplify Publisher Plugin (AWS Tools: Amplify Publisher Plugin) is a plugin that enables one-click publishing to AWS Amplify from Babylon.JS Editor.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file.

## Installation

1. If you haven't already, download and install the [Babylon.JS Editor](http://editor.babylonjs.com/)
1. Open the Babylon.JS Editor, in the upper left corner click Edit > Preferences to open the Preferences tab
1. Click "Plugins"
1. Add the plugin to your Babylon.JS Editor:
   - If you are not building the package manually:
     1. Select "Add from NPM..."
     1. Type in "@aws/aws-tools-for-babylonjs-editor-aws-amplify-publisher-plugin"
     1. Press "Ok"
   - If you are building the package manually:
     1. Ensure the plugin has been compiled and built successfully
     1. Select "Add..."
     1. Locate and select the [root folder](.) that contains the plugin (it will be the folder containing `package.json` )
1. Click "Apply" on the bottom left of the preferences window

Note that the editor is not capable of hot reloading; whenever changes to the plugin are made, the editor must be refreshed (close/open the editor, File->Reload Project, or press F5 with the devtools focused, or type `location.reload()` into the console window in the devtools) to see those changes reflected.

To debug the plugin, press ctrl+alt+I (or cmd+option+I on a mac) to bring up the dev tools. If you log to the console, those messages will be routed here.

## Usage

TODO: Define specific steps to utilize the plugin while inside the editor
