export interface MarketingCampaign {
  id: string;
  campaign_name: string;
  marketing_channel: string;
  status: 'planned' | 'active' | 'completed' | 'paused';
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  planned_budget: number;
  actual_spend: number;
  planned_leads: number;
  actual_leads: number;
  conversion_rate: number;
  roi: number;
  target_audience: string | null;
  notes: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketingCampaignRequest {
  campaign_name: string;
  marketing_channel: string;
  status?: MarketingCampaign['status'];
  campaign_start_date?: string;
  campaign_end_date?: string;
  planned_budget?: number;
  planned_leads?: number;
  target_audience?: string;
  notes?: string;
  company_id: string;
}

export interface UpdateMarketingCampaignRequest {
  campaign_name?: string;
  marketing_channel?: string;
  status?: MarketingCampaign['status'];
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

export interface MarketingStats {
  total: number;
  byStatus: Record<string, number>;
  totalBudget: number;
  totalSpend: number;
  totalLeads: number;
  averageROI: number;
  topChannel: string;
}

export interface MarketingFormData {
  campaign_name: string;
  marketing_channel: string;
  status: MarketingCampaign['status'];
  campaign_start_date: string;
  campaign_end_date: string;
  planned_budget: string;
  planned_leads: string;
  target_audience: string;
  notes: string;
}

export interface MarketingChannel {
  value: string;
  label: string;
}

// Constants
export const MARKETING_CHANNELS: MarketingChannel[] = [
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

export const CAMPAIGN_STATUSES: Array<{ value: MarketingCampaign['status']; label: string }> = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' }
];

// Helper functions
export const calculateMarketingStats = (campaigns: MarketingCampaign[]): MarketingStats => {
  const total = campaigns.length;
  
  const byStatus = campaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.planned_budget || 0), 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.actual_spend || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0);

  const roiCampaigns = campaigns.filter(c => c.roi > 0);
  const averageROI = roiCampaigns.length > 0
    ? Math.round(roiCampaigns.reduce((sum, c) => sum + c.roi, 0) / roiCampaigns.length)
    : 0;

  const channelCounts = campaigns.reduce((acc, campaign) => {
    acc[campaign.marketing_channel] = (acc[campaign.marketing_channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topChannel = Object.entries(channelCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

  return {
    total,
    byStatus,
    totalBudget,
    totalSpend,
    totalLeads,
    averageROI,
    topChannel
  };
};

export const getStatusColor = (status: MarketingCampaign['status']): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};