export default {
  input: 'src/index.js',
  output: {
    file: 'src/valley-router-node.js',
    format: 'cjs'
  },
  external: [
    'valley-module',
    'debug',
    'path-to-regexp'
  ]
};
