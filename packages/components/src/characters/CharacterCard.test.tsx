import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CharacterCard } from './CharacterCard'

describe('CharacterCard', () => {
  it('renders the name and fires onClick', async () => {
    const onClick = vi.fn()

    render(<CharacterCard name="Luke Skywalker" onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Luke Skywalker' })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('marks the card disabled when disabled', () => {
    const onClick = vi.fn()

    render(<CharacterCard name="Vader" onClick={onClick} disabled />)
    expect(screen.getByRole('button', { name: 'Vader' })).toBeDisabled()
  })
})
