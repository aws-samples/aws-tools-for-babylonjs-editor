import { ScriptMap } from "./tools";

/**
 * Defines the interface that exposes all exported scripts in this project.
 */
export interface ISceneScriptMap extends ScriptMap {
	"src/scenes/demoSceneScript.ts": any;
	"src/scenes/sumerianhost.ts": any;
}

/**
 * Defines the map of all available scripts in the project.
 */
export const scriptsMap: ISceneScriptMap = {
	"src/scenes/demoSceneScript.ts": require("./demoSceneScript"),
	"src/scenes/sumerianhost.ts": require("./sumerianhost"),
}
