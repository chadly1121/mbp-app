import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { Company } from '@/types/common';

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  setCurrentCompany: (company: Company | null) => void;
  createCompany: (name: string, slug: string) => Promise<{ data?: Company; error?: any }>;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider = ({ children }: CompanyProviderProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshCompanies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data || []);
      
      // Set first company as current if none selected
      if (data && data.length > 0 && !currentCompany) {
        setCurrentCompany(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading companies",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCompanies();
  }, [user]);

  const createCompany = async (name: string, slug: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            name,
            slug,
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create default chart of accounts for the new company
      const { error: coaError } = await supabase.rpc('create_default_chart_of_accounts', {
        company_id_param: data.id
      });

      if (coaError) {
        // Log error but don't throw - the company was created successfully
        console.error('Error creating default chart of accounts:', coaError);
      }

      await refreshCompanies();
      setCurrentCompany(data);
      
      toast({
        title: "Company created successfully",
        description: `${name} has been created and set as your active company.`,
      });

      return { data };
    } catch (error: any) {
      toast({
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <CompanyContext.Provider value={{
      companies,
      currentCompany,
      loading,
      setCurrentCompany,
      createCompany,
      refreshCompanies,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};