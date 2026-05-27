'use client'

import type { ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppShell, lightTheme } from '@whale/components'
import { AppTopBarContainer } from '@/app/_components/AppTopBarContainer'
import { SideNavContainer } from '@/app/_components/SideNavContainer'
import { TeamSidebarContainer } from '@/app/team/TeamSidebarContainer'
import { Providers as StoreProviders } from '@/store/Providers'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <StoreProviders>
          <AppShell topBar={<AppTopBarContainer />} sidebar={<SideNavContainer />} rightPane={<TeamSidebarContainer />}>
            {children}
          </AppShell>
        </StoreProviders>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
