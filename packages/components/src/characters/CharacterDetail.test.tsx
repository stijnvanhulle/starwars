import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharacterDetail } from './CharacterDetail'

const baseCharacter = {
  id: 4,
  name: 'Darth Vader',
  affiliations: ['Galactic Empire', 'Sith'],
}

describe('CharacterDetail', () => {
  it('disables Add for an evil character and exposes the tooltip text', () => {
    render(<CharacterDetail character={baseCharacter} onTeam={false} evil />)

    const button = screen.getByRole('button', { name: /add to team/i })
    expect(button).toBeDisabled()

    const wrapper = button.parentElement as HTMLElement
    expect(wrapper.getAttribute('aria-label') ?? wrapper.getAttribute('title') ?? '').toMatch(/evil/i)
  })

  it('enables Add for a neutral character', () => {
    render(<CharacterDetail character={{ id: 1, name: 'Luke Skywalker' }} onTeam={false} evil={false} />)
    expect(screen.getByRole('button', { name: /add to team/i })).toBeEnabled()
  })
})
