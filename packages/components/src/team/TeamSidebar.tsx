import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type TeamSidebarProps = {
  count?: number
  cap?: number
  children?: ReactNode
}

/**
 * Placeholder right-rail team panel. Renders a header with the count pill and either the
 * provided roster children or an empty-state message. Real data wiring lands in Slice 006.
 */
export function TeamSidebar({ count = 0, cap = 5, children }: TeamSidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        width: 280,
        p: 5,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h3" component="h2">
          Your team
        </Typography>
        <Typography component="span" sx={{ bgcolor: '#FFF0F6', color: '#E61F75', px: 2, py: 1, borderRadius: 9999, fontVariantNumeric: 'tabular-nums' }}>
          {count} / {cap}
        </Typography>
      </Box>
      {children ?? (
        <Typography variant="body2" color="text.secondary">
          No characters yet. Add one from a detail page.
        </Typography>
      )}
    </Box>
  )
}
