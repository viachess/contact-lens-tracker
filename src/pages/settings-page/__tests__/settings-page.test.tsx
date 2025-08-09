import { Provider } from 'react-redux'
import { store } from '@/app/store/store'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsPage } from '@/pages/settings-page/settings-page'
import { vi } from 'vitest'
import * as supabaseClient from '@/shared/lib/supabaseClient'

vi.spyOn(supabaseClient, 'supabase', 'get').mockReturnValue({
  from: () => ({
    insert: () => ({
      select: () => ({ single: () => ({ data: null, error: null }) })
    }),
    update: () => ({
      select: () => ({ single: () => ({ data: null, error: null }) })
    }),
    delete: () => ({ eq: () => ({ error: null }) }),
    select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) })
  })
} as any)

describe('SettingsPage', () => {
  const renderWithProvider = (ui: React.ReactElement) =>
    render(<Provider store={store}>{ui}</Provider>)

  test('renders', () => {
    renderWithProvider(<SettingsPage />)
    expect(screen.getByText(/Настройки/)).toBeInTheDocument()
  })

  test('add lens btn works (smoke)', async () => {
    renderWithProvider(<SettingsPage />)
    fireEvent.click(screen.getByText('Добавить линзу'))
    await waitFor(() => {})
  })
})
