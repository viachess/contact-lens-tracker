import { Provider } from 'react-redux';
import { store } from '@/app/store/store';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from '@/pages/settings-page/settings-page';
import { vi } from 'vitest';

vi.mock('@/shared/lib/supabaseClient', () => {
  return {
    getSupabaseClient: () => ({
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        }),
        update: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        }),
        delete: () => ({
          eq: async () => ({ error: null })
        }),
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [], error: null })
          })
        })
      })
    }),
    isSupabaseConfigured: true
  };
});

describe('SettingsPage', () => {
  const renderWithProvider = (ui: React.ReactElement) =>
    render(<Provider store={store}>{ui}</Provider>);

  test('renders', () => {
    renderWithProvider(<SettingsPage />);
    expect(screen.getByText(/Настройки/)).toBeInTheDocument();
  });

  test('add lens btn works (smoke)', async () => {
    renderWithProvider(<SettingsPage />);
    fireEvent.click(screen.getByText('Добавить линзу'));
    await waitFor(() => {});
  });
});
