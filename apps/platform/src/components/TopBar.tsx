'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'

export function TopBar() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      <Typography component={NextLink} href="/" sx={{ fontWeight: 800, color: 'inherit', textDecoration: 'none' }}>
        Whale Star Wars Team Builder
      </Typography>
      <Typography component={NextLink} href="/team" sx={{ ml: 'auto', color: 'inherit', textDecoration: 'none' }}>
        Team
      </Typography>
    </Box>
  )
}
