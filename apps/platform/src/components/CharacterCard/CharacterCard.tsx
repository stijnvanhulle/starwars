import type { CharacterCardChip } from '@stijnvanhulle/components'
import styles from './CharacterCard.module.css'

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

/**
 * App-side `CharacterCard` styled with a colocated CSS module. Visually
 * identical to the library version but proves the CSS-module pipeline works
 * inside `apps/platform`. The library copy stays on `sx` so consumers of
 * `@stijnvanhulle/components` don't need a CSS loader.
 */
export function CharacterCard({ name, image, chip, onClick, disabled }: CharacterCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick} disabled={disabled} aria-label={name}>
      <span className={styles.media}>
        {image && <img className={styles.image} src={image} alt="" />}
        {chip && <span className={`${styles.badge} ${CHIP_CLASS[chip]}`}>{CHIP_LABEL[chip]}</span>}
      </span>
      <span className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
      </span>
    </button>
  )
}
