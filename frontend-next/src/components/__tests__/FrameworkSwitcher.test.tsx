import { screen } from '@testing-library/react';
import FrameworkSwitcher from '@/components/FrameworkSwitcher';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

describe('FrameworkSwitcher', () => {
  it('renders current framework select', () => {
    renderWithProviders(<FrameworkSwitcher current="next" />);
    expect(screen.getByLabelText('Выбор фреймворка')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('🔵 Next.js');
  });
});
