import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/public',
  ],

  javascript: {
    overrides: {
      'brace-style': ['error', '1tbs'],
    },
  },

  vue: {
    overrides: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    },
  },
})
