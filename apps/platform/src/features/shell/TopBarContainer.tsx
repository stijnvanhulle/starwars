'use client'

import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TopBar } from '@whale/components'
import { characterIdSchema } from '@/server/schemas'
import { useGetCharacterQuery, useGetTeamQuery } from '@/store/api'

const TEAM_MAX = 5

function CharacterCrumb({ id }: { id: number }) {
  const { data } = useGetCharacterQuery(id)

  return <span>{data?.name ?? `#${id}`}</span>
}

function Breadcrumb() {
  const pathname = usePathname() ?? '/'

  const items = (() => {
    if (pathname === '/team') {
      return [
        <Box key="t" component="span" sx={{ color: 'text.primary' }}>
          Team
        </Box>,
      ]
    }

    if (pathname.startsWith('/bookmarks')) {
      return [
        <Box key="b" component="span" sx={{ color: 'text.primary' }}>
          Bookmarks
        </Box>,
      ]
    }

    if (pathname.startsWith('/characters/')) {
      const parsed = characterIdSchema.safeParse(pathname.split('/')[2])
      const charactersCrumb = (
        <Box key="c" component={Link} href="/characters" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.dark' } }}>
          Characters
        </Box>
      )
      if (!parsed.success) return [charactersCrumb]

      return [
        charactersCrumb,
        <Box key="n" component="span" sx={{ color: 'text.primary' }}>
          <CharacterCrumb id={parsed.data} />
        </Box>,
      ]
    }

    return [
      <Box key="c" component="span" sx={{ color: 'text.primary' }}>
        Characters
      </Box>,
    ]
  })()

  return (
    <Breadcrumbs aria-label="Breadcrumb" separator="/" sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>
      {items}
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
            {count} / {TEAM_MAX}
          </Box>
        </Stack>
      }
      sx={{
        px: 2,
        py: 2.5,
        height: 'auto',
        borderRadius: 9999,
        bgcolor: onTeamPage ? 'primary.main' : 'common.white',
        border: '1.5px solid',
        borderColor: 'primary.main',
        color: onTeamPage ? 'common.white' : 'primary.dark',
        fontSize: 14,
        fontWeight: 700,
        '&:hover': {
          bgcolor: onTeamPage ? 'primary.dark' : 'primary.light',
          borderColor: onTeamPage ? 'primary.dark' : 'primary.main',
        },
      }}
    />
  )
}

export function TopBarContainer() {
  return <TopBar title={<Breadcrumb />} teamLink={<TeamPill />} />
}
