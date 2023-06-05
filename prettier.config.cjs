/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  tabWidth: 2,
  useTabs: true,
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  arrowParens: "always",
  printWidth: 80,
  endOfLine: "lf",
  overrides: [
    {
      files: "*.md",
      options: {
        tabWidth: 2,
        semi: false,
        singleQuote: false,
        trailingComma: "none",
        arrowParens: "avoid",
        printWidth: 80,
        proseWrap: "always",
      },
    },
  ],
};

module.exports = config;
