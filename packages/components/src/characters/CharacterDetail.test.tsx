import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharacterDetail } from './CharacterDetail'

const baseCharacter = {
  id: 4,
  name: 'Darth Vader',
  affiliations: ['Galactic Empire', 'Sith'],
}

describe('CharacterDetail', () => {
  it('hides Add for an evil character and shows the dark side banner', () => {
    render(<CharacterDetail character={baseCharacter} onTeam={false} evil />)

    expect(screen.queryByRole('button', { name: /add to team/i })).toBeNull()
    expect(screen.getByText(/on the dark side/i)).toBeInTheDocument()
  })

  it('enables Add for a neutral character', () => {
    render(<CharacterDetail character={{ id: 1, name: 'Luke Skywalker' }} onTeam={false} evil={false} />)
    expect(screen.getByRole('button', { name: /add to team/i })).toBeEnabled()
  })
})
