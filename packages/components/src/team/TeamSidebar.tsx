import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type TeamSidebarProps = {
  count?: number
  cap?: number
  cta?: ReactNode
  children?: ReactNode
}

/**
 * Right-rail team card. Title + count pill in the header, roster (or empty
 * state) below, then a contextual CTA at the bottom. Width is controlled by
 * `AppShell`'s `rightPane` slot.
 */
export function TeamSidebar({ count = 0, cap = 5, cta, children }: TeamSidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 4,
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ fontSize: 16, fontWeight: 800, color: '#121A52' }}>Your team</Box>
        <Box
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#E61F75',
            bgcolor: '#FFF0F6',
            px: 2.5,
            py: 0.75,
            borderRadius: 9999,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count} / {cap}
        </Box>
      </Box>
      {children ?? <Box sx={{ fontSize: 13, color: '#334155' }}>No characters yet. Add one from a detail page.</Box>}
      {cta && <Box sx={{ mt: 1 }}>{cta}</Box>}
    </Box>
  )
}
