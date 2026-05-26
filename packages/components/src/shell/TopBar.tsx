import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type TopBarProps = {
  title: ReactNode
  teamLink?: ReactNode
}

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
