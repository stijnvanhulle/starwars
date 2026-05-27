'use client'

import type { ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppShell, lightTheme } from '@whale/components'
import { SideNavContainer } from '@/features/shell/SideNavContainer'
import { TopBarContainer } from '@/features/shell/TopBarContainer'
import { TeamSidebarContainer } from '@/features/team/TeamSidebarContainer'
import { StoreProvider } from '@/store/StoreProvider'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <StoreProvider>
          <AppShell topBar={<TopBarContainer />} sidebar={<SideNavContainer />} rightPane={<TeamSidebarContainer />}>
            {children}
          </AppShell>
        </StoreProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
