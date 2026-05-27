import Box from '@mui/material/Box'
import { StatePanel } from '@whale/components'
import { CharacterCard, type CharacterCardChip } from './CharacterCard'
import { CharacterListSkeleton } from './CharacterListSkeleton'

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
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          name={character.name}
          image={character.image}
          chip={character.chip}
          onClick={onSelect ? () => onSelect(character.id) : undefined}
        />
      ))}
    </Box>
  )
}
