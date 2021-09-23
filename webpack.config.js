module.exports = {
    mode: "development",
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            //"process": require.resolve("process/browser"),
            "assert": require.resolve("assert/"),
            "fs": false,
        }
    }
}
