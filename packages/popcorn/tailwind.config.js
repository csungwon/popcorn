const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#ffebd9',
          100: '#ffd7b3',
          200: '#ffc28e',
          300: '#ffae69',
          400: '#ff9a43',
          500: '#ff860d',
          600: '#d06f13',
          700: '#a45815',
          800: '#794214',
          900: '#512e12',
          950: '#2c1a0c'
        },
        emerald: {
          50: '#e6ffeb',
          100: '#cbffd7',
          200: '#aeffc3',
          300: '#8dffaf',
          400: '#64ff9b',
          500: '#0dff86',
          600: '#20d06f',
          700: '#24a258',
          800: '#237743',
          900: '#1e4f2e',
          950: '#152a1b'
        },
        violet: {
          50: '#f1dcff',
          100: '#e1b9ff',
          200: '#ce96ff',
          300: '#ba72ff',
          400: '#a24aff',
          500: '#860dff',
          600: '#7016d0',
          700: '#5b18a2',
          800: '#461877',
          900: '#31154f',
          950: '#1d0f2a'
        },
        gray: {
          50: '#f7f7f7',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#bababa',
          400: '#a3a3a3',
          500: '#8c8c8c',
          600: '#707070',
          700: '#545454',
          800: '#383838',
          900: '#1c1c1c',
          950: '#1d0f2a'
        },
        red: {
          ...colors.red,
          accent: '#d70015'
        },
        blue: {
          ...colors.blue,
          accent: '#007bfe'
        }
      },
      boxShadow: {
        bottomSheet: '0 -4px 4px 0 rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: []
}
