import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { PrimaryButton, StatCard } from '@whale/components'

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
  bookmarked?: boolean
  onBookmarkToggle?: () => void
}

const DARTH_OR_SITH = /darth|sith/i

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z" />
    </svg>
  )
}

const pagerButtonSx = {
  borderRadius: 9999,
  borderWidth: 1.5,
  fontWeight: 700,
  fontSize: 13,
  '&:hover': { borderColor: 'primary.main', color: 'primary.dark' },
}

const kbdSx = {
  display: 'inline-block',
  px: 1.25,
  py: 0.25,
  mx: 0.5,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  fontFamily: 'monospace',
  fontSize: 11,
  fontWeight: 700,
  color: 'text.primary',
  lineHeight: 1.4,
}

function KeyboardShortcutsHint({ canToggleTeam }: { canToggleTeam: boolean }) {
  return (
    <Typography
      component="p"
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: (theme) => theme.zIndex.appBar,
        px: 3,
        py: 1.5,
        borderRadius: 9999,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 2,
        fontSize: 13,
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: 1,
      }}
    >
      <Box component="span" sx={{ mr: 1, fontWeight: 600 }}>
        Shortcuts:
      </Box>
      <Box component="kbd" sx={kbdSx}>
        ←
      </Box>
      <Box component="kbd" sx={kbdSx}>
        →
      </Box>
      prev / next
      {canToggleTeam && (
        <>
          <Box component="span" sx={{ mx: 1.5 }}>
            ·
          </Box>
          <Box component="kbd" sx={kbdSx}>
            Space
          </Box>
          toggle team
        </>
      )}
    </Typography>
  )
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
  bookmarked,
  onBookmarkToggle,
}: CharacterDetailProps) {
  const showEvilBanner = evil && !onTeam
  const actionLabel = onTeam ? 'Remove from team' : 'Add to team'

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
              <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {character.affiliations.map((affiliation) => {
                  const dark = DARTH_OR_SITH.test(affiliation)
                  return <Chip key={affiliation} label={affiliation} size="small" color={dark ? 'error' : 'default'} variant={dark ? 'filled' : 'outlined'} />
                })}
              </Stack>
            </Box>
          )}

          {showEvilBanner ? (
            <Stack spacing={2}>
              <Alert
                severity="info"
                action={
                  onBookmarkToggle !== undefined ? (
                    <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                      <IconButton
                        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                        aria-pressed={bookmarked}
                        onClick={onBookmarkToggle}
                        color={bookmarked ? 'primary' : 'default'}
                      >
                        <HeartIcon filled={bookmarked === true} />
                      </IconButton>
                    </Tooltip>
                  ) : undefined
                }
                sx={{ alignItems: 'center', '& .MuiAlert-action': { alignItems: 'center', pt: 0 } }}
              >
                <AlertTitle sx={{ mb: 0 }}>On the dark side</AlertTitle>
                This character is evil and cannot join your team.
              </Alert>
            </Stack>
          ) : (
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} />
              {onBookmarkToggle !== undefined && (
                <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                  <IconButton
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    aria-pressed={bookmarked}
                    onClick={onBookmarkToggle}
                    color={bookmarked ? 'primary' : 'default'}
                  >
                    <HeartIcon filled={bookmarked === true} />
                  </IconButton>
                </Tooltip>
              )}
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
          <KeyboardShortcutsHint canToggleTeam={!showEvilBanner} />
        </Box>
      </Card>
    </Box>
  )
}
