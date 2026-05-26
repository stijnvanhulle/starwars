import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export type RosterSkeletonProps = {
  count?: number
}

export function RosterSkeleton({ count = 2 }: RosterSkeletonProps) {
  return (
    <Stack spacing={1.5} aria-busy aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr auto',
            alignItems: 'center',
            gap: 2.5,
            px: 2,
            py: 1.5,
          }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      ))}
    </Stack>
  )
}
