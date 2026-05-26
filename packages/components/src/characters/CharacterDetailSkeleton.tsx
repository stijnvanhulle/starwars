import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export function CharacterDetailSkeleton() {
  return (
    <Box aria-busy aria-live="polite">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 6 }}
      >
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 9999 }} />
          <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 9999 }} />
        </Stack>
        <Skeleton variant="text" width={80} />
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 360px) minmax(0, 1fr)' },
          gap: { xs: 6, md: 8 },
          p: 6,
          borderRadius: 4,
        }}
      >
        <Box sx={{ aspectRatio: '4 / 5', width: '100%' }}>
          <Skeleton
            variant="rounded"
            animation="wave"
            width="100%"
            height="100%"
            sx={{ borderRadius: 3, transform: 'none' }}
          />
        </Box>
        <Box>
          <Skeleton variant="text" width="60%" sx={{ fontSize: 40, mb: 5 }} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, minmax(0, 180px))' },
              gap: 2,
              mb: 6,
            }}
          >
            <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
          </Box>
          <Skeleton variant="text" width={120} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mb: 5 }}>
            <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 9999 }} />
            <Skeleton variant="rounded" width={140} height={28} sx={{ borderRadius: 9999 }} />
            <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 9999 }} />
          </Stack>
          <Skeleton variant="rounded" width={160} height={44} sx={{ borderRadius: 9999 }} />
        </Box>
      </Paper>
    </Box>
  )
}
