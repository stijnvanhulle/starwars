import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type AppShellProps = {
  topBar: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

/**
 * Three-slot layout for every page: fixed top bar, sticky 280px sidebar, scrollable content.
 * Renders slots verbatim. No data fetching, no business logic.
 */
export function AppShell({ topBar, sidebar, children }: AppShellProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: '100vh' }}>
      <Box component="aside" sx={{ bgcolor: '#0F1664', color: '#FFFFFF' }}>
        {sidebar}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateRows: '52px 1fr', bgcolor: '#F5F7FB' }}>
        <Box component="header" sx={{ display: 'flex', alignItems: 'center', px: 6, borderBottom: '1px solid #E2E8F0' }}>
          {topBar}
        </Box>
        <Box component="main" sx={{ p: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
