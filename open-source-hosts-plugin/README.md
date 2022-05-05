# AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin

AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin (AWS Tools: Open Source Hosts Plugin) is a plugin that enables BabylonJS Editor workflows with Amazon Sumerian Hosts.

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

### Add a host to the scene

**Note:** There is a known issue that causes undesirable shadowing artifacts when you use the Host characters. This is due to an issue in Babylon.js Editor version v4.2.0 with Babylon.js v4.2.1. Until this bug is fixed, you can disable the Screen Space Ambient Occlusion(SSAO) post-processing effect to avoid the issue. Please use the following steps: 1. Click **Scene** in the Graph List. 2. In the Inspector window, select **Rendering** tab. 3. Toggle the **SSAO 2** off.

Locate `Open Source Hosts Tools` in the editor toolbars. When you expand "Add Hosts", you will see a submenu of possible host types, each with their own unique model. Select one to spawn it at the origin of your scene. This will also copy the necessary assets and install the requisite dependencies into your project workspace.

The script `sumerianhost.ts` will be added into your project source; the file will load and configure animations at runtime, such as blinking, lip sync, gestures, etc. The host will track the main camera by default; the configuration of this behavior can be found in this script.

### Configure webpack

The `@amazon-sumerian-hosts` library needs to be configured to use the same instance of BabylonJS as the rest of the project. To do this, add the following to the `module.exports.resolve` block in the `webpack.config.js` for the project:

```
		modules: ['node_modules'],
		alias: {
			'@babylonjs/core': path.resolve('./node_modules/@babylonjs/core')
		}
```

### Configure the text to speech feature

Select the host in the editor and find the `Script` node in the Inspector column. There is a field under `Exported Values` called `Cognito Identity Pool ID` that will need to be filled in with the ARN of a Cognito Identity Pool that has access to Polly.

The `SumerianHost` class has a `speak` utility method that can be used to trigger the host to speak. To make use of it, you may need to get a reference to the SumerianHost node:

```
      // change name to whatever the name of the added host was
      const host = scene.getNodeByName('Cristine') as SumerianHost;
      host.speak("Hello world!");
```
