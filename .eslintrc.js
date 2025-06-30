module.exports = {
  root: true,

  
    env: {
  browser: true,
  node: true,
  es6: true,

  },

  extends: [
    'eslint:recommended'
  ],

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: '@babel/eslint-parser'
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-reserved-component-names': 'off',
        'vue/no-v-for-template-key-on-child': 'off',


  },

  'extends': [
    'eslint:recommended',
    'plugin:vue/essential'
  ]
};
