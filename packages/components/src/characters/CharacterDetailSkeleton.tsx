import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

/**
 * Loading placeholder for the detail page. Mirrors `CharacterDetail`'s grid so
 * the layout doesn't shift when the data lands.
 */
export function CharacterDetailSkeleton() {
  return (
    <Box aria-busy aria-live="polite">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 9999 }} />
          <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 9999 }} />
        </Box>
        <Skeleton variant="text" width={80} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 360px) minmax(0, 1fr)' },
          gap: { xs: 6, md: 8 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 4,
          p: 6,
        }}
      >
        <Skeleton variant="rectangular" sx={{ borderRadius: 3, aspectRatio: '4 / 5', width: '100%', height: 'auto' }} />

        <Box>
          <Skeleton variant="text" width="60%" sx={{ fontSize: 40, mb: 5 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, minmax(0, 180px))' }, gap: 2, mb: 6 }}>
            <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
          </Box>
          <Skeleton variant="text" width={120} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 5 }}>
            <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 9999 }} />
            <Skeleton variant="rounded" width={140} height={28} sx={{ borderRadius: 9999 }} />
            <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 9999 }} />
          </Box>
          <Skeleton variant="rounded" width={160} height={44} sx={{ borderRadius: 9999 }} />
        </Box>
      </Box>
    </Box>
  )
}
