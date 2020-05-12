const CracoAlias = require('craco-alias');

module.exports = {
  devServer: { proxy: { '/api': 'http://localhost:2351' } },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'options',
        aliases: {
          '@components': 'src/components',
        },
      },
    },
  ],
};
