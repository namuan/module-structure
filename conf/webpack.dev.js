const { merge: webpackMerge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const helpers = require("./helpers");

module.exports = webpackMerge(commonConfig, {
    mode: "development",
    devtool: "source-map",

    output: {
        path: helpers.root("dist/web-app"),
        publicPath: "http://localhost:8080/",
        filename: "[name].js",
        chunkFilename: "[id].chunk.js"
    },

    module: {
        rules: [
        ]
    },

    devServer: {
        historyApiFallback: true,
        hot: true
    }
});
