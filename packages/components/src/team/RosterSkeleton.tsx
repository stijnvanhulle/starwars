import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export type RosterSkeletonProps = {
  count?: number
}

export function RosterSkeleton({ count = 2 }: RosterSkeletonProps) {
  return (
    <Stack spacing={1.5} aria-busy aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <Stack key={`roster-${i}`} direction="row" spacing={2.5} sx={{ alignItems: 'center', px: 2, py: 1.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="text" sx={{ flex: 1 }} />
          <Skeleton variant="circular" width={24} height={24} />
        </Stack>
      ))}
    </Stack>
  )
}
