import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type StatePanelVariant = 'loading' | 'empty' | 'error'

export type StatePanelProps = {
  variant: StatePanelVariant
  title?: string
  description?: string
  action?: ReactNode
}

const defaults: Record<StatePanelVariant, { title: string; description: string }> = {
  loading: { title: 'Loading', description: 'Fetching the latest data.' },
  empty: { title: 'Nothing here yet', description: 'There is no data to show.' },
  error: { title: 'Something went wrong', description: 'The request failed. Try again.' },
}

/**
 * Shared placeholder for loading, empty, and error states. Used by the character list,
 * the team page, and the detail page banner.
 */
export function StatePanel({ variant, title, description, action }: StatePanelProps) {
  const fallback = defaults[variant]
  return (
    <Box
      role="status"
      data-variant={variant}
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 4,
        p: 8,
        textAlign: 'center',
        display: 'grid',
        gap: 3,
        justifyItems: 'center',
      }}
    >
      {variant === 'loading' && <CircularProgress size={32} />}
      <Typography variant="h3" component="h2">
        {title ?? fallback.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description ?? fallback.description}
      </Typography>
      {action}
    </Box>
  )
}
