module.exports = {
    root: true,
    env: {
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'google',
    ],
    rules: {
        indent: ['error', 4],
    },
};
