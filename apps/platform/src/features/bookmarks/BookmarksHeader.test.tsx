import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BookmarksHeader } from './BookmarksHeader'

describe('BookmarksHeader', () => {
  it('hides the clear button when the count is zero', () => {
    render(<BookmarksHeader count={0} onClear={vi.fn()} />)

    expect(screen.getByText('Bookmarks')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
  })

  it('renders the clear button and fires onClear when there are bookmarks', async () => {
    const onClear = vi.fn()

    render(<BookmarksHeader count={3} onClear={onClear} />)

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(onClear).toHaveBeenCalledOnce()
  })
})
