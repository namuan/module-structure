const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const helpers = require("./helpers");


module.exports = {
    entry: {
        "app": "./src/structure-view/main.ts"
    },

    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            jquery: require("path").resolve(__dirname, "../node_modules/jquery/dist/jquery.js")
        }
    },

    module: {
        rules: [
            {test: /\.html$/, use: "html-loader"},
            {test: /\.(png|jpe?g|gif|woff|woff2|ttf|eot|ico|svg)$/, type: "asset/resource", generator: {filename: "assets/[name][hash][ext]"}},
            {test: /\.css$/,
                exclude: helpers.root("src", "app"),
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {test: /\.scss$/, use: [
                    {loader: MiniCssExtractPlugin.loader},
                    {loader: "css-loader"},
                    {loader: "sass-loader"}
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: "[name].css"}),
        new HtmlWebpackPlugin({
            template: "src/structure-view/index.html"
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};
