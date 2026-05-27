import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type BookmarksHeaderProps = {
  count: number
  onClear?: () => void
}

export function BookmarksHeader({ count, onClear }: BookmarksHeaderProps) {
  return (
    <Stack direction="row" spacing={6} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
      <Typography component="h1" sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
        Bookmarks
      </Typography>
      {count > 0 && onClear && (
        <Button variant="outlined" color="inherit" onClick={onClear} sx={{ borderRadius: 9999, fontWeight: 700 }}>
          Clear all
        </Button>
      )}
    </Stack>
  )
}
