import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export type TeamListSkeletonProps = {
  count?: number
}

export function TeamListSkeleton({ count = 3 }: TeamListSkeletonProps) {
  return (
    <Stack spacing={3} aria-busy aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Stack direction="row" spacing={5} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rounded" width={72} height={72} sx={{ borderRadius: 3 }} />
            <Skeleton variant="text" sx={{ flex: 1, fontSize: 20 }} />
            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 9999 }} />
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
