import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown'

function renderDropdown(props?: { align?: 'start' | 'end' | 'center' }) {
  return render(
    <Dropdown {...props}>
      <DropdownTrigger>Open</DropdownTrigger>
      <DropdownMenu>
        <DropdownLabel>Section</DropdownLabel>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive>Delete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

describe('Dropdown', () => {
  it('renders trigger button', () => {
    renderDropdown()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('menu is hidden by default', () => {
    renderDropdown()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows menu on trigger click', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('hides menu on second trigger click', () => {
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'Open' })
    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('sets aria-expanded on trigger', () => {
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'Open' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('trigger has aria-haspopup', () => {
    renderDropdown()
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('renders menu items', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument()
  })

  it('renders destructive item', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const deleteItem = screen.getByRole('menuitem', { name: 'Delete' })
    expect(deleteItem).toHaveClass('ds-dropdown__item--destructive')
  })

  it('renders separator', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders label', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('Section')).toBeInTheDocument()
  })

  it('closes menu on item click', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('fires item onClick', () => {
    const onClick = vi.fn()
    render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={onClick}>Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('closes menu on Escape key', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on click outside', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders item with icon', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem icon={<span data-testid="icon">I</span>}>With icon</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies align class', () => {
    const { container } = renderDropdown({ align: 'end' })
    expect(container.querySelector('.ds-dropdown--end')).toBeInTheDocument()
  })
})
