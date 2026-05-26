import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PrimaryButton } from '../common/PrimaryButton'
import { StatCard } from '../common/StatCard'

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

const pagerButtonSx = {
  borderRadius: 9999,
  borderWidth: 1.5,
  fontWeight: 700,
  fontSize: 13,
  '&:hover': { borderColor: 'primary.main', color: 'primary.dark' },
}

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

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="inherit" onClick={onPrev} disabled={onPrev === undefined} sx={pagerButtonSx}>
            <Box component="span" aria-hidden sx={{ mr: 1 }}>
              ←
            </Box>
            Prev{prevName ? ` (${prevName})` : ''}
          </Button>
          <Button variant="outlined" color="inherit" onClick={onNext} disabled={onNext === undefined} sx={pagerButtonSx}>
            Next{nextName ? ` (${nextName})` : ''}
            <Box component="span" aria-hidden sx={{ ml: 1 }}>
              →
            </Box>
          </Button>
        </Stack>
        {position && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: 'text.disabled',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Box component="strong" sx={{ color: 'text.primary', fontWeight: 800, mr: 1 }}>
              {position.index}
            </Box>
            of {position.total}
          </Typography>
        )}
      </Stack>

      <Card
        variant="outlined"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(280px, 360px) minmax(0, 1fr)' },
          gap: { xs: 6, sm: 8 },
          p: 6,
          borderRadius: 4,
        }}
      >
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', bgcolor: 'text.primary', aspectRatio: '4 / 5' }}>
          {character.image && <CardMedia image={character.image} sx={{ width: '100%', height: '100%' }} />}
          {showEvilBanner && (
            <Chip
              size="small"
              color="error"
              label="Dark side"
              sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
            />
          )}
        </Box>

        <Box>
          <Typography component="h1" sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', mb: 5 }}>
            {character.name}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 6, flexWrap: 'wrap' }}>
            {character.height !== undefined && <StatCard label="Height" value={Math.round(character.height * 100)} unit="cm" />}
            {character.mass !== undefined && <StatCard label="Mass" value={character.mass} unit="kg" />}
          </Stack>

          {character.affiliations && character.affiliations.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2 }}>
                Affiliations
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                {character.affiliations.map((a) => {
                  const dark = DARTH_OR_SITH.test(a)
                  return <Chip key={a} label={a} size="small" color={dark ? 'error' : 'default'} variant={dark ? 'filled' : 'outlined'} />
                })}
              </Stack>
            </Box>
          )}

          {showEvilBanner ? (
            <Alert
              severity="error"
              action={<PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} disabledReason={disabledReason} />}
              sx={{ alignItems: 'center', '& .MuiAlert-action': { alignItems: 'center', pt: 0 } }}
            >
              <AlertTitle sx={{ mb: 0 }}>On the dark side</AlertTitle>
              This character is evil and cannot join your team.
            </Alert>
          ) : (
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} />
              {errorMessage !== undefined && (
                <Typography role="alert" color="error">
                  {errorMessage}
                </Typography>
              )}
            </Stack>
          )}
          {showEvilBanner && errorMessage !== undefined && (
            <Typography role="alert" color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  )
}
