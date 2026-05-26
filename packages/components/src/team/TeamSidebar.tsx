import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type TeamSidebarProps = {
  count?: number
  cap?: number
  cta?: ReactNode
  children?: ReactNode
}

export function TeamSidebar({ count = 0, cap = 5, cta, children }: TeamSidebarProps) {
  return (
    <Paper component="aside" variant="outlined" sx={{ width: '100%', borderRadius: 4, p: 5 }}>
      <Stack spacing={3}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>Your team</Typography>
          <Typography
            component="span"
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: 'primary.dark',
              bgcolor: 'primary.light',
              px: 2.5,
              py: 0.75,
              borderRadius: 9999,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {count} / {cap}
          </Typography>
        </Stack>
        {children ?? (
          <Typography variant="body2" color="text.secondary">
            No characters yet. Add one from a detail page.
          </Typography>
        )}
        {cta}
      </Stack>
    </Paper>
  )
}
