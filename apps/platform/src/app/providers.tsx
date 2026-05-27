'use client'

import type { ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppShell, lightTheme } from '@whale/components'
import { AppTopBar } from '@/app/_components/AppTopBar'
import { SideNav } from '@/app/_components/SideNav'
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
          <AppShell topBar={<AppTopBar />} sidebar={<SideNav />} rightPane={<TeamSidebarContainer />}>
            {children}
          </AppShell>
        </StoreProviders>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
