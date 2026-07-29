import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

import { lightTheme, darkTheme } from './theme'

export default createVuetify({
  theme: {
    defaultTheme: 'light',

    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
})
