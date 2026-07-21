import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import NewsSEO from '@/components/NewsSEO.tsx'

describe('NewsSEO', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HelmetProvider>
        <NewsSEO
          title="Test News"
          summary="Test summary"
          url="https://test.com/news/1"
        />
      </HelmetProvider>
    );
    expect(container).toBeDefined();
  });
});