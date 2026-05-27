import Box from '@mui/material/Box'
import Button, { type ButtonProps } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

export type ActionButtonProps = Omit<ButtonProps, 'disabled'> & {
  loading?: boolean
  disabledReason?: string
}

/**
 * Thin wrapper over MUI `Button`. `loading` swaps the children for a spinner;
 * `disabledReason` disables the button and surfaces the reason via `Tooltip`.
 */
export function ActionButton({ loading, disabledReason, variant = 'contained', sx, children, ...rest }: ActionButtonProps) {
  const disabled = loading === true || disabledReason !== undefined
  const button = (
    <Button {...rest} variant={variant} disabled={disabled} sx={{ borderRadius: 9999, fontWeight: 700, ...sx }}>
      {loading ? <CircularProgress size={16} color="inherit" /> : children}
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
