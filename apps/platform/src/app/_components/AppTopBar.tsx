'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import { TopBar } from '@stijnvanhulle/components'
import { useGetCharacterQuery, useGetTeamQuery } from '@/store/api'

const TEAM_CAP = 5

function CharacterCrumb({ id }: { id: number }) {
  const { data } = useGetCharacterQuery(id, { skip: !Number.isFinite(id) })
  return <span>{data?.name ?? `#${id}`}</span>
}

function Breadcrumb() {
  const pathname = usePathname() ?? '/'

  let trail: Array<ReactNode>
  if (pathname === '/team') {
    trail = [<span key="t">Team</span>]
  } else if (pathname.startsWith('/characters/')) {
    const id = Number.parseInt(pathname.split('/')[2] ?? '', 10)
    trail = [
      <Box
        key="c"
        component={Link}
        href="/"
        sx={{
          color: '#334155',
          textDecoration: 'none',
          '&:hover': { color: '#E61F75' },
        }}
      >
        Characters
      </Box>,
      <Box key="sep" component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
        /
      </Box>,
      <Box key="n" component="span" sx={{ color: '#121A52' }}>
        <CharacterCrumb id={id} />
      </Box>,
    ]
  } else {
    trail = [
      <Box key="c" component="span" sx={{ color: '#121A52' }}>
        Characters
      </Box>,
    ]
  }

  return (
    <Box
      component="nav"
      aria-label="Breadcrumb"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        fontSize: 14,
        fontWeight: 700,
        color: '#334155',
      }}
    >
      {trail}
    </Box>
  )
}

function TeamPill() {
  const pathname = usePathname() ?? '/'
  const team = useGetTeamQuery()
  const count = team.data?.length ?? 0
  const onTeamPage = pathname === '/team'

  return (
    <Box
      component={Link}
      href="/team"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        px: 4,
        py: 2,
        borderRadius: 9999,
        bgcolor: onTeamPage ? '#FF348A' : '#FFFFFF',
        border: `1.5px solid ${onTeamPage ? '#FF348A' : '#FF348A'}`,
        color: onTeamPage ? '#FFFFFF' : '#E61F75',
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        '&:hover': {
          bgcolor: onTeamPage ? '#E61F75' : '#FFF0F6',
          borderColor: onTeamPage ? '#E61F75' : '#FF348A',
        },
      }}
    >
      Your team
      <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', opacity: onTeamPage ? 0.9 : 1 }}>
        {count} / {TEAM_CAP}
      </Box>
    </Box>
  )
}

export function AppTopBar() {
  return <TopBar title={<Breadcrumb />} teamLink={<TeamPill />} />
}
