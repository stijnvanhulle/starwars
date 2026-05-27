import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

export type PrimaryButtonProps = {
  label: ReactNode
  onClick?: () => void
  loading?: boolean
  disabledReason?: string
}

export function PrimaryButton({ label, onClick, loading, disabledReason }: PrimaryButtonProps) {
  const disabled = disabledReason !== undefined || loading === true
  const button = (
    <Button
      variant="contained"
      color="primary"
      disableElevation
      onClick={onClick}
      disabled={disabled}
      sx={{ borderRadius: 9999, fontWeight: 800, px: 5, py: 1.25 }}
    >
      {loading ? '…' : label}
    </Button>
  )
  if (disabledReason === undefined) return button

  return (
    <Tooltip title={disabledReason}>
      <Box component="span" sx={{ display: 'inline-block' }}>
        {button}
      </Box>
    </Tooltip>
  )
}
