module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Target modern browsers only to reduce CSS prefixes
      overrideBrowserslist: [
        'Chrome >= 90',
        'Firefox >= 88',
        'Safari >= 14',
        'Edge >= 90',
      ],
    },
  },
}

