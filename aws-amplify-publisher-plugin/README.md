# AWS Tools for Babylon.JS Editor: AWS Amplify Publisher Plugin
AWS Tools: Amplify Publisher Plugins is a set of tools that enables one-click publishing to AWS Amplify.

## Development instructions
1. Install the plugin dependencies defined in `package.json`:
`npm install`
2. Compile the Typescript code into Javascript
`npm run compile`

## Load the plugin
1. Open the Babylon Editor, click Edit > Preferences to open the Preferences tab, click "Plugins" in the upper right corner
1. Click "Add" 
1. Select the root folder that contains the plugin (it will be the folder containing `package.json` )
1. Click "Apply" on the bottom left of the preferences window

Note that the editor is not capable of hot reloading; whenever changes to the plugin are made, the editor must be refreshed (close/open the editor, press F5 with the devtools focused, or type `location.reload()` into the console window in the devtools) to see those changes reflected.

To debug the plugin, press ctrl+alt+I (or cmd+option+I on a mac) to bring up the dev tools. If you log to the console, those messages will be routed here.
