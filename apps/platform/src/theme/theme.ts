import { createTheme } from '@mui/material/styles'

const accent = {
  50: '#FFF0F6',
  500: '#FF348A',
  600: '#E61F75',
  700: '#C01060',
}

const navy = {
  700: '#1E2A8D',
  800: '#152178',
}

const nav = {
  bg: '#0F1664',
  fg: '#FFFFFF',
  active: '#1E2A8D',
}

const neutral = {
  0: '#FFFFFF',
  100: '#F1F5F9',
  200: '#E2E8F0',
  400: '#94A3B8',
  600: '#334155',
  900: '#121A52',
}

const surfaceApp = '#F5F7FB'

const semantic = {
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0284C7',
}

const fontBody = 'var(--font-nunito), "Nunito Sans", system-ui, sans-serif'
const fontHead = 'var(--font-nunito), "Sofia Pro Soft", "Nunito Sans", system-ui, sans-serif'

/**
 * MUI theme built from the Whale-inspired tokens in plans/starwars-team-builder/design.md.
 * Pink accent on white, navy ramp for secondary actions, semantic states for inline feedback.
 */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: accent[500], dark: accent[700], light: accent[50], contrastText: neutral[0] },
    secondary: { main: navy[700], dark: navy[800], contrastText: neutral[0] },
    background: { default: surfaceApp, paper: neutral[0] },
    text: { primary: neutral[900], secondary: neutral[600], disabled: neutral[400] },
    divider: neutral[200],
    error: { main: semantic.error },
    warning: { main: semantic.warning },
    info: { main: semantic.info },
    success: { main: semantic.success },
  },
  shape: { borderRadius: 4 },
  spacing: 4,
  typography: {
    fontFamily: fontBody,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: { fontFamily: fontHead, fontSize: '2.5rem', lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: 800 },
    h2: { fontFamily: fontHead, fontSize: '1.75rem', lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: 800 },
    h3: { fontFamily: fontHead, fontSize: '1.125rem', lineHeight: '1.5rem', letterSpacing: '-0.01em', fontWeight: 800 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', letterSpacing: '0.08em' },
    button: { fontWeight: 700, textTransform: 'none' },
  },
})

export const tokens = {
  accent,
  navy,
  nav,
  neutral,
  semantic,
  surfaceApp,
  font: { body: fontBody, head: fontHead },
  radius: { sm: 4, md: 12, lg: 16, pill: 9999 },
  border: { card: `1px solid ${neutral[200]}` },
}
