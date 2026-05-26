import { CharacterDetailContainer } from './CharacterDetailContainer'

type Params = { id: string }

export default async function CharacterDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const parsed = Number.parseInt(id, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return <CharacterDetailContainer id={NaN} />
  }
  return <CharacterDetailContainer id={parsed} />
}
