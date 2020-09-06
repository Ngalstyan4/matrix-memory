const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  watch: false, // using dev server so no need
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, ''),
  },
  devServer: {
    watchContentBase: true,
    liveReload: true,
  }
};