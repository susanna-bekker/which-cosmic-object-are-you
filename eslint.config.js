const browserGlobals = {
    document: "readonly",
    window: "readonly",
    console: "readonly",
    Image: "readonly",
    setTimeout: "readonly",
    clearTimeout: "readonly",
};

const nodeGlobals = {
    require: "readonly",
    module: "writable",
    process: "readonly",
    console: "readonly",
    __dirname: "readonly",
};

module.exports = [
    {
        ignores: ["node_modules/**"],
    },
    {
        // the browser scripts, loaded as plain <script> tags
        files: ["script.js", "data.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                ...browserGlobals,
                // defined in data.js, used in script.js
                data: "readonly",
                results: "readonly",
            },
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": ["error", { args: "none" }],
            eqeqeq: "error",
            "no-var": "error",
        },
    },
    {
        // data.js only declares the quiz content; it is consumed by script.js
        files: ["data.js"],
        rules: {
            "no-unused-vars": "off",
        },
    },
    {
        // build/CI helpers, run by node
        files: ["scripts/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: nodeGlobals,
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": "error",
            eqeqeq: "error",
        },
    },
];
