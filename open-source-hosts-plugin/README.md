# AWS Tools for Babylon.JS Editor: Open Source Hosts Plugin
AWS Tools:  Open Source Hosts Plugins is set of tools that enables BabylonJS editor workflows with Amazon Sumerian Hosts.

## Development instructions

1. Because we rely on packages that have not yet been published to the NPM registry, you will need to run `git clone` on `mainline2.0` of the [Amazon Sumerian Hosts](https://github.com/aws-samples/amazon-sumerian-hosts/tree/mainline2.0) repository to pull it somewhere local. From that repository, run `npm run build` and then cd into the `packages/amazon-sumerian-hosts-babylon` directory and run `npm link` to make the submodule available locally.
1. Install the other plugin dependencies defined in `package.json`:  
   `npm install`  
   **Note that this will download the required asset files as a script run during post-install -- this may take a while!**
1. From the plugin directory, run `npm link @amazon-sumerian-hosts/babylon`
1. Format, lint, and compile the Typescript code into Javascript
   `npm run build`

## Load the plugin

1. Open the Babylon Editor, click Edit > Preferences to open the Preferences tab, click "Plugins" in the upper right corner
1. Click "Add"
1. Select the root folder that contains the plugin (it will be the folder containing `package.json` ) -- the plugin must be compiled
1. Click "Apply" on the bottom left of the preferences window

Note that the editor is not capable of hot reloading; whenever changes to the plugin are made, the editor must be refreshed (close/open the editor, File->Reload Project, or press F5 with the devtools focused, or type `location.reload()` into the console window in the devtools) to see those changes reflected.

To debug the plugin, press ctrl+alt+I (or cmd+option+I on a mac) to bring up the dev tools. If you log to the console, those messages will be routed here.
