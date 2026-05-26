import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

export type CharacterListSkeletonProps = {
  count?: number
}

/**
 * Grid of card-shaped skeletons matching `CharacterList`'s layout.
 */
export function CharacterListSkeleton({ count = 8 }: CharacterListSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 6,
      }}
      aria-busy
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Skeleton variant="rectangular" sx={{ aspectRatio: '1 / 1', width: '100%', height: 'auto' }} />
          <Box sx={{ px: 4, pt: 3.5, pb: 4, borderTop: '1px solid #E2E8F0' }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}
