import Stack from '@mui/material/Stack'
import type { ReactNode } from 'react'

export type TopBarProps = {
  title: ReactNode
  teamLink?: ReactNode
}

export function TopBar({ title, teamLink }: TopBarProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: 14, fontWeight: 800 }}>
      {title}
      {teamLink}
    </Stack>
  )
}
