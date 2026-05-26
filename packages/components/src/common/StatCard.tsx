import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

export type StatCardProps = {
  label: string
  value: number | string
  unit?: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, px: 4, py: 3 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: 'text.disabled',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 800,
          color: 'text.primary',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {value}
        {unit && (
          <Box
            component="span"
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: 'text.disabled',
              ml: 0.75,
              fontVariantNumeric: 'normal',
            }}
          >
            {unit}
          </Box>
        )}
      </Typography>
    </Paper>
  )
}
