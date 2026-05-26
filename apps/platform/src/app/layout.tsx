import '@stijnvanhulle/components/style.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Nunito_Sans } from 'next/font/google'
import { Providers } from './providers'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
})

type RootLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Whale Star Wars Team Builder',
  description: 'Build your Star Wars team',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={nunito.variable}>
      <body style={{ fontFamily: 'var(--font-nunito), system-ui, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
