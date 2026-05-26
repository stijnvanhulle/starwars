import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

export type CharacterCardChip = 'on-team' | 'dark-side'

export type CharacterCardProps = {
  name: string
  image?: string
  chip?: CharacterCardChip
  onClick?: () => void
  disabled?: boolean
}

const CHIP_LABEL: Record<CharacterCardChip, string> = {
  'on-team': 'On team',
  'dark-side': 'Dark side',
}

const CHIP_COLOR: Record<CharacterCardChip, 'primary' | 'error'> = {
  'on-team': 'primary',
  'dark-side': 'error',
}

export function CharacterCard({ name, image, chip, onClick, disabled }: CharacterCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', transition: 'border-color 0.12s ease', '&:hover': { borderColor: 'primary.main' } }}>
      <CardActionArea onClick={onClick} disabled={disabled} aria-label={name}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia image={image} sx={{ aspectRatio: '1 / 1', bgcolor: 'grey.100' }} />
          {chip && (
            <Chip
              size="small"
              color={CHIP_COLOR[chip]}
              label={CHIP_LABEL[chip]}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            />
          )}
        </Box>
        <CardContent sx={{ p: 4, borderTop: 1, borderColor: 'divider' }}>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
