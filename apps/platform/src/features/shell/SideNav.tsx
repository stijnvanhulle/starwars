'use client'

import Badge from '@mui/material/Badge'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Link from 'next/link'
import type { ReactNode } from 'react'

export type SideNavItem = {
  href: string
  label: string
  icon: ReactNode
  active: boolean
  badgeCount?: number
}

export type SideNavProps = {
  items: ReadonlyArray<SideNavItem>
}

export function SideNav({ items }: SideNavProps) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 4, position: 'sticky', top: 0, height: '100vh' }}>
      <Stack
        component={Link}
        href="/"
        aria-label="Whale Star Wars Team Builder, home"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'common.white',
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
      </Stack>
      {items.map((item) => {
        const iconContent =
          item.badgeCount !== undefined ? (
            <Badge badgeContent={item.badgeCount} color="primary" overlap="circular" invisible={item.badgeCount === 0}>
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )
        return (
          <Tooltip key={item.href} title={item.label} placement="right">
            <ListItemButton
              component={Link}
              href={item.href}
              selected={item.active}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              alignItems={'center'}
              sx={{
                width: 48,
                height: 48,
                flex: 'none',
                borderRadius: 3,
                justifyContent: 'center',
                color: item.active ? 'common.white' : 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'secondary.main', color: 'common.white' },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'common.white' },
              }}
            >
              {iconContent}
            </ListItemButton>
          </Tooltip>
        )
      })}
    </Stack>
  )
}
