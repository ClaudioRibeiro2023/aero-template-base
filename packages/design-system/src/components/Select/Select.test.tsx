import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from './Select'

const options = [
  { value: 'br', label: 'Brazil' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
]

describe('Select', () => {
  it('renders select element', () => {
    render(<Select id="s1" options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders options', () => {
    render(<Select id="s1" options={options} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Japan')).toBeInTheDocument()
  })

  it('renders placeholder', () => {
    render(<Select id="s1" options={options} placeholder="Choose a country" />)
    expect(screen.getByText('Choose a country')).toBeInTheDocument()
  })

  it('renders label', () => {
    render(<Select id="s1" options={options} label="Country" />)
    expect(screen.getByText('Country')).toBeInTheDocument()
  })

  it('label is associated with select', () => {
    render(<Select id="s1" options={options} label="Country" />)
    expect(screen.getByLabelText('Country')).toBeInTheDocument()
  })

  it('renders helper text', () => {
    render(<Select id="s1" options={options} helperText="Pick one" />)
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Select id="s1" options={options} error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('hides helper when error is present', () => {
    render(<Select id="s1" options={options} helperText="Help" error="Error" />)
    expect(screen.queryByText('Help')).not.toBeInTheDocument()
  })

  it('sets aria-invalid on error', () => {
    render(<Select id="s1" options={options} error="Bad" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby for error', () => {
    render(<Select id="s1" options={options} error="E" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 's1-error')
  })

  it('sets aria-describedby for helper', () => {
    render(<Select id="s1" options={options} helperText="H" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 's1-helper')
  })

  it('disables select', () => {
    render(<Select id="s1" options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('disables individual option', () => {
    const opts = [...options, { value: 'disabled', label: 'Disabled', disabled: true }]
    render(<Select id="s1" options={opts} />)
    const opt = screen.getByText('Disabled') as HTMLOptionElement
    expect(opt.disabled).toBe(true)
  })

  it('handles change event', () => {
    const onChange = vi.fn()
    render(<Select id="s1" options={options} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'us' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('applies fullWidth by default', () => {
    const { container } = render(<Select id="s1" options={options} />)
    expect(container.querySelector('.ds-select-wrapper--full')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSelectElement | null }
    render(<Select id="s1" options={options} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('applies custom className', () => {
    const { container } = render(<Select id="s1" options={options} className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
