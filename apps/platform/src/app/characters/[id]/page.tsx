import { characterIdSchema } from '@/server/schemas'
import { CharacterDetailContainer } from './CharacterDetailContainer'

type Params = { id: string }

export default async function CharacterDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const parsed = characterIdSchema.safeParse(id)

  return <CharacterDetailContainer id={parsed.success ? parsed.data : NaN} />
}
