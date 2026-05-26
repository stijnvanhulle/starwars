import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr auto',
          alignItems: 'center',
          gap: 2.5,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Avatar src={image} alt={name} sx={{ width: 36, height: 36 }} />
        <Typography
          sx={{
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
      </Box>
    )
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '56px 1fr', sm: '72px minmax(0, 1fr) auto' },
        alignItems: 'center',
        gap: { xs: 3, sm: 5 },
        p: 4,
        borderRadius: 4,
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Avatar src={image} alt={name} variant="rounded" sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: 3 }} />
      <Box>
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
          {name}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        color="inherit"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        sx={{
          gridColumn: { xs: '1 / -1', sm: 'auto' },
          justifySelf: { xs: 'stretch', sm: 'end' },
          borderRadius: 9999,
          borderWidth: 1.5,
          px: 4.5,
          py: 1.25,
          fontWeight: 700,
          '&:hover': { borderColor: 'error.main', bgcolor: 'error.light', color: 'error.main' },
        }}
      >
        Remove{' '}
        <Box component="span" aria-hidden sx={{ ml: 1 }}>
          ✕
        </Box>
      </Button>
    </Paper>
  )
}
