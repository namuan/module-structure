const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            // class-name: class names must be PascalCase
            "@typescript-eslint/naming-convention": [
                "error",
                {selector: "class", format: ["PascalCase"]}
            ],
            // no-duplicate-variable
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": ["error"],
            // no-eval
            "no-eval": "error",
            // no-var-keyword
            "no-var": "error",
            // quotemark: double quotes
            "quotes": ["error", "double", {avoidEscape: true}],
            // semicolon
            "semi": ["error", "always"],
            // triple-equals (allow null check via == null / != null)
            "eqeqeq": ["error", "always", {"null": "ignore"}],
            // no-trailing-whitespace
            "no-trailing-spaces": "error",
            // indent: spaces
            "indent": ["error", 4, {SwitchCase: 1}],
            // comment-format: space after //
            "spaced-comment": ["error", "always"]
        }
    }
];
