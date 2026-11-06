export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 28px 80px rgba(15, 79, 45, 0.12)',
      },
      backgroundImage: {
        'soft-gradient': 'radial-gradient(circle at top left, rgba(74, 222, 128, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(93, 182, 238, 0.12), transparent 28%)'
      }
    }
  },
  plugins: [],
}
