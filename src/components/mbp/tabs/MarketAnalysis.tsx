import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRevenueData } from '@/hooks/useRevenueData';

interface CompetitorData {
  name: string;
  marketShare: number;
  revenue: string;
  strengths: string[];
  threats: string[];
}

interface MarketSegment {
  name: string;
  size: string;
  growth: number;
  ourShare: number;
  potential: 'high' | 'medium' | 'low';
}

interface MarketTrend {
  trend: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  description: string;
  opportunity: boolean;
}

export const MarketAnalysis = () => {
  const [selectedMarket, setSelectedMarket] = useState('overall');
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueData(2025);

  const competitors: CompetitorData[] = [
    {
      name: 'Pro Painters Muskoka (Bracebridge)',
      marketShare: 4.5,
      revenue: '$1.5M-$3.0M',
      strengths: ['20+ employees', '1,100+ projects completed', 'Broad service mix', 'Capacity and speed'],
      threats: ['Large team capacity', 'Price flexibility', 'Fast project turnaround']
    },
    {
      name: 'WOW 1 DAY PAINTING – Muskoka',
      marketShare: 2,
      revenue: '$0.6M-$1.6M',
      strengths: ['National brand recognition', 'Heavy marketing presence', 'One-day service promise'],
      threats: ['Strong lead capture', 'Brand trust', 'Speed advantage']
    },
    {
      name: 'Northwood Painting Huntsville',
      marketShare: 1.5,
      revenue: '$0.5M-$1.0M',
      strengths: ['Strong review volume', 'Interior/exterior expertise', 'Staining services', 'Huntsville market presence'],
      threats: ['Reputation in Huntsville core', 'Customer loyalty', 'Review ratings']
    },
    {
      name: 'Royal Muskoka Painting',
      marketShare: 1.15,
      revenue: '$0.4M-$0.8M',
      strengths: ['Multi-town regional coverage', 'Interior and exterior services', 'Wide service area'],
      threats: ['Geographic reach', 'Competitive quoting', 'Regional presence']
    },
    {
      name: 'Great White Painting Co.',
      marketShare: 0.85,
      revenue: '$0.3M-$0.7M',
      strengths: ['Local brand identity', 'Curated portfolio', 'Cottage exterior focus'],
      threats: ['Cottage market competition', 'Portfolio quality', 'Niche specialization']
    }
  ];

  // Calculate actual market share based on 2025 revenue
  const actualRevenue = (revenueData?.totalRevenue || 0) / 1000000; // Convert to millions
  
  const marketSegments: MarketSegment[] = useMemo(() => {
    const segments = [
      { name: 'Commercial / Enterprise', size: 11.5, growth: 1, potential: 'medium' as const },
      { name: 'Residential - Year-round', size: 16.9, growth: 3, potential: 'high' as const },
      { name: 'Residential - Seasonal/Cottage', size: 37.3, growth: 3, potential: 'high' as const },
      { name: 'New Construction', size: 3.0, growth: 2, potential: 'medium' as const }
    ];

    const totalMarket = segments.reduce((sum, s) => sum + s.size, 0);
    
    return segments.map(segment => ({
      ...segment,
      size: `$${segment.size}M`,
      // Calculate proportional share based on segment size
      ourShare: actualRevenue > 0 ? 
        Number(((actualRevenue / totalMarket) * 100).toFixed(1)) : 0
    }));
  }, [actualRevenue]);

  const marketTrends: MarketTrend[] = [
    {
      trend: 'Low/Zero-VOC Coatings & Federal Regulations',
      impact: 'high',
      timeframe: 'Now - 24 months',
      description: 'Canada enforcing stricter VOC limits for coatings. Opportunity to upsell compliant systems and market IAQ benefits.',
      opportunity: true
    },
    {
      trend: 'Skilled Labour Shortage & Wage Pressure',
      impact: 'high',
      timeframe: '6-24 months',
      description: 'Persistent trades shortages across Ontario. Provides pricing power if capacity is reliable; need retention systems.',
      opportunity: true
    },
    {
      trend: 'STR Licensing Requirements',
      impact: 'high',
      timeframe: 'Now - 12 months',
      description: 'Huntsville and Muskoka Lakes require STR licenses. Owners upgrading paint for inspections and guest standards.',
      opportunity: true
    },
    {
      trend: 'Aging & Seasonal Housing Stock',
      impact: 'high',
      timeframe: 'Now - 24 months',
      description: 'Large seasonal base and older dwellings increase repaint frequency. Focus on exterior stain/paint programs and wood restoration.',
      opportunity: true
    },
    {
      trend: 'Digital Lead Generation Consolidation',
      impact: 'medium',
      timeframe: 'Now - 12 months',
      description: 'Branded players and aggregators crowding Google LSA and maps. Must differentiate on niche offers, reviews, and fast quoting.',
      opportunity: false
    },
    {
      trend: 'Input Cost Volatility',
      impact: 'medium',
      timeframe: '6-18 months',
      description: 'RRPI remains elevated vs pre-2020; coatings and sundries volatility. Need indexed quotes and escalation clauses.',
      opportunity: false
    }
  ];

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalMarketSize = marketSegments.reduce((sum, segment) => {
    return sum + parseFloat(segment.size.replace('$', '').replace('M', ''));
  }, 0);

  // Calculate market share directly: (Our Revenue / Total Market) * 100
  const overallMarketShare = actualRevenue > 0 ? (actualRevenue / totalMarketSize) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Market Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Competitive landscape, market trends, and growth opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Market</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="seasonal">Seasonal/Cottage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Update Analysis
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Market Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMarketSize}M</div>
            <div className="text-xs text-muted-foreground">Total Addressable Market</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Our Market Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingRevenue ? '...' : `${overallMarketShare.toFixed(3)}%`}
            </div>
            <div className="text-xs text-muted-foreground">
              ${actualRevenue.toFixed(2)}M actual revenue (2025)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2-4%</div>
            <div className="text-xs text-muted-foreground">Market CAGR (2025-2027)</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Key Competitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
            <div className="text-xs text-muted-foreground">Main competitors tracked</div>
          </CardContent>
        </Card>
      </div>

      {/* Market Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Segments Analysis
          </CardTitle>
          <CardDescription>
            Breakdown by customer segment size and growth potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketSegments.map((segment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{segment.name}</h4>
                    <p className="text-sm text-muted-foreground">Market size: {segment.size}</p>
                  </div>
                  <Badge variant="outline" className={`${getPotentialColor(segment.potential)}`}>
                    {segment.potential} potential
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="text-lg font-semibold text-green-600">+{segment.growth}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Our Share</div>
                    <div className="text-lg font-semibold">{segment.ourShare}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Share Progress</div>
                    <Progress value={segment.ourShare} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Landscape</CardTitle>
          <CardDescription>
            Key competitors and their market position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{competitor.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Market Share: {competitor.marketShare}%</span>
                      <span>Revenue: {competitor.revenue}</span>
                    </div>
                  </div>
                  <Progress value={competitor.marketShare} className="w-24 h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-2">Strengths</div>
                    <div className="space-y-1">
                      {competitor.strengths.map((strength, idx) => (
                        <div key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          {strength}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-2">Threats to Us</div>
                    <div className="space-y-1">
                      {competitor.threats.map((threat, idx) => (
                        <div key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          {threat}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends & Opportunities</CardTitle>
          <CardDescription>
            Key trends affecting the market and their potential impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketTrends.map((trend, index) => {
              const Icon = trend.opportunity ? CheckCircle : AlertTriangle;
              const trendColor = trend.opportunity ? 'text-green-600' : 'text-yellow-600';
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${trendColor}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{trend.trend}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{trend.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`${getImpactColor(trend.impact)} mb-1`}>
                            {trend.impact} impact
                          </Badge>
                          <div className="text-xs text-muted-foreground">{trend.timeframe}</div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={trend.opportunity ? 
                          'text-green-600 bg-green-50 border-green-200' : 
                          'text-yellow-600 bg-yellow-50 border-yellow-200'
                        }
                      >
                        {trend.opportunity ? 'Opportunity' : 'Challenge'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};