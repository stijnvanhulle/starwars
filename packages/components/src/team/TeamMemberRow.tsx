import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type TeamMemberRowProps = {
  name: string
  image?: string
  onRemove?: () => void
  variant?: 'compact' | 'full'
}

export function TeamMemberRow({ name, image, onRemove, variant = 'full' }: TeamMemberRowProps) {
  if (variant === 'compact') {
    return (
      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', px: 2, py: 1.5, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>
        <Avatar src={image} alt={name} sx={{ width: 36, height: 36 }} />
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Typography>
        <IconButton size="small" aria-label={`Remove ${name}`} onClick={onRemove} sx={{ '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}>
          ✕
        </IconButton>
      </Stack>
    )
  }

  return (
    <Card variant="outlined" sx={{ p: 4, borderRadius: 4, '&:hover': { borderColor: 'primary.main' } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 5 }} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Avatar src={image} alt={name} variant="rounded" sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: 3 }} />
        <Typography component="h2" sx={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
          {name}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          sx={{
            borderRadius: 9999,
            borderWidth: 1.5,
            px: 4.5,
            py: 1.25,
            fontWeight: 700,
            '&:hover': { borderColor: 'error.main', bgcolor: 'error.light', color: 'error.main' },
          }}
        >
          Remove
          <Box component="span" aria-hidden sx={{ ml: 1 }}>
            ✕
          </Box>
        </Button>
      </Stack>
    </Card>
  )
}
