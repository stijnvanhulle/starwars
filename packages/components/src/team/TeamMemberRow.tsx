import Box from '@mui/material/Box'

export type TeamMemberRowProps = {
  name: string
  image?: string
  onRemove?: () => void
  variant?: 'compact' | 'full'
}

/**
 * Roster row used in both the right sidebar (compact, 36px avatar, ✕ button)
 * and the `/team` page (full, 72px avatar, outlined Remove pill).
 */
export function TeamMemberRow({ name, image, onRemove, variant = 'full' }: TeamMemberRowProps) {
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr auto',
          alignItems: 'center',
          gap: 2.5,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          '&:hover': { bgcolor: '#F1F5F9' },
        }}
      >
        <Box
          component={image ? 'img' : 'div'}
          src={image}
          alt=""
          sx={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            objectFit: 'cover',
            bgcolor: '#F1F5F9',
          }}
        />
        <Box
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: '#121A52',
            lineHeight: 1.2,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          sx={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            border: 'none',
            bgcolor: 'transparent',
            color: '#94A3B8',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' },
          }}
        >
          ✕
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '56px 1fr', sm: '72px minmax(0, 1fr) auto' },
        alignItems: 'center',
        gap: { xs: 3, sm: 5 },
        p: 4,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 4,
        '&:hover': { borderColor: '#FF348A' },
      }}
    >
      <Box
        component={image ? 'img' : 'div'}
        src={image}
        alt=""
        sx={{
          width: { xs: 56, sm: 72 },
          height: { xs: 56, sm: 72 },
          borderRadius: 3,
          objectFit: 'cover',
          bgcolor: '#F1F5F9',
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box
          component="h2"
          sx={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: '#121A52',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </Box>
      </Box>
      <Box
        component="button"
        type="button"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        sx={{
          gridColumn: { xs: '1 / -1', sm: 'auto' },
          justifySelf: { xs: 'stretch', sm: 'end' },
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          px: 4.5,
          py: 2.5,
          borderRadius: 9999,
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          color: '#121A52',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          '&:hover': { borderColor: '#DC2626', bgcolor: '#FEE2E2', color: '#DC2626' },
        }}
      >
        <span>Remove</span>
        <span aria-hidden>✕</span>
      </Box>
    </Box>
  )
}
