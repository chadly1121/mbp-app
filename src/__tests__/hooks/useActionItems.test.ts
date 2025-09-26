import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useActionItems } from '@/hooks/useActionItems';
import * as useSupabaseQueryModule from '@/hooks/useSupabaseQuery';
import * as useSupabaseMutationModule from '@/hooks/useSupabaseMutation';
import * as useCompanyModule from '@/hooks/useCompany';

// Mock the dependencies
vi.mock('@/hooks/useSupabaseQuery');
vi.mock('@/hooks/useSupabaseMutation');
vi.mock('@/hooks/useCompany');
vi.mock('@/integrations/supabase/client');

const mockUseSupabaseQuery = vi.mocked(useSupabaseQueryModule.useSupabaseQuery);
const mockUseSupabaseMutation = vi.mocked(useSupabaseMutationModule.useSupabaseMutation);
const mockUseCompany = vi.mocked(useCompanyModule.useCompany);

describe('useActionItems', () => {
  const mockCompany = {
    id: 'company-1',
    name: 'Test Company',
    slug: 'test-company',
    owner_id: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
  };

  const mockActionItems = [
    {
      id: '1',
      title: 'Test Action 1',
      description: 'Test description',
      assigned_to: 'John Doe',
      due_date: '2023-12-31',
      priority: 'high' as const,
      status: 'pending' as const,
      category: 'Strategic',
      company_id: 'company-1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: '2',
      title: 'Test Action 2',
      description: null,
      assigned_to: null,
      due_date: null,
      priority: 'medium' as const,
      status: 'completed' as const,
      category: 'Operations',
      company_id: 'company-1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCompany.mockReturnValue({
      currentCompany: mockCompany,
      companies: [mockCompany],
      loading: false,
      setCurrentCompany: vi.fn(),
      createCompany: vi.fn(),
      refreshCompanies: vi.fn(),
    });

    mockUseSupabaseQuery.mockReturnValue({
      data: mockActionItems,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseSupabaseMutation.mockReturnValue({
      mutate: vi.fn(),
      loading: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('should return action items when company is selected', () => {
    const { result } = renderHook(() => useActionItems());

    expect(result.current.actionItems).toEqual(mockActionItems);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should filter action items by status', () => {
    const { result } = renderHook(() => 
      useActionItems({ status: 'completed', priority: 'all' })
    );

    expect(result.current.filteredActionItems).toHaveLength(1);
    expect(result.current.filteredActionItems[0].id).toBe('2');
  });

  it('should filter action items by priority', () => {
    const { result } = renderHook(() => 
      useActionItems({ status: 'all', priority: 'high' })
    );

    expect(result.current.filteredActionItems).toHaveLength(1);
    expect(result.current.filteredActionItems[0].id).toBe('1');
  });

  it('should filter action items by multiple criteria', () => {
    const { result } = renderHook(() => 
      useActionItems({ 
        status: 'pending', 
        priority: 'high',
        category: 'Strategic' 
      })
    );

    expect(result.current.filteredActionItems).toHaveLength(1);
    expect(result.current.filteredActionItems[0].id).toBe('1');
  });

  it('should return empty array when filters exclude all items', () => {
    const { result } = renderHook(() => 
      useActionItems({ status: 'completed', priority: 'high' })
    );

    expect(result.current.filteredActionItems).toHaveLength(0);
  });

  it('should handle no company selected', () => {
    mockUseCompany.mockReturnValue({
      currentCompany: null,
      companies: [],
      loading: false,
      setCurrentCompany: vi.fn(),
      createCompany: vi.fn(),
      refreshCompanies: vi.fn(),
    });

    mockUseSupabaseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: 'No company selected',
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useActionItems());

    expect(result.current.actionItems).toBe(null);
    expect(result.current.error).toBe('No company selected');
  });

  it('should provide mutation functions', () => {
    const { result } = renderHook(() => useActionItems());

    expect(typeof result.current.createActionItem).toBe('function');
    expect(typeof result.current.updateActionItem).toBe('function');
    expect(typeof result.current.deleteActionItem).toBe('function');
    expect(typeof result.current.toggleCompletion).toBe('function');
  });
});