import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export type CharacterCardProps = {
  name: string
  image?: string
  onClick?: () => void
  disabled?: boolean
}

/**
 * Grid card for the character list. Square media on top, name below. Border flips from
 * neutral.200 to accent.500 on hover/focus. Nothing moves.
 */
export function CharacterCard({ name, image, onClick, disabled }: CharacterCardProps) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label={name}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
        '&:hover': { borderColor: '#FF348A' },
        '&:focus-visible': { borderColor: '#FF348A', outline: '2px solid #FF348A', outlineOffset: 2 },
        '&.Mui-disabled': { opacity: 0.5 },
      }}
    >
      <Box
        sx={{
          aspectRatio: '1 / 1',
          bgcolor: '#F1F5F9',
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box sx={{ p: 4, borderTop: '1px solid #E2E8F0' }}>
        <Typography variant="h3" component="h3">
          {name}
        </Typography>
      </Box>
    </ButtonBase>
  )
}
