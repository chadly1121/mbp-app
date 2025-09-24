import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketingCampaign {
  id: string;
  campaign_name: string;
  marketing_channel: string;
  status: 'planned' | 'active' | 'completed' | 'paused';
  campaign_start_date?: string;
  campaign_end_date?: string;
  planned_budget?: number;
  actual_spend?: number;
  planned_leads?: number;
  actual_leads?: number;
  conversion_rate?: number;
  roi?: number;
  target_audience?: string;
  notes?: string;
}

export const MarketingPlan = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    marketing_channel: 'digital',
    status: 'planned' as const,
    campaign_start_date: '',
    campaign_end_date: '',
    planned_budget: '',
    planned_leads: '',
    target_audience: '',
    notes: ''
  });

  const marketingChannels = [
    { value: 'digital', label: 'Digital Marketing' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'content', label: 'Content Marketing' },
    { value: 'ppc', label: 'Pay-Per-Click' },
    { value: 'seo', label: 'SEO' },
    { value: 'print', label: 'Print Advertising' },
    { value: 'radio', label: 'Radio' },
    { value: 'tv', label: 'Television' },
    { value: 'events', label: 'Events & Trade Shows' }
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchCampaigns();
    }
  }, [currentCompany]);

  const fetchCampaigns = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('marketing_plan')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('campaign_start_date', { ascending: false });

      if (error) throw error;
      setCampaigns((data as MarketingCampaign[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading marketing campaigns",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!currentCompany || !newCampaign.campaign_name) return;

    try {
      const { error } = await supabase
        .from('marketing_plan')
        .insert([{
          company_id: currentCompany.id,
          campaign_name: newCampaign.campaign_name,
          marketing_channel: newCampaign.marketing_channel,
          status: newCampaign.status,
          campaign_start_date: newCampaign.campaign_start_date || null,
          campaign_end_date: newCampaign.campaign_end_date || null,
          planned_budget: newCampaign.planned_budget ? parseFloat(newCampaign.planned_budget) : null,
          planned_leads: newCampaign.planned_leads ? parseInt(newCampaign.planned_leads) : null,
          target_audience: newCampaign.target_audience,
          notes: newCampaign.notes
        }]);

      if (error) throw error;

      toast({
        title: "Marketing campaign created",
        description: `${newCampaign.campaign_name} has been added to your marketing plan.`,
      });

      setNewCampaign({
        campaign_name: '',
        marketing_channel: 'digital',
        status: 'planned',
        campaign_start_date: '',
        campaign_end_date: '',
        planned_budget: '',
        planned_leads: '',
        target_audience: '',
        notes: ''
      });
      setIsDialogOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error creating marketing campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading marketing campaigns...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Marketing Plan
          </h2>
          <p className="text-muted-foreground">
            Plan and track your marketing campaigns across different channels
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign_name">Campaign Name</Label>
                <Input
                  id="campaign_name"
                  value={newCampaign.campaign_name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, campaign_name: e.target.value })}
                  placeholder="e.g., Q1 Product Launch Campaign"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marketing_channel">Marketing Channel</Label>
                  <Select value={newCampaign.marketing_channel} onValueChange={(value) => setNewCampaign({ ...newCampaign, marketing_channel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {marketingChannels.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newCampaign.status} onValueChange={(value: any) => setNewCampaign({ ...newCampaign, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_start_date">Start Date</Label>
                  <Input
                    id="campaign_start_date"
                    type="date"
                    value={newCampaign.campaign_start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, campaign_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_end_date">End Date</Label>
                  <Input
                    id="campaign_end_date"
                    type="date"
                    value={newCampaign.campaign_end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, campaign_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planned_budget">Planned Budget</Label>
                  <Input
                    id="planned_budget"
                    type="number"
                    value={newCampaign.planned_budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, planned_budget: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="planned_leads">Planned Leads</Label>
                  <Input
                    id="planned_leads"
                    type="number"
                    value={newCampaign.planned_leads}
                    onChange={(e) => setNewCampaign({ ...newCampaign, planned_leads: e.target.value })}
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={newCampaign.target_audience}
                  onChange={(e) => setNewCampaign({ ...newCampaign, target_audience: e.target.value })}
                  placeholder="e.g., Small business owners, 25-45 years old"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newCampaign.notes}
                  onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                  placeholder="Campaign details, objectives, and key messages..."
                />
              </div>
              <Button onClick={createCampaign} className="w-full" disabled={!newCampaign.campaign_name}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-8 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Marketing Campaigns Yet</h4>
          <p className="text-muted-foreground">Start by adding your first marketing campaign to track your promotional efforts.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                    <CardDescription className="capitalize">
                      {campaign.marketing_channel.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  {campaign.campaign_start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Start</div>
                        <div>{new Date(campaign.campaign_start_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {campaign.planned_budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Budget</div>
                        <div>${campaign.planned_budget.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {campaign.planned_leads && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Target Leads</div>
                        <div>{campaign.planned_leads}</div>
                      </div>
                    </div>
                  )}
                  {campaign.roi && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">ROI</div>
                        <div>{campaign.roi}%</div>
                      </div>
                    </div>
                  )}
                </div>
                {campaign.target_audience && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Target Audience</div>
                    <div className="text-sm">{campaign.target_audience}</div>
                  </div>
                )}
                {campaign.notes && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{campaign.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};