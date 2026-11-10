
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['react-native-a11y'],
  extends: ['plugin:react-native-a11y/all'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
