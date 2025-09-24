import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Calendar, Target, Save } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MBPConfig {
  id?: string;
  fiscal_year: number;
  fiscal_year_start: string;
  tracking_period: 'weekly' | 'monthly';
  file_type: 'mbp' | 'gsr';
  budget_type: string;
  planning_fiscal_year: string;
  insurance_inclusion: string;
}

export const MBPConfiguration = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [config, setConfig] = useState<MBPConfig>({
    fiscal_year: 2025,
    fiscal_year_start: '2025-01-01',
    tracking_period: 'weekly',
    file_type: 'mbp',
    budget_type: 'Budget - 1',
    planning_fiscal_year: 'FY2',
    insurance_inclusion: 'Typical Only'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      fetchConfig();
    }
  }, [currentCompany]);

  const fetchConfig = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('mbp_config')
        .select('*')
        .eq('company_id', currentCompany.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig({
          id: data.id,
          fiscal_year: data.fiscal_year,
          fiscal_year_start: data.fiscal_year_start,
          tracking_period: data.tracking_period as 'weekly' | 'monthly',
          file_type: data.file_type as 'mbp' | 'gsr',
          budget_type: data.budget_type,
          planning_fiscal_year: data.planning_fiscal_year,
          insurance_inclusion: data.insurance_inclusion
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading configuration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!currentCompany) return;

    setSaving(true);
    try {
      const configData = {
        company_id: currentCompany.id,
        ...config
      };
      
      if (config.id) {
        // Update existing config
        const { error } = await supabase
          .from('mbp_config')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('mbp_config')
          .insert([configData])
          .select()
          .single();
        
        if (error) throw error;
        setConfig({ ...config, id: data.id });
      }

      toast({
        title: "Configuration saved",
        description: "Your MBP configuration has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving configuration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading configuration...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            MBP Configuration
          </h2>
          <p className="text-muted-foreground">
            Configure your Master Business Plan settings and preferences
          </p>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Global Setup 2025
            </CardTitle>
            <CardDescription>
              Primary configuration settings for your business plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file_type">File Type</Label>
              <Select value={config.file_type} onValueChange={(value: 'mbp' | 'gsr') => setConfig({ ...config, file_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mbp">MBP (Master Business Plan)</SelectItem>
                  <SelectItem value="gsr">GSR (Goal Setting & Review)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fiscal_year">Fiscal Year</Label>
              <Input
                id="fiscal_year"
                type="number"
                value={config.fiscal_year}
                onChange={(e) => setConfig({ ...config, fiscal_year: Number(e.target.value) })}
                min={2020}
                max={2030}
              />
            </div>

            <div>
              <Label htmlFor="fiscal_year_start">First Day of Fiscal Year</Label>
              <Input
                id="fiscal_year_start"
                type="date"
                value={config.fiscal_year_start}
                onChange={(e) => setConfig({ ...config, fiscal_year_start: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tracking_period">Weekly or Monthly Tracking</Label>
              <Select value={config.tracking_period} onValueChange={(value: 'weekly' | 'monthly') => setConfig({ ...config, tracking_period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tracking period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>
              Additional configuration options for detailed planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budget_type">Budget Type</Label>
              <Select value={config.budget_type} onValueChange={(value) => setConfig({ ...config, budget_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Budget - 1">Budget - 1</SelectItem>
                  <SelectItem value="Budget - 2">Budget - 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="planning_fiscal_year">Planning Fiscal Year</Label>
              <Select value={config.planning_fiscal_year} onValueChange={(value) => setConfig({ ...config, planning_fiscal_year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select planning year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FY1">FY1</SelectItem>
                  <SelectItem value="FY2">FY2</SelectItem>
                  <SelectItem value="FY3">FY3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="insurance_inclusion">Sales Plans Include Insurance</Label>
              <Select value={config.insurance_inclusion} onValueChange={(value) => setConfig({ ...config, insurance_inclusion: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Typical Only">Typical Only</SelectItem>
                  <SelectItem value="All Plans">All Plans</SelectItem>
                  <SelectItem value="No Insurance">No Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration Summary</CardTitle>
          <CardDescription>
            Review your current MBP settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">File Type</div>
              <div className="font-semibold">{config.file_type.toUpperCase()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Fiscal Year</div>
              <div className="font-semibold">{config.fiscal_year}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Tracking</div>
              <div className="font-semibold capitalize">{config.tracking_period}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Budget Type</div>
              <div className="font-semibold">{config.budget_type}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};