import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
        <Card key={`character-skeleton-${i}`} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ aspectRatio: '1 / 1', width: '100%' }}>
            <Skeleton variant="rectangular" animation="wave" width="100%" height="100%" sx={{ transform: 'none' }} />
          </Box>
          <CardContent sx={{ p: 4, borderTop: 1, borderColor: 'divider' }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: 16 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
