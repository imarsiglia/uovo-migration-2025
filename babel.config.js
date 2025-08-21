// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@utils': './src/utils',
          '@screens': './src/screens',
          '@components': './src/components',
          '@styles': './src/styles',
          '@config': './src/config',
          '@api': './src/api',
          '@store': './src/store',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@assets': './src/assets',
        },
      },
    ],
    // Si usas Reanimated, DESCOMENTA y deja esta línea al final:
    'react-native-reanimated/plugin',
  ],
};
