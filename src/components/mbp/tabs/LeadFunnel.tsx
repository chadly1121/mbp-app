import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Filter, Plus, Users, TrendingDown, Percent, DollarSign } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadStage {
  id: string;
  stage_name: string;
  stage_order: number;
  leads_count: number;
  conversion_rate: number;
  average_value: number;
  year: number;
  month_number: number;
  notes?: string;
}

export const LeadFunnel = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [leadStages, setLeadStages] = useState<LeadStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStage, setNewStage] = useState({
    stage_name: '',
    stage_order: 1,
    leads_count: 0,
    conversion_rate: 0,
    average_value: 0,
    notes: ''
  });

  useEffect(() => {
    if (currentCompany) {
      fetchLeadStages();
    }
  }, [currentCompany]);

  const fetchLeadStages = async () => {
    if (!currentCompany) return;

    try {
      const currentDate = new Date();
      const { data, error } = await supabase
        .from('lead_funnel')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('year', currentDate.getFullYear())
        .eq('month_number', currentDate.getMonth() + 1)
        .order('stage_order', { ascending: true });

      if (error) throw error;
      setLeadStages((data as LeadStage[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading lead funnel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLeadStage = async () => {
    if (!currentCompany || !newStage.stage_name) return;

    try {
      const currentDate = new Date();
      const stageData = {
        company_id: currentCompany.id,
        stage_name: newStage.stage_name,
        stage_order: newStage.stage_order,
        leads_count: newStage.leads_count,
        conversion_rate: newStage.conversion_rate,
        average_value: newStage.average_value,
        year: currentDate.getFullYear(),
        month_number: currentDate.getMonth() + 1,
        notes: newStage.notes
      };

      const { error } = await supabase
        .from('lead_funnel')
        .insert([stageData]);

      if (error) throw error;

      toast({
        title: "Lead stage created",
        description: `${newStage.stage_name} has been added to your lead funnel.`,
      });

      setNewStage({
        stage_name: '',
        stage_order: Math.max(...leadStages.map(s => s.stage_order), 0) + 1,
        leads_count: 0,
        conversion_rate: 0,
        average_value: 0,
        notes: ''
      });
      setIsDialogOpen(false);
      fetchLeadStages();
    } catch (error: any) {
      toast({
        title: "Error creating lead stage",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTotalLeads = () => leadStages.reduce((sum, stage) => sum + stage.leads_count, 0);
  const getAverageConversion = () => {
    if (leadStages.length === 0) return 0;
    return leadStages.reduce((sum, stage) => sum + stage.conversion_rate, 0) / leadStages.length;
  };
  const getTotalValue = () => leadStages.reduce((sum, stage) => sum + (stage.leads_count * stage.average_value), 0);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading lead funnel...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Filter className="h-6 w-6" />
            Lead Funnel
          </h2>
          <p className="text-muted-foreground">
            Track your lead progression through each stage of your sales process
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Lead Funnel Stage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage_name">Stage Name</Label>
                <Input
                  id="stage_name"
                  value={newStage.stage_name}
                  onChange={(e) => setNewStage({ ...newStage, stage_name: e.target.value })}
                  placeholder="e.g., Lead, Qualified, Proposal, Negotiation"
                />
              </div>

              <div>
                <Label htmlFor="stage_order">Stage Order</Label>
                <Input
                  id="stage_order"
                  type="number"
                  value={newStage.stage_order}
                  onChange={(e) => setNewStage({ ...newStage, stage_order: Number(e.target.value) })}
                  min={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leads_count">Current Leads</Label>
                  <Input
                    id="leads_count"
                    type="number"
                    value={newStage.leads_count}
                    onChange={(e) => setNewStage({ ...newStage, leads_count: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
                  <Input
                    id="conversion_rate"
                    type="number"
                    value={newStage.conversion_rate}
                    onChange={(e) => setNewStage({ ...newStage, conversion_rate: Number(e.target.value) })}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="average_value">Average Deal Value ($)</Label>
                <Input
                  id="average_value"
                  type="number"
                  value={newStage.average_value}
                  onChange={(e) => setNewStage({ ...newStage, average_value: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newStage.notes}
                  onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                  placeholder="Additional notes about this stage"
                />
              </div>

              <Button onClick={createLeadStage} className="w-full" disabled={!newStage.stage_name}>
                Add Stage
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalLeads()}</div>
            <p className="text-xs text-muted-foreground">In funnel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Funnel Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStages.length}</div>
            <p className="text-xs text-muted-foreground">Active stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              Avg Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getAverageConversion().toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${getTotalValue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pipeline value</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Visualization</CardTitle>
          <CardDescription>
            Visual representation of your lead progression through each stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadStages.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-semibold mb-2">No Funnel Stages</h4>
              <p className="text-muted-foreground mb-4">Create your first funnel stage to start tracking lead progression.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leadStages.map((stage, index) => {
                const maxLeads = Math.max(...leadStages.map(s => s.leads_count));
                const widthPercentage = maxLeads > 0 ? (stage.leads_count / maxLeads) * 100 : 0;
                
                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stage.stage_order}</Badge>
                        <h4 className="font-semibold">{stage.stage_name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">{stage.leads_count} leads</span>
                        <span className="text-muted-foreground">{stage.conversion_rate}% conversion</span>
                        <span className="text-green-600">${stage.average_value.toLocaleString()} avg</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8 flex items-center justify-center overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-center"
                          style={{ width: `${widthPercentage}%`, minWidth: widthPercentage > 0 ? '60px' : '0px' }}
                        >
                          {stage.leads_count > 0 && (
                            <span className="text-white text-sm font-medium px-2">
                              {stage.leads_count}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-0 h-0 border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                      </div>
                    </div>
                    
                    {stage.notes && (
                      <p className="text-sm text-muted-foreground ml-8">{stage.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Analysis</CardTitle>
          <CardDescription>
            Analyze conversion rates between funnel stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadStages.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadStages.slice(0, -1).map((stage, index) => {
                const nextStage = leadStages[index + 1];
                const dropoffRate = stage.leads_count > 0 
                  ? ((stage.leads_count - nextStage.leads_count) / stage.leads_count) * 100
                  : 0;
                
                return (
                  <div key={`conversion-${stage.id}`} className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {stage.stage_name} → {nextStage.stage_name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{dropoffRate.toFixed(1)}%</span>
                      <span className="text-sm text-muted-foreground">drop-off</span>
                    </div>
                    <Progress value={100 - dropoffRate} className="mt-2 h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">Add more stages to see conversion analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};