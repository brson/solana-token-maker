const webpack = require("webpack");

module.exports = {
    mode: "development",
    output: {
        filename: "node-bundle.js",
        library: "nodeBundle",
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "assert": require.resolve("assert/"),
            "fs": false,
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
        ],        
    },
    ignoreWarnings: [/Failed to parse source map/],
}
