module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@tamagui/babel-plugin',
      [
        'module-resolver',
        {
          alias: {
            '@groupfit/shared': '../../packages/shared/src',
          },
        },
      ],
    ],
  };
};
