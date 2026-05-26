'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

const NAV: Array<{ href: string; label: string; icon: ReactNode; match: (p: string) => boolean }> = [
  {
    href: '/',
    label: 'Characters',
    match: (p) => p === '/' || p.startsWith('/characters'),
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Team',
    match: (p) => p === '/team',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3.5" />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M16 20c0-2 2-3.5 5-3.5" />
      </svg>
    ),
  },
]

export function SideNav() {
  const pathname = usePathname() ?? '/'
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        py: 4,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <Box
        component={Link}
        href="/"
        aria-label="Whale"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textDecoration: 'none',
          mb: 4,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width={28}
          height={28}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 17c2-5 7-8 13-8s11 3 13 8c-2 5-7 8-13 8s-11-3-13-8z" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </Box>
      {NAV.map((item) => {
        const active = item.match(pathname)
        return (
          <Tooltip key={item.href} title={item.label} placement="right">
            <Box
              component={Link}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                bgcolor: active ? '#1E2A8D' : 'transparent',
                textDecoration: 'none',
                '&:hover': {
                  bgcolor: active ? '#1E2A8D' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                },
              }}
            >
              {item.icon}
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
