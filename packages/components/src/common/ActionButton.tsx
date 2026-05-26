import Button, { type ButtonProps } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'

export type ActionButtonProps = Omit<ButtonProps, 'disabled'> & {
  loading?: boolean
  disabledReason?: string
}

/**
 * Project-standard button. When `loading` is true a spinner replaces the children. When
 * `disabledReason` is passed the button is disabled and the reason renders as a tooltip
 * (this is the pattern Darth Vader's Add button uses on the detail page).
 */
export function ActionButton({ loading, disabledReason, children, ...rest }: ActionButtonProps) {
  const disabled = loading === true || disabledReason !== undefined
  const button = (
    <Button {...rest} disabled={disabled}>
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
