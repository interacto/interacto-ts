module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "tsconfig.eslint.json",
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-tsdoc'
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: [
        "test/**/*.test.ts"
      ],
      env: {
        jest: true
      },
      extends: ["plugin:jest/all"],
      plugins: ["jest"],
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/prefer-spy-on": "off",
        "jest/prefer-expect-assertions": "off",
        "jest/no-hooks": "off",
        "jest/require-top-level-describe": "off",
        "jest/consistent-test-it": ["error", {"fn": "test", "withinDescribe": "test"}],
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/non-nullable-type-assertion-style": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/await-thenable": "off",
        "max-lines-per-function": "off",
        "object-property-newline": "off",
        "complexity": ["error", { "max": 20 }],
      }
    }
  ],
  extends: [
    "eslint:all",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/all",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],

  "rules": {
    "id-length": "off",
    "no-new": "off",
    "no-underscore-dangle": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",

    "tsdoc/syntax": "error",

    "func-style": "off",
    "max-lines": "off",
    "prefer-destructuring": "off",
    "no-lonely-if": "off",
    "multiline-comment-style": "off",
    "capitalized-comments": "off",
    "no-plusplus": "off",
    "no-extra-parens": "off",
    "dot-location": "off",
    "sort-keys": "off",
    "array-element-newline": "off",
    "function-paren-newline": "off",
    "max-params": "off",
    "no-ternary": "off",
    "multiline-ternary": "off",
    "max-classes-per-file": "off",
    "max-statements": "off",
    "init-declarations": "off",
    "keyword-spacing": "off",
    "space-before-function-paren": "off",
    "function-call-argument-newline": "off",
    "no-mixed-operators": "off",
    "class-methods-use-this": "off",
    "lines-between-class-members": "off",
    "no-unused-expressions": "off",
    "no-undefined": "off",
    "padded-blocks": "off",
    "lines-around-comment": "off",
    "sort-imports": "off",
    "no-magic-numbers": "off",
    "indent": "off",

    "@typescript-eslint/no-type-alias": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "@typescript-eslint/init-declarations": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/method-signature-style": "off",
    "@typescript-eslint/no-extra-parens": "off",
    "@typescript-eslint/no-invalid-this": "off",
    "@typescript-eslint/no-unused-expressions": "off",

    "@typescript-eslint/typedef": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/array-type": ["error", { "default": "generic"}],
    "@typescript-eslint/explicit-member-accessibility": ["error", { "accessibility": "explicit" }],
    "@typescript-eslint/indent": ["error", 4, {
        "FunctionDeclaration": { "parameters": "first" },
        "FunctionExpression": { "parameters": "first" }
    }],

    "@typescript-eslint/prefer-nullish-coalescing": ["error",
      {"ignoreMixedLogicalExpressions" : false, "ignoreConditionalTests": false}],
    "@typescript-eslint/quotes": [
        "error",
        "double"
    ],
    "arrow-parens": ["error", "as-needed"],
    "complexity": ["error", { "max": 10 }],
    "eqeqeq": ["error", "smart"],
    "max-len": ["error", { "code": 150 }],
    "no-multiple-empty-lines": ["error", { "max": 2 }],
    "no-restricted-syntax": ["error", "ForInStatement"],
    "one-var": ["error", "never"],
  }
};
