import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs'

function renderTabs(props?: {
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  variant?: 'line' | 'pills' | 'enclosed'
}) {
  return render(
    <Tabs defaultValue="tab1" {...props}>
      <TabList>
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <Tab value="tab3" disabled>
          Tab 3
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
        <TabPanel value="tab3">Content 3</TabPanel>
      </TabPanels>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders all tab buttons', () => {
    renderTabs()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('renders tablist', () => {
    renderTabs()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('shows first tab content by default', () => {
    renderTabs()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('switches content on tab click', () => {
    renderTabs()
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('sets aria-selected on active tab', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false')
  })

  it('updates aria-selected when switching', () => {
    renderTabs()
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
  })

  it('active tab has tabIndex 0, others have -1', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('tabindex', '-1')
  })

  it('disabled tab is disabled', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeDisabled()
  })

  it('tab panel has correct ARIA attributes', () => {
    renderTabs()
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('id', 'tabpanel-tab1')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1')
  })

  it('tab has aria-controls pointing to panel', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-controls',
      'tabpanel-tab1'
    )
  })

  it('calls onChange when tab changes', () => {
    const onChange = vi.fn()
    renderTabs({ onChange })
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))
    expect(onChange).toHaveBeenCalledWith('tab2')
  })

  it('works in controlled mode', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Tabs value="tab1" onChange={onChange}>
        <TabList>
          <Tab value="tab1">T1</Tab>
          <Tab value="tab2">T2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">C1</TabPanel>
          <TabPanel value="tab2">C2</TabPanel>
        </TabPanels>
      </Tabs>
    )
    expect(screen.getByText('C1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'T2' }))
    expect(onChange).toHaveBeenCalledWith('tab2')
    // Still shows C1 because controlled — parent must update value
    expect(screen.getByText('C1')).toBeInTheDocument()

    rerender(
      <Tabs value="tab2" onChange={onChange}>
        <TabList>
          <Tab value="tab1">T1</Tab>
          <Tab value="tab2">T2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">C1</TabPanel>
          <TabPanel value="tab2">C2</TabPanel>
        </TabPanels>
      </Tabs>
    )
    expect(screen.getByText('C2')).toBeInTheDocument()
  })

  it('applies variant class to tab list', () => {
    renderTabs({ variant: 'pills' })
    expect(screen.getByRole('tablist')).toHaveClass('ds-tabs__list--pills')
  })

  it('renders tab with icon', () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a" icon={<span data-testid="tab-icon">I</span>}>
            With Icon
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">Content</TabPanel>
        </TabPanels>
      </Tabs>
    )
    expect(screen.getByTestId('tab-icon')).toBeInTheDocument()
  })
})
