module.exports = {
    extends: ["next", "turbo", "prettier"],
    plugins: ["@typescript-eslint"],
    settings: {
        next: {
            rootDir: ["src/*/", "packages/*/"],
        },
    },
    rules: {
        "@next/next/no-html-link-for-pages": "off",
    }
};