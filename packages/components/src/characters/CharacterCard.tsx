import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import styles from './CharacterCard.module.css'

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

const CHIP_CLASS: Record<CharacterCardChip, string> = {
  'on-team': styles['badge-onTeam'] ?? '',
  'dark-side': styles['badge-darkSide'] ?? '',
}

export function CharacterCard({ name, image, chip, onClick, disabled }: CharacterCardProps) {
  return (
    <ButtonBase className={styles.card} onClick={onClick} disabled={disabled} aria-label={name} component="button">
      <Box component="span" className={styles.media}>
        {image && <Box component="img" src={image} alt="" className={styles.image} />}
        {chip && (
          <Box component="span" className={`${styles.badge} ${CHIP_CLASS[chip]}`}>
            {CHIP_LABEL[chip]}
          </Box>
        )}
      </Box>
      <Box component="span" className={styles.body}>
        <Typography component="h3" className={styles.name}>
          {name}
        </Typography>
      </Box>
    </ButtonBase>
  )
}
