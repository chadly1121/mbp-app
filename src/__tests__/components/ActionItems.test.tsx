import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ActionItems } from '@/components/mbp/tabs/ActionItems';
import * as useActionItemsModule from '@/hooks/useActionItems';

// Mock dependencies
vi.mock('@/hooks/useActionItems');
vi.mock('@/hooks/useCompany');
vi.mock('@/components/mbp/shared/BaseMBPTab', () => ({
  BaseMBPTab: ({ children, title, loading, error, isEmpty, emptyStateTitle }: any) => {
    if (loading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error}</div>;
    if (isEmpty) return <div data-testid="empty">{emptyStateTitle}</div>;
    return (
      <div data-testid="base-tab">
        <h2>{title}</h2>
        {children}
      </div>
    );
  },
}));

const mockUseActionItems = vi.mocked(useActionItemsModule.useActionItems);

describe('ActionItems Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActionItems.mockReturnValue({
      actionItems: [],
      filteredActionItems: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createActionItem: vi.fn(),
      updateActionItem: vi.fn(),
      deleteActionItem: vi.fn(),
      toggleCompletion: vi.fn(),
      creating: false,
      updating: false,
      deleting: false,
    });
  });

  it('should render without crashing', () => {
    const { container } = render(<ActionItems />);
    expect(container).toBeDefined();
  });

  it('should handle loading state', () => {
    mockUseActionItems.mockReturnValue({
      actionItems: null,
      filteredActionItems: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      createActionItem: vi.fn(),
      updateActionItem: vi.fn(),
      deleteActionItem: vi.fn(),
      toggleCompletion: vi.fn(),
      creating: false,
      updating: false,
      deleting: false,
    });

    const { getByTestId } = render(<ActionItems />);
    expect(getByTestId('loading')).toBeDefined();
  });
});