'use client'

import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TopBar } from '@stijnvanhulle/components'
import { characterIdSchema } from '@/server/schemas'
import { useGetCharacterQuery, useGetTeamQuery } from '@/store/api'

const TEAM_CAP = 5

function CharacterCrumb({ id }: { id: number }) {
  const { data } = useGetCharacterQuery(id)
  return <span>{data?.name ?? `#${id}`}</span>
}

function Breadcrumb() {
  const pathname = usePathname() ?? '/'

  const crumbs = (() => {
    if (pathname === '/team') {
      return [
        <Box key="t" component="span" sx={{ color: '#121A52' }}>
          Team
        </Box>,
      ]
    }

    if (pathname.startsWith('/bookmarks')) {
      return [
        <Box key="b" component="span" sx={{ color: '#121A52' }}>
          Bookmarks
        </Box>,
      ]
    }

    if (pathname.startsWith('/characters/')) {
      const parsed = characterIdSchema.safeParse(pathname.split('/')[2])
      const charactersCrumb = (
        <Box key="c" component={Link} href="/" sx={{ color: '#334155', textDecoration: 'none', '&:hover': { color: '#E61F75' } }}>
          Characters
        </Box>
      )
      if (!parsed.success) return [charactersCrumb]

      return [
        charactersCrumb,
        <Box key="n" component="span" sx={{ color: '#121A52' }}>
          <CharacterCrumb id={parsed.data} />
        </Box>,
      ]
    }

    return [
      <Box key="c" component="span" sx={{ color: '#121A52' }}>
        Characters
      </Box>,
    ]
  })()

  return (
    <Breadcrumbs aria-label="Breadcrumb" separator="/" sx={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
      {crumbs}
    </Breadcrumbs>
  )
}

function TeamPill() {
  const pathname = usePathname() ?? '/'
  const team = useGetTeamQuery()
  const count = team.data?.length ?? 0
  const onTeamPage = pathname === '/team'

  return (
    <Chip
      component={Link}
      href="/team"
      clickable
      label={
        <Stack component="span" direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box component="span">Your team</Box>
          <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', opacity: onTeamPage ? 0.9 : 1 }}>
            {count} / {TEAM_CAP}
          </Box>
        </Stack>
      }
      sx={{
        px: 2,
        py: 2.5,
        height: 'auto',
        borderRadius: 9999,
        bgcolor: onTeamPage ? '#FF348A' : '#FFFFFF',
        border: '1.5px solid #FF348A',
        color: onTeamPage ? '#FFFFFF' : '#E61F75',
        fontSize: 14,
        fontWeight: 700,
        '&:hover': {
          bgcolor: onTeamPage ? '#E61F75' : '#FFF0F6',
          borderColor: onTeamPage ? '#E61F75' : '#FF348A',
        },
      }}
    />
  )
}

export function AppTopBar() {
  return <TopBar title={<Breadcrumb />} teamLink={<TeamPill />} />
}
