import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export type TeamMemberRowProps = {
  name: string
  image?: string
  onRemove?: () => void
  variant?: 'compact' | 'full'
}

/**
 * Roster row used in both the sidebar (compact) and the /team page (full). Renders the
 * avatar, name, and a Remove control that delegates the action upward.
 */
export function TeamMemberRow({ name, image, onRemove, variant = 'full' }: TeamMemberRowProps) {
  const compact = variant === 'compact'
  const avatarSize = compact ? 36 : 72

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${avatarSize}px minmax(0, 1fr) auto`,
        alignItems: 'center',
        gap: 4,
        p: compact ? 2 : 4,
        bgcolor: '#FFFFFF',
        border: compact ? 'none' : '1px solid #E2E8F0',
        borderRadius: 4,
      }}
    >
      <Avatar src={image} alt={name} sx={{ width: avatarSize, height: avatarSize, borderRadius: 3 }} />
      <Typography component={compact ? 'span' : 'h2'} sx={{ fontWeight: 800, fontSize: compact ? '0.875rem' : '1.25rem' }}>
        {name}
      </Typography>
      <Button onClick={onRemove} size="small" variant="outlined" aria-label={`Remove ${name}`} sx={{ borderRadius: 9999 }}>
        Remove
      </Button>
    </Box>
  )
}
