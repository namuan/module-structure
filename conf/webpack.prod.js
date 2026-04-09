const webpack = require("webpack");
const { merge: webpackMerge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const helpers = require("./helpers");
const ENV = process.env.NODE_ENV = process.env.ENV = "production";

module.exports = webpackMerge(commonConfig, {
    mode: "production",
    output: {
        path: helpers.root("dist/web-app"),
        publicPath: "",
        filename: "[name].[contenthash].js",
        chunkFilename: "[id].[contenthash].chunk.js"
    },

    module: {
        rules: [
            {test: /\.ts$/, use: {loader: "ts-loader", options: {configFile: "conf/tsconfig.prod.json"}}}
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "process.env.ENV": JSON.stringify(ENV),
            "process.env.NODE_ENV": JSON.stringify(ENV)
        })
    ]
});
