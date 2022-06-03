# AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin

AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin (AWS Tools: Open Source Hosts Plugin) is a plugin that enables BabylonJS Editor workflows with Amazon Sumerian Hosts.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file.

## Installation

1. If you haven't already, download and install the [Babylon.JS Editor](http://editor.babylonjs.com/)
1. Open the Babylon.JS Editor, in the upper left corner click Edit > Preferences to open the Preferences tab
1. Click "Plugins"
1. Add the plugin to your Babylon.JS Editor:
   - If you are installing directly from NPM (recommended):
     1. Select "Add from NPM..."
     1. Type in "@aws/aws-tools-for-babylonjs-editor-open-source-hosts-plugin"
     1. Press "Ok"
   - If you'd like to build the plugin from source:
     1. Clone this repository.
     1. Follow the instructions in this package's [CONTRIBUTING.md](CONTRIBUTING.md) file to build the plugin.
     1. Back in the Babylon.JS Editor "Plugins" window, select "Add..."
     1. Locate and select the `open-source-hosts-plugin` folder in your local repository.
1. Click "Apply" on the bottom left of the preferences window

Note that the editor is not capable of hot reloading; whenever changes to the plugin are made, the editor must be refreshed (close/open the editor, File->Reload Project, or press F5 with the devtools focused, or type `location.reload()` into the console window in the devtools) to see those changes reflected.

To debug the plugin, press ctrl+alt+I (or cmd+option+I on a mac) to bring up the dev tools. If you log to the console, those messages will be routed here.

## Usage

### Add a host to the scene

> ⚠️ **Note:** There is a known issue that causes undesirable shadowing artifacts when you use the Host characters. This is due to an issue in Babylon.js Editor v4.2.0 with Babylon.js v4.2.1. Until this bug is fixed, you can disable the Screen Space Ambient Occlusion (SSAO) post-processing effect to avoid the issue. Please use the following steps: 1. Click **Scene** in the Graph List. 2. In the Inspector window, select **Rendering** tab. 3. Toggle the **SSAO 2** off.

Locate `Open Source Hosts Tools` in the editor toolbars. When you expand "Add Hosts", you will see a submenu of possible host characters, each with their own unique model. Select one to spawn it at the origin of your scene. This will automatically copy some scripts to your workspace under `src/scenes/AwsTools/`. It will also create two new nodes in your scene: "AWSConnector" and a node named after the character you selected (example: "Cristine").

Select the "AWSConnector" node.

In the Inspector, set the "Cognito Identity Pool ID" value of the attached script to a Cognito Identity Pool ID you've configured in your AWS account which has *"AmazonPollyReadOnlyAccess"*. For a full walk-through of how to set this up, see [AWS Infrastructure Setup.md](https://github.com/aws-samples/amazon-sumerian-hosts/blob/mainline2.0/AWS-Infrastructure-Setup.md). 

### Configure webpack

The `@amazon-sumerian-hosts` library needs to be configured to use the same instance of BabylonJS as the rest of the project. To do this, add the following to the `module.exports.resolve` block in the `webpack.config.js` for the project:

```
		modules: ['node_modules'],
		alias: {
			'@babylonjs/core': path.resolve('./node_modules/@babylonjs/core')
		}
```

### Test your host

After you've completed the above steps your host character is ready for use in your application. If you run the scene now you'll see that the host character comes alive and always looks toward the camera as you move it. However, hosts are pretty boring until you start writing code to interact with them.

To get you started, we've provided a simple "HelloWorldScript.ts". To use this script, do the following...

Add a new dummy node to your scene using the **Add** button *at the top of the screen*: **Add > Dummy Node**.

Select the dummy node in the scene hierarchy.

In the Asset Browser, locate the "HelloWorldScript.ts" found under `src/scenes/AwsTools/`. Attach this script to the dummy node by drag-dropping it from the Asset Browser to the "Script" section of the Inspector panel.

In the Inspector, set the "Host Node Name" property to "Cristine" (or whichever host you added).

*(Optional)* Change the value of the "Speech Text" property.

Run the scene.

Click anywhere in the scene to give it keyboard focus and then press the "t" key to make the host speak.