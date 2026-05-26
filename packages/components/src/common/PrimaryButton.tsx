import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

export type PrimaryButtonProps = {
  label: ReactNode
  onClick?: () => void
  loading?: boolean
  disabledReason?: string
}

/**
 * Pink pill button used as the team-add CTA. When `disabledReason` is set the
 * button is disabled and wrapped in a tooltip that surfaces the reason.
 */
export function PrimaryButton({ label, onClick, loading, disabledReason }: PrimaryButtonProps) {
  const disabled = disabledReason !== undefined || loading === true
  const button = (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        px: 5,
        py: 2.5,
        borderRadius: 9999,
        border: 'none',
        bgcolor: disabled ? '#E2E8F0' : '#FF348A',
        color: disabled ? '#94A3B8' : '#FFFFFF',
        fontSize: 14,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover:not(:disabled)': { bgcolor: '#E61F75' },
        '&:active:not(:disabled)': { bgcolor: '#C01060' },
      }}
    >
      {loading ? '…' : label}
    </Box>
  )
  if (disabledReason === undefined) return button
  return (
    <Tooltip title={disabledReason} arrow>
      <Box component="span" sx={{ display: 'inline-block' }}>
        {button}
      </Box>
    </Tooltip>
  )
}
