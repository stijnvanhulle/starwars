import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type PagerButtonProps = {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

/**
 * Pill button used on the detail page pager. White surface, 1.5px hairline
 * border, accent-pink on hover, neutral-400 when disabled.
 */
export function PagerButton({ onClick, disabled, children }: PagerButtonProps) {
  const isDisabled = disabled === true || onClick === undefined
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        px: 3.5,
        py: 2,
        borderRadius: 9999,
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        fontSize: 13,
        fontWeight: 700,
        color: '#121A52',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        '&:hover:not(:disabled)': { borderColor: '#FF348A', color: '#E61F75' },
        '&:disabled': { color: '#94A3B8' },
      }}
    >
      {children}
    </Box>
  )
}
