import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { PagerButton } from '../common/PagerButton'
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

const LABEL_SX = {
  fontSize: 11,
  fontWeight: 700,
  color: '#94A3B8',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PagerButton onClick={onPrev}>
            <span aria-hidden>←</span>
            <span>Prev{prevName ? ` (${prevName})` : ''}</span>
          </PagerButton>
          <PagerButton onClick={onNext}>
            <span>Next{nextName ? ` (${nextName})` : ''}</span>
            <span aria-hidden>→</span>
          </PagerButton>
        </Box>
        {position && (
          <Box
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Box component="strong" sx={{ color: '#121A52', fontWeight: 800, mr: 1 }}>
              {position.index}
            </Box>
            of {position.total}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 360px) minmax(0, 1fr)' },
          gap: { xs: 6, md: 8 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 4,
          p: 6,
        }}
      >
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', bgcolor: '#121A52', aspectRatio: '4 / 5' }}>
          {character.image && <Box component="img" src={character.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          {showEvilBanner && (
            <Box
              component="span"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                px: 2.5,
                py: 0.75,
                borderRadius: 9999,
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Dark side
            </Box>
          )}
        </Box>

        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#121A52',
              mb: 5,
            }}
          >
            {character.name}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, minmax(0, 180px))' }, gap: 2, mb: 6 }}>
            {character.height !== undefined && <StatCard label="Height" value={Math.round(character.height * 100)} unit="cm" />}
            {character.mass !== undefined && <StatCard label="Mass" value={character.mass} unit="kg" />}
          </Box>

          {character.affiliations && character.affiliations.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Box sx={{ ...LABEL_SX, mb: 2 }}>Affiliations</Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {character.affiliations.map((a) => {
                  const dark = DARTH_OR_SITH.test(a)
                  return (
                    <Box
                      key={a}
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3,
                        py: 1.25,
                        borderRadius: 9999,
                        bgcolor: dark ? '#FEE2E2' : '#F1F5F9',
                        color: dark ? '#DC2626' : '#121A52',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: 9999, bgcolor: 'currentColor', opacity: 0.6 }} />
                      {a}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}

          {showEvilBanner ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 4,
                borderRadius: 3,
                bgcolor: '#FEE2E2',
                border: '1px solid #FCA5A5',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flex: '0 0 32px',
                  borderRadius: 9999,
                  bgcolor: '#FFFFFF',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                !
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ fontSize: 13, fontWeight: 800, color: '#DC2626', mb: 0.5 }}>On the dark side</Box>
                <Box sx={{ fontSize: 12, fontWeight: 600, color: '#7F1D1D' }}>This character is evil and cannot join your team.</Box>
              </Box>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} disabledReason={disabledReason} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <PrimaryButton label={actionLabel} onClick={onAddOrRemove} loading={loading} />
              {errorMessage !== undefined && (
                <Typography role="alert" sx={{ color: '#DC2626' }}>
                  {errorMessage}
                </Typography>
              )}
            </Box>
          )}
          {showEvilBanner && errorMessage !== undefined && (
            <Typography role="alert" sx={{ color: '#DC2626', mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
