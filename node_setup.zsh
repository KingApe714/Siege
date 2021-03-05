
npm init --yes 

npm install -D webpack-cli
npm install @babel/core
npm install @babel/preset-env
npm install @babel/preset-react
npm install babel-loader
npm install webpack@4.46.0

touch .gitignore
echo "node_modules
bundle.js
bundle.js.map" >> .gitignore

touch webpack.config.js
echo "const path = require('path');

module.exports = {
  context: __dirname,
  entry: './index.html',
  output: {
    path: path.resolve(__dirname, 'app', 'assets','javascripts'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/env', '@babel/react']
          }
        },
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '*']
  }
};
" >> webpack.config.js