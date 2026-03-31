import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Accordion } from './Accordion'

const faqItems = [
  {
    value: 'q1',
    title: 'What is this platform?',
    content: 'A multi-tenant SaaS template with Next.js, Supabase Auth, and PostgreSQL.',
  },
  {
    value: 'q2',
    title: 'How do I get started?',
    content: 'Clone the repository, run docker compose up, and start developing.',
  },
  {
    value: 'q3',
    title: 'Is it production-ready?',
    content: 'Yes! It includes security headers, CSRF protection, and full test coverage.',
  },
  {
    value: 'q4',
    title: 'Can I customize the theme?',
    content: 'Absolutely. Design tokens can be modified in the design-system package.',
  },
]

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { items: faqItems },
}

export const DefaultOpen: Story = {
  args: { items: faqItems, defaultValue: ['q1'] },
}

export const Multiple: Story = {
  args: { items: faqItems, multiple: true, defaultValue: ['q1', 'q3'] },
}

export const Controlled: Story = {
  render: function Demo() {
    const [value, setValue] = useState<string[]>(['q2'])
    return (
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Open: <strong>{value.join(', ') || 'none'}</strong>
        </p>
        <Accordion items={faqItems} value={value} onChange={setValue} multiple />
      </div>
    )
  },
}

export const WithDisabled: Story = {
  args: {
    items: [
      ...faqItems.slice(0, 2),
      {
        value: 'q3',
        title: 'Premium Feature (Locked)',
        content: 'Upgrade to access.',
        disabled: true,
      },
      ...faqItems.slice(3),
    ],
  },
}
