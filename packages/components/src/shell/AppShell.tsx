import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type AppShellProps = {
  topBar: ReactNode
  sidebar: ReactNode
  rightPane?: ReactNode
  children: ReactNode
}

/**
 * Three-column shell: 80px sticky nav, fluid main, optional 280px right pane.
 * Top bar sits inside the main column and is sticky over the scrolling content.
 */
export function AppShell({ topBar, sidebar, rightPane, children }: AppShellProps) {
  const cols = rightPane === undefined ? '80px minmax(0, 1fr)' : '80px minmax(0, 1fr) 280px'
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '80px 1fr', lg: cols },
        minHeight: '100vh',
        bgcolor: '#F5F7FB',
      }}
    >
      <Box component="aside" sx={{ bgcolor: '#0F1664', color: '#FFFFFF' }}>
        {sidebar}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: '#F5F7FB',
            borderBottom: '1px solid #E2E8F0',
            px: 8,
            py: 4,
          }}
        >
          {topBar}
        </Box>
        <Box component="main" sx={{ p: 8, maxWidth: 1200, width: '100%' }}>
          {children}
        </Box>
      </Box>
      {rightPane !== undefined && (
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            maxHeight: '100vh',
            overflowY: 'auto',
            p: 4,
            pl: 0,
          }}
        >
          {rightPane}
        </Box>
      )}
    </Box>
  )
}
