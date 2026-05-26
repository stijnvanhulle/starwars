import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type StatePanelVariant = 'loading' | 'empty' | 'error'

export type StatePanelProps = {
  variant: StatePanelVariant
  title?: string
  description?: string
  action?: ReactNode
}

const DEFAULTS: Record<StatePanelVariant, { title: string; description: string }> = {
  loading: { title: 'Loading', description: 'Fetching the latest data.' },
  empty: { title: 'Nothing here yet', description: 'There is no data to show.' },
  error: { title: 'Something went wrong', description: 'The request failed. Try again.' },
}

export function StatePanel({ variant, title, description, action }: StatePanelProps) {
  const fallback = DEFAULTS[variant]
  return (
    <Paper role="status" data-variant={variant} variant="outlined" sx={{ borderRadius: 4, p: 8, textAlign: 'center' }}>
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        {variant === 'loading' && <CircularProgress size={32} />}
        <Typography variant="h3" component="h2">
          {title ?? fallback.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description ?? fallback.description}
        </Typography>
        {action}
      </Stack>
    </Paper>
  )
}
