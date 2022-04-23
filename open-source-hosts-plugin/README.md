# AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin

AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin (AWS Tools: Open Source Hosts Plugin) is a set of tools that enables BabylonJS Editor workflows with Amazon Sumerian Hosts.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file.

## Installation

1. If you haven't already, download and install the [Babylon.JS Editor](http://editor.babylonjs.com/)
1. Open the Babylon.JS Editor, in the upper left corner click Edit > Preferences to open the Preferences tab
1. Click "Plugins"
1. Add the plugin to your Babylon.JS Editor:
   - If you are not building the package manually:
     1. Select "Add from NPM..."
     1. Type in "@aws/aws-tools-for-babylonjs-editor-open-source-hosts-plugin"
     1. Press "Ok"
   - If you are building the package manually:
     1. Ensure the plugin has been compiled and built successfully
     1. Select "Add..."
     1. Locate and select the [root folder](.) that contains the plugin (it will be the folder containing `package.json` )
1. Click "Apply" on the bottom left of the preferences window

Note that the editor is not capable of hot reloading; whenever changes to the plugin are made, the editor must be refreshed (close/open the editor, File->Reload Project, or press F5 with the devtools focused, or type `location.reload()` into the console window in the devtools) to see those changes reflected.

To debug the plugin, press ctrl+alt+I (or cmd+option+I on a mac) to bring up the dev tools. If you log to the console, those messages will be routed here.

## Usage

TODO: Define specific steps to utilize the tool while inside the editor

## Contributing

### Prerequisites

- Refer to all [prerequisites](https://github.com/aws-samples/aws-tools-for-babylonjs-editor/README.md#prerequisites) from the primary repository

### Building

1. Because we rely on packages that have not yet been published to the NPM registry, you will need to run `git clone` on `mainline2.0` of the [Amazon Sumerian Hosts](https://github.com/aws-samples/amazon-sumerian-hosts/tree/mainline2.0) repository to pull it somewhere local. From that repository, run `npm run build` and then cd into the `packages/amazon-sumerian-hosts-babylon` directory and run `npm link` to make the submodule available locally.
1. Install the other plugin dependencies defined in `package.json`:  
   `npm install`  
   **Note that this will download the required asset files as a script run during post-install -- this may take a while!**
1. From the plugin directory, run `npm link @amazon-sumerian-hosts/babylon`
1. Format, lint, and compile the Typescript code into Javascript
   `npm run build`

### Testing

TODO: Fill out
