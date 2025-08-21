module.exports = {
  root: true,
  extends: '@react-native',
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' }
    }
  }
};