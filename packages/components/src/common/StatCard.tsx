import Box from '@mui/material/Box'

export type StatCardProps = {
  label: string
  value: number | string
  unit?: string
}

const LABEL_SX = {
  fontSize: 11,
  fontWeight: 700,
  color: '#94A3B8',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
}

/**
 * Small bordered card used for inline stats (Height, Mass on the detail page).
 * Label sits above a big head-font value with an optional muted unit suffix.
 */
export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 3,
        px: 4,
        py: 3,
      }}
    >
      <Box sx={{ ...LABEL_SX, mb: 0.5 }}>{label}</Box>
      <Box
        sx={{
          fontSize: 22,
          fontWeight: 800,
          color: '#121A52',
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
              color: '#94A3B8',
              ml: 0.75,
              fontVariantNumeric: 'normal',
            }}
          >
            {unit}
          </Box>
        )}
      </Box>
    </Box>
  )
}
