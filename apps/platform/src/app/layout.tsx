import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from '@stijnvanhulle/components'
import { Providers } from './providers'
import { TeamSidebarContainer } from '@/components/TeamSidebarContainer'
import { TopBar } from '@/components/TopBar'

type RootLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Whale Star Wars Team Builder',
  description: 'Build your Star Wars team',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell topBar={<TopBar />} sidebar={<TeamSidebarContainer />}>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}
