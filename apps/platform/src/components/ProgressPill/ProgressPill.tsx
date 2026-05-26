import styles from './ProgressPill.module.css'

export type ProgressPillProps = {
  current: number
  total: number
}

/**
 * App-side `ProgressPill` styled with a colocated CSS module. Matches the
 * library version (`@stijnvanhulle/components` → `ProgressPill`) one-for-one;
 * lives here only so the project exercises both styling paths.
 */
export function ProgressPill({ current, total }: ProgressPillProps) {
  return (
    <div className={styles.pill}>
      <span className={styles.label}>
        {current} / {total}
      </span>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} aria-hidden className={`${styles.dot} ${i < current ? (styles['dot-filled'] ?? '') : ''}`} />
      ))}
    </div>
  )
}
