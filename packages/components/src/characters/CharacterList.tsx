import Box from '@mui/material/Box'
import { CharacterCard, type CharacterCardChip } from './CharacterCard'
import { CharacterListSkeleton } from './CharacterListSkeleton'
import { StatePanel } from '../common/StatePanel'

export type CharacterListItem = {
  id: number
  name: string
  image?: string
  chip?: CharacterCardChip
}

export type CharacterListProps = {
  state: 'loading' | 'error' | 'success'
  characters?: ReadonlyArray<CharacterListItem>
  errorMessage?: string
  onSelect?: (id: number) => void
}

export function CharacterList({ state, characters, errorMessage, onSelect }: CharacterListProps) {
  if (state === 'loading') return <CharacterListSkeleton />
  if (state === 'error') return <StatePanel variant="error" description={errorMessage} />
  if (characters === undefined || characters.length === 0) return <StatePanel variant="empty" />
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 6,
      }}
    >
      {characters.map((c) => (
        <CharacterCard key={c.id} name={c.name} image={c.image} chip={c.chip} onClick={onSelect ? () => onSelect(c.id) : undefined} />
      ))}
    </Box>
  )
}
