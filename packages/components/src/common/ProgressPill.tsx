import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

export type ProgressPillProps = {
  current: number
  total: number
}

export function ProgressPill({ current, total }: ProgressPillProps) {
  return (
    <Paper variant="outlined" sx={{ display: 'inline-block', borderRadius: 9999, px: 3.5, py: 2.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box component="span" sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums', mr: 2 }}>
          {current} / {total}
        </Box>
        {Array.from({ length: total }, (_, i) => (
          <Box key={`slot-${i + 1}`} aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i < current ? 'primary.main' : 'divider' }} />
        ))}
      </Stack>
    </Paper>
  )
}
