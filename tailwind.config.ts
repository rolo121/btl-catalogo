import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  mode: 'jit',
  jit: true,
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    container: {
      padding: {
        DEFAULT: '16px',
      },
    },
    colors: {
      transparent: 'transparent',

      // BTL Marketing brand colors
      primary: 'var(--primary)',
      'primary-dark': 'var(--primary-dark)',
      'primary-hover': 'var(--primary-hover)',
      'primary-soft': 'var(--primary-soft)',

      secondary: 'var(--secondary)',
      'brand-secondary': 'var(--brand-secondary)',
      'brand-secondary-soft': 'var(--brand-secondary-soft)',
      'brand-secondary-muted': 'var(--brand-secondary-muted)',
      'secondary-soft': 'var(--brand-secondary-soft)',
      'secondary-muted': 'var(--brand-secondary-muted)',

      // Reading colors
      black: 'var(--text-strong)',
      text: 'var(--text)',
      'text-strong': 'var(--text-strong)',
      'text-secondary': 'var(--text-secondary)',
      'text-muted': 'var(--text-muted)',
      'text-soft': 'var(--text-soft)',
      secondary2: 'var(--secondary2)',

      // Surfaces
      white: 'var(--white)',
      surface: 'var(--surface)',
      'surface-alt': 'var(--surface-alt)',
      'surface-warm': 'var(--surface-warm)',
      line: 'var(--line)',
      outline: 'var(--outline)',

      // Corporate darks
      'brand-dark': 'var(--brand-dark)',
      'brand-brown': 'var(--brand-brown)',

      // States
      success: 'var(--success)',
      whatsapp: 'var(--whatsapp)',
      danger: 'var(--danger)',
      info: 'var(--info)',

      // Legacy aliases used by current template/components
      green: 'var(--green)',
      yellow: 'var(--yellow)',
      red: 'var(--red)',
      purple: 'var(--purple)',
      pink: 'var(--pink)',
      surface2: 'var(--surface2)',
      surface1: 'var(--surface1)',
    },
  },
  plugins: [],
}
export default config
