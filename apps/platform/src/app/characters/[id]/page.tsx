import { notFound } from 'next/navigation'
import { characterIdSchema } from '@/server/schemas'
import { CharacterDetailContainer } from './CharacterDetailContainer'

type Params = { id: string }

export default async function CharacterDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const parsed = characterIdSchema.safeParse(id)
  if (!parsed.success) notFound()

  return <CharacterDetailContainer id={parsed.data} />
}
