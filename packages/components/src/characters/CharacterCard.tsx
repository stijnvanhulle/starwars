import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export type CharacterCardChip = 'on-team' | 'dark-side'

export type CharacterCardProps = {
  name: string
  image?: string
  chip?: CharacterCardChip
  onClick?: () => void
  disabled?: boolean
}

const CHIP_STYLE: Record<CharacterCardChip, { bg: string; label: string }> = {
  'on-team': { bg: '#FF348A', label: 'On team' },
  'dark-side': { bg: '#DC2626', label: 'Dark side' },
}

/**
 * Grid card for the character list. Square media with optional status chip in
 * the top-left, name strip below with a hairline divider. Hover flips the
 * border to accent pink.
 */
export function CharacterCard({ name, image, chip, onClick, disabled }: CharacterCardProps) {
  const chipStyle = chip === undefined ? undefined : CHIP_STYLE[chip]
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
          position: 'relative',
          aspectRatio: '1 / 1',
          bgcolor: '#F1F5F9',
          overflow: 'hidden',
        }}
      >
        {image && <Box component="img" src={image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        {chipStyle && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'inline-flex',
              alignItems: 'center',
              px: 2.5,
              py: 0.75,
              borderRadius: 9999,
              bgcolor: chipStyle.bg,
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {chipStyle.label}
          </Box>
        )}
      </Box>
      <Box sx={{ px: 4, pt: 3.5, pb: 4, borderTop: '1px solid #E2E8F0' }}>
        <Typography
          component="h3"
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: '#121A52',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </Typography>
      </Box>
    </ButtonBase>
  )
}
