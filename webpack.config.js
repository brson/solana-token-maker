module.exports = {
    mode: "development",
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "assert": require.resolve("assert/"),
            "fs": false,
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
        ],        
    },
    output: {
        library: "nodeBundle",
    },
    ignoreWarnings: [/Failed to parse source map/],
}
