/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
const path = require("path");
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: "module",
    // 型情報によるLintを無効にして軽量化
    // project: [path.resolve(__dirname, "tsconfig.json")],
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // ✅ Prettierルールを自動で適用
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  ignorePatterns: ["/lib/**/*", "/generated/**/*"],
  rules: {
    quotes: ["error", "double"],
    indent: "off", // ✅ Prettierに任せる
    "prettier/prettier": "warn", // ✅ フォーマットの警告だけ出す
    "import/no-unresolved": 0,
    "max-len": ["warn", { code: 120 }],
    "quote-props": 0,
    "object-curly-spacing": "off",
    "operator-linebreak": "off", // ✅ Prettierに任せる
  },
};
