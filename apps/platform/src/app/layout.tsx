import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
