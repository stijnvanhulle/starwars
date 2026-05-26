import Box from '@mui/material/Box'

export type ProgressPillProps = {
  current: number
  total: number
}

/**
 * Pill with a tabular `N / total` label followed by `total` dots, filled for
 * taken slots and empty for open ones. Used on the team page header.
 */
export function ProgressPill({ current, total }: ProgressPillProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 3.5,
        py: 2.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 9999,
      }}
    >
      <Box
        component="span"
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: '#121A52',
          fontVariantNumeric: 'tabular-nums',
          mr: 2,
        }}
      >
        {current} / {total}
      </Box>
      {Array.from({ length: total }, (_, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            bgcolor: i < current ? '#FF348A' : '#E2E8F0',
          }}
        />
      ))}
    </Box>
  )
}
