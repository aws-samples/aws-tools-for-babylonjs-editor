const path = require("path");
const webpack = require("webpack");
const editor = require("babylonjs-editor-webpack-progress");

module.exports = (_, argv) => {
	const entryPath = path.join(__dirname, "src/index.ts");
	const package = require("./package.json");

	return {
		// we output both a minified version & a non minified version on production build
		entry: { "bundle": entryPath },
		output: {
			filename: `bundle.js`,
			path: path.join(__dirname, "dist"),
			library: "game",
			libraryTarget: "umd",
		},
		module: {
			rules: [
				{
					test: /\.ts?$/,
					loader: "ts-loader",
					exclude: [
						path.join(__dirname, "node_modules"),
						path.join(__dirname, "dist"),
						path.join(__dirname, "projects"),
						path.join(__dirname, "scenes"),
					],
				},
				{
					test: /\.fx?$/,
					loader: "raw-loader",
				},
			],
		},
		resolve: {
			extensions: [".ts", ".js"],
		},
		plugins: [
			new webpack.BannerPlugin({
				banner: `${package.name} ${package.version} ${new Date().toString()}`,
			}),
			new webpack.WatchIgnorePlugin({
				paths: [/\.js$/, /\.d\.ts$/],
			}),
			editor.createProgressPlugin(new webpack.ProgressPlugin()),
		],
		optimization: {
			minimize: false,
			usedExports: true,
		},
		devtool: "source-map",
	};
};