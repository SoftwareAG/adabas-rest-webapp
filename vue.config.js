module.exports = {
  devServer: {
    // host: '127.0.0.1',
    // port: 8080,
    // public: '192.168.178.70:8080',
    disableHostCheck: true
  },
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.ts',
      title: 'Adabas REST-Console',
    },
  },
  publicPath: '.'
};

