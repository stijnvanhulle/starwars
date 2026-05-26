import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type TopBarProps = {
  title: ReactNode
  teamLink?: ReactNode
}

/**
 * Quiet header strip. Title (or breadcrumb) on the left, an optional slot on
 * the right.
 */
export function TopBar({ title, teamLink }: TopBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {title}
      {teamLink}
    </Box>
  )
}
