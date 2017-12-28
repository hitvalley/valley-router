import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'src/valley-router.js',
    format: 'iife',
    name: 'ValleyRouter'
  },
  external: [
    'ValleyModule',
    'valley-module'
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/debug/src/browser.js': ['debug']
      }
    })
  ]
}
