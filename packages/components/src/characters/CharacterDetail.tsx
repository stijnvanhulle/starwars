import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { PrimaryButton } from '../common/PrimaryButton'
import { StatCard } from '../common/StatCard'
import styles from './CharacterDetail.module.css'

export type CharacterDetailItem = {
  id: number
  name: string
  image?: string
  height?: number
  mass?: number
  affiliations?: ReadonlyArray<string>
}

export type CharacterDetailProps = {
  character: CharacterDetailItem
  onTeam: boolean
  evil: boolean
  errorMessage?: string
  loading?: boolean
  prevName?: string
  nextName?: string
  position?: { index: number; total: number }
  onPrev?: () => void
  onNext?: () => void
  onAddOrRemove?: () => void
}

const EVIL_REASON = 'Evil characters cannot join the team.'
const DARTH_OR_SITH = /darth|sith/i

export function CharacterDetail({
  character,
  onTeam,
  evil,
  errorMessage,
  loading,
  prevName,
  nextName,
  position,
  onPrev,
  onNext,
  onAddOrRemove,
}: CharacterDetailProps) {
  const showEvilBanner = evil && !onTeam
  const actionLabel = onTeam ? 'Remove from team' : 'Add to team'
  const disabledReason = showEvilBanner ? EVIL_REASON : undefined
  const darkChip = styles['chip-dark'] ?? ''

  return (
    <Box className={styles.root}>
      <Box className={styles.pager}>
        <Box className={styles['pager-nav']}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onPrev}
            disabled={onPrev === undefined}
            sx={{
              borderRadius: 9999,
              borderWidth: 1.5,
              fontWeight: 700,
              fontSize: 13,
              '&:hover': { borderColor: 'primary.main', color: 'primary.dark' },
            }}
          >
            <Box component="span" aria-hidden sx={{ mr: 1 }}>
              ←
            </Box>
            Prev{prevName ? ` (${prevName})` : ''}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onNext}
            disabled={onNext === undefined}
            sx={{
              borderRadius: 9999,
              borderWidth: 1.5,
              fontWeight: 700,
              fontSize: 13,
              '&:hover': { borderColor: 'primary.main', color: 'primary.dark' },
            }}
          >
            Next{nextName ? ` (${nextName})` : ''}
            <Box component="span" aria-hidden sx={{ ml: 1 }}>
              →
            </Box>
          </Button>
        </Box>
        {position && (
          <Box className={styles.position}>
            <Box component="strong">{position.index}</Box>
            of {position.total}
          </Box>
        )}
      </Box>

      <Box className={styles.detail}>
        <Box className={styles.hero}>
          {character.image && <Box component="img" src={character.image} alt="" />}
          {showEvilBanner && (
            <Box component="span" className={styles.heroChip}>
              Dark side
            </Box>
          )}
        </Box>

        <Box>
          <Typography component="h1" className={styles.name}>
            {character.name}
          </Typography>

          <Box className={styles.stats}>
            {character.height !== undefined && <StatCard label="Height" value={Math.round(character.height * 100)} unit="cm" />}
            {character.mass !== undefined && <StatCard label="Mass" value={character.mass} unit="kg" />}
          </Box>

          {character.affiliations && character.affiliations.length > 0 && (
            <Box>
              <Box className={styles.sectionLabel}>Affiliations</Box>
              <Box className={styles.affiliations}>
                {character.affiliations.map((a) => {
                  const dark = DARTH_OR_SITH.test(a)
                  return (
                    <Box key={a} component="span" className={`${styles.chip} ${dark ? darkChip : ''}`}>
                      <Box component="span" className={styles.chipDot} />
                      {a}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}

          {showEvilBanner ? (
            <Box className={styles.actionsBox}>
              <Box className={styles.actionsIcon}>!</Box>
              <Box className={styles.actionsCopy}>
                <Box className={styles.actionsTitle}>On the dark side</Box>
                <Box className={styles.actionsDesc}>This character is evil and cannot join your team.</Box>
              </Box>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} disabledReason={disabledReason} />
            </Box>
          ) : (
            <Box className={styles.actionRow}>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} />
              {errorMessage !== undefined && (
                <Typography role="alert" className={styles.errorText}>
                  {errorMessage}
                </Typography>
              )}
            </Box>
          )}
          {showEvilBanner && errorMessage !== undefined && (
            <Typography role="alert" className={styles.errorText} sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
