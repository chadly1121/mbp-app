import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react';

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

  const competitors: CompetitorData[] = [
    {
      name: 'Competitor A',
      marketShare: 35,
      revenue: '$50M',
      strengths: ['Strong brand recognition', 'Large sales team', 'Enterprise focus'],
      threats: ['Price competition', 'Market dominance', 'Feature parity']
    },
    {
      name: 'Competitor B',
      marketShare: 25,
      revenue: '$35M',
      strengths: ['Innovation leader', 'Strong R&D', 'Mobile-first approach'],
      threats: ['Technical superiority', 'Faster releases', 'Developer ecosystem']
    },
    {
      name: 'Competitor C',
      marketShare: 20,
      revenue: '$28M',
      strengths: ['Cost leadership', 'Simple pricing', 'SMB focused'],
      threats: ['Price pressure', 'Market penetration', 'Simplicity advantage']
    }
  ];

  const marketSegments: MarketSegment[] = [
    {
      name: 'Enterprise (1000+ employees)',
      size: '$500M',
      growth: 8.5,
      ourShare: 12,
      potential: 'high'
    },
    {
      name: 'Mid-market (100-999 employees)',
      size: '$200M',
      growth: 15.2,
      ourShare: 18,
      potential: 'high'
    },
    {
      name: 'Small Business (10-99 employees)',
      size: '$150M',
      growth: 22.8,
      ourShare: 25,
      potential: 'medium'
    },
    {
      name: 'Startups (1-9 employees)',
      size: '$50M',
      growth: 35.0,
      ourShare: 8,
      potential: 'medium'
    }
  ];

  const marketTrends: MarketTrend[] = [
    {
      trend: 'AI Integration',
      impact: 'high',
      timeframe: '6-12 months',
      description: 'Increasing demand for AI-powered features and automation',
      opportunity: true
    },
    {
      trend: 'Remote Work Tools',
      impact: 'high',
      timeframe: 'Current',
      description: 'Continued focus on remote collaboration and productivity tools',
      opportunity: true
    },
    {
      trend: 'Privacy Regulations',
      impact: 'medium',
      timeframe: '12-24 months',
      description: 'New data privacy laws affecting product development',
      opportunity: false
    },
    {
      trend: 'Economic Uncertainty',
      impact: 'high',
      timeframe: 'Current',
      description: 'Budget constraints leading to longer sales cycles',
      opportunity: false
    },
    {
      trend: 'API-First Architecture',
      impact: 'medium',
      timeframe: '6-18 months',
      description: 'Growing demand for integration-friendly solutions',
      opportunity: true
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

  const ourMarketShare = marketSegments.reduce((total, segment) => {
    const segmentValue = parseFloat(segment.size.replace('$', '').replace('M', ''));
    return total + (segmentValue * segment.ourShare / 100);
  }, 0);

  const overallMarketShare = (ourMarketShare / totalMarketSize) * 100;

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
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="mid-market">Mid-market</SelectItem>
              <SelectItem value="smb">Small Business</SelectItem>
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
            <div className="text-2xl font-bold">{overallMarketShare.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">${ourMarketShare.toFixed(1)}M revenue</div>
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
            <div className="text-2xl font-bold text-green-600">14.2%</div>
            <div className="text-xs text-muted-foreground">Weighted average CAGR</div>
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