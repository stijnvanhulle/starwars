import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'

export type CharacterListSkeletonProps = {
  count?: number
}

export function CharacterListSkeleton({ count = 8 }: CharacterListSkeletonProps) {
  return (
    <Box
      aria-busy
      aria-live="polite"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 6,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Paper key={i} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ aspectRatio: '1 / 1', width: '100%' }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="100%"
              height="100%"
              sx={{ transform: 'none' }}
            />
          </Box>
          <Box sx={{ p: 4, borderTop: 1, borderColor: 'divider' }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: 16 }} />
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
