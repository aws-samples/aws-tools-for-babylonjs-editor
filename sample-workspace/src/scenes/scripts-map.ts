import { ScriptMap } from "./tools";

/**
 * Defines the interface that exposes all exported scripts in this project.
 */
export interface ISceneScriptMap extends ScriptMap {
	"src/scenes/AwsCognitoIdConnector.ts": any;
	"src/scenes/domUtils.ts": any;
	"src/scenes/IAwsConnector.ts": any;
	"src/scenes/SceneScript.ts": any;
	"src/scenes/sumerianhost.ts": any;
}

/**
 * Defines the map of all available scripts in the project.
 */
export const scriptsMap: ISceneScriptMap = {
	"src/scenes/AwsCognitoIdConnector.ts": require("./AwsCognitoIdConnector"),
	"src/scenes/domUtils.ts": require("./domUtils"),
	"src/scenes/IAwsConnector.ts": require("./IAwsConnector"),
	"src/scenes/SceneScript.ts": require("./SceneScript"),
	"src/scenes/sumerianhost.ts": require("./sumerianhost"),
}
