import { DollarSign, TrendingUp, Users, ShoppingCart, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import AppSidebar from "@/components/dashboard/Sidebar";
import FilterBar, { DateRangeFilter } from "@/components/dashboard/FilterBar";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import GrowthSection from "@/components/dashboard/GrowthSection";
import CompanySetup from "@/components/company/CompanySetup";
import { MBPTabs } from "@/components/mbp/MBPTabs";
import { QBOIntegration } from "@/components/integrations/QBOIntegration";
import { QBOSyncButton } from "@/components/integrations/QBOSyncButton";
import { StrategicPlanning } from "@/components/mbp/tabs/StrategicPlanning";
import { KPITrackingPage } from "@/components/kpi/KPITrackingPage";
import { GSRDashboard } from "@/components/dashboard/GSRDashboard";
import StrategicPlan from "@/pages/StrategicPlan";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState('strategic');
  const { signOut, user } = useAuth();
  const { currentCompany } = useCompany();
  const isMobile = useIsMobile();
  const [dateFilters, setDateFilters] = useState<DateRangeFilter>({
    dateRange: 'ytd',
    category: 'all'
  });
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalRevenue: 0,
    growthRate: 0,
    activeCustomers: 0,
    conversionRate: 0,
  });

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    
    switch (dateFilters.dateRange) {
      case '7days':
        // Last 7 days - use current month
        return {
          startMonth: currentMonth,
          endMonth: currentMonth,
          year: currentYear,
          startDay: Math.max(1, currentDay - 7),
          endDay: currentDay
        };
      
      case 'thisMonth':
        // Current month only
        return {
          startMonth: currentMonth,
          endMonth: currentMonth,
          year: currentYear,
          startDay: 1,
          endDay: currentDay
        };
      
      case 'lastMonth':
        // Previous month
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        return {
          startMonth: lastMonth,
          endMonth: lastMonth,
          year: lastMonthYear,
          startDay: 1,
          endDay: new Date(lastMonthYear, lastMonth, 0).getDate() // Last day of that month
        };
      
      case 'thisQuarter':
        // Current quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
        const quarterStartMonth = Math.floor((currentMonth - 1) / 3) * 3 + 1;
        return {
          startMonth: quarterStartMonth,
          endMonth: currentMonth,
          year: currentYear,
          startDay: 1,
          endDay: currentDay
        };
      
      case 'thisYear':
        // Full current year
        return {
          startMonth: 1,
          endMonth: 12,
          year: currentYear,
          startDay: 1,
          endDay: 31
        };
      
      case 'ytd':
      default:
        // Year to date
        return {
          startMonth: 1,
          endMonth: currentMonth,
          year: currentYear,
          startDay: 1,
          endDay: currentDay
        };
    }
  };

  // Fetch real dashboard metrics with date filtering
  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchDashboardMetrics = async () => {
      try {
        const dateRange = getDateRange();
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Build query based on date range
        let currentQuery = supabase
          .from('qbo_profit_loss')
          .select('current_month, fiscal_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', dateRange.year)
          .eq('account_type', 'revenue');

        if (dateRange.startMonth && dateRange.endMonth) {
          currentQuery = currentQuery
            .gte('fiscal_month', dateRange.startMonth)
            .lte('fiscal_month', dateRange.endMonth);
        }

        const { data: currentRevData } = await currentQuery;

        // Fetch comparison data (previous period)
        let previousQuery = supabase
          .from('qbo_profit_loss')
          .select('current_month, fiscal_month')
          .eq('company_id', currentCompany.id)
          .eq('fiscal_year', dateRange.year === currentYear ? previousYear : dateRange.year - 1)
          .eq('account_type', 'revenue');

        if (dateRange.startMonth && dateRange.endMonth) {
          previousQuery = previousQuery
            .gte('fiscal_month', dateRange.startMonth)
            .lte('fiscal_month', dateRange.endMonth);
        }

        const { data: previousRevData } = await previousQuery;

        // Fetch customer count
        const { data: customers } = await supabase
          .from('sales_pipeline')
          .select('client_name')
          .eq('company_id', currentCompany.id);

        const currentRevenue = currentRevData?.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0) || 0;
        const previousRevenue = previousRevData?.reduce((sum, item) => sum + Math.abs(item.current_month || 0), 0) || 0;
        const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const uniqueCustomers = [...new Set(customers?.map(c => c.client_name).filter(Boolean))];

        setDashboardMetrics({
          totalRevenue: currentRevenue,
          growthRate,
          activeCustomers: uniqueCustomers.length,
          conversionRate: 3.2,
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      }
    };

    fetchDashboardMetrics();
  }, [currentCompany?.id, dateFilters.dateRange]);

  // Handle collaboration invite acceptance
  useEffect(() => {
    const handleInviteAcceptance = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteId = urlParams.get('invite');
      
      console.log('Checking for invite parameter:', inviteId, 'User:', !!user);
      
      if (inviteId && user) {
        try {
          console.log('Processing invite acceptance for ID:', inviteId);
          
          // Update the collaborator status to 'accepted'
          const { error } = await supabase
            .from('strategic_objective_collaborators')
            .update({ status: 'accepted' })
            .eq('id', inviteId);

          if (error) {
            console.error('Failed to accept invitation:', error);
            toast({
              title: "Invitation Error",
              description: "Failed to accept invitation. The link may be invalid or expired.",
              variant: "destructive"
            });
          } else {
            console.log('Invitation accepted successfully');
            toast({
              title: "Invitation Accepted! 🎉",
              description: "You have successfully joined the collaboration. You can now access the objective.",
            });
            
            // Remove the invite parameter from URL and redirect to strategic planning
            const url = new URL(window.location.href);
            url.searchParams.delete('invite');
            window.history.replaceState({}, '', url.toString());
            setActiveSection('strategic');
          }
        } catch (error) {
          console.error('Error processing invitation:', error);
          toast({
            title: "Invitation Error",
            description: "An error occurred while processing your invitation.",
            variant: "destructive"
          });
        }
      } else if (inviteId && !user) {
        console.log('Invite found but user not logged in - redirecting to auth');
        
        // Store the invite in session storage so it persists after login
        sessionStorage.setItem('pendingInvite', inviteId);
        
        // Show message and redirect to auth
        toast({
          title: "Account Required",
          description: "Please sign in or create an account to accept this collaboration invitation.",
        });
        
        // Redirect to auth page with the invite preserved in session storage
        window.location.href = '/auth';
      }
      
      // Check for pending invite after login
      const pendingInvite = sessionStorage.getItem('pendingInvite');
      if (pendingInvite && user && !inviteId) {
        console.log('Processing pending invite after login:', pendingInvite);
        
        // Clear the pending invite
        sessionStorage.removeItem('pendingInvite');
        
        try {
          // Update the collaborator status to 'accepted'
          const { error } = await supabase
            .from('strategic_objective_collaborators')
            .update({ status: 'accepted' })
            .eq('id', pendingInvite);

          if (error) {
            console.error('Failed to accept pending invitation:', error);
            toast({
              title: "Invitation Error",
              description: "Failed to accept invitation. The link may be invalid or expired.",
              variant: "destructive"
            });
          } else {
            console.log('Pending invitation accepted successfully');
            toast({
              title: "Welcome! Invitation Accepted! 🎉",
              description: "You have successfully joined the collaboration. You can now access the objective.",
            });
            
            setActiveSection('strategic');
          }
        } catch (error) {
          console.error('Error processing pending invitation:', error);
          toast({
            title: "Invitation Error",
            description: "An error occurred while processing your invitation.",
            variant: "destructive"
          });
        }
      }
    };

    handleInviteAcceptance();
  }, [user]);

  const renderContent = () => {
    switch (activeSection) {
      case 'onepage':
        return <StrategicPlan />;
      case 'strategic':
        return <StrategicPlanning />;
      case 'gsr':
        return <GSRDashboard onSectionChange={setActiveSection} />;
      case 'kpis':
        return <KPITrackingPage />;
      case 'mbp':
        return <MBPTabs />;
      case 'analytics':
        return <AnalyticsSection dateFilters={getDateRange()} />;
      case 'growth':
        return <GrowthSection dateFilters={getDateRange()} />;
      case 'integrations':
        return (
          <div className="space-y-6">
            <QBOIntegration />
          </div>
        );
      case 'revenue':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RevenueChart dateFilters={getDateRange()} />
            <SalesPipeline />
          </div>
        );
      default:
        return (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <MetricCard
                title="Total Revenue"
                value={dashboardMetrics.totalRevenue > 0 ? `$${dashboardMetrics.totalRevenue.toLocaleString()}` : "$0"}
                change={{ 
                  value: dashboardMetrics.growthRate > 0 
                    ? `+${dashboardMetrics.growthRate.toFixed(1)}% from last year` 
                    : "No prior year data", 
                  trend: dashboardMetrics.growthRate > 0 ? "up" : "neutral" 
                }}
                icon={<DollarSign className="h-5 w-5" />}
                variant="success"
              />
              <MetricCard
                title="Growth Rate"
                value={`${Math.abs(dashboardMetrics.growthRate).toFixed(1)}%`}
                change={{ 
                  value: dashboardMetrics.growthRate > 0 ? "Year over year growth" : "Year over year", 
                  trend: dashboardMetrics.growthRate > 0 ? "up" : "down" 
                }}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="info"
              />
              <MetricCard
                title="Active Customers"
                value={dashboardMetrics.activeCustomers.toString()}
                change={{ value: "from sales pipeline", trend: "neutral" }}
                icon={<Users className="h-5 w-5" />}
                variant="default"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${dashboardMetrics.conversionRate.toFixed(1)}%`}
                change={{ value: "estimated conversion", trend: "neutral" }}
                icon={<ShoppingCart className="h-5 w-5" />}
                variant="warning"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <RevenueChart dateFilters={getDateRange()} />
              <SalesPipeline />
            </div>
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile/Desktop Header */}
          <header className="h-14 md:h-16 border-b border-border/40 flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="md:hidden" />
              {!isMobile && <CompanySetup />}
            </div>
            
            <div className="flex items-center gap-2">
              {isMobile && <CompanySetup />}
              <Button variant="ghost" size="sm" onClick={signOut} className="text-xs md:text-sm">
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {isMobile ? '' : 'Sign Out'}
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 px-4 md:px-6 py-4 md:py-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              {/* Page Header */}
              <div className="space-y-1 md:space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {activeSection === 'onepage' ? 'One Page Strategic Plan' :
                   activeSection === 'strategic' ? 'Strategic Objectives' :
                   activeSection === 'gsr' ? 'Goal Setting & Review' :
                   activeSection === 'kpis' ? 'KPI Tracking' :
                   activeSection === 'mbp' ? 'Monthly Business Planning' :
                   activeSection === 'dashboard' ? 'Executive Dashboard' :
                   activeSection === 'analytics' ? 'Analytics Overview' :
                   activeSection === 'growth' ? 'Growth Metrics' :
                   activeSection === 'integrations' ? 'Integrations' :
                   activeSection === 'revenue' ? 'Revenue Analysis' :
                   'Dashboard'}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                   {activeSection === 'onepage' ? 'Define your BHAG, values, and long-term strategy' :
                    activeSection === 'strategic' ? 'Define and track your strategic objectives and initiatives' :
                    activeSection === 'gsr' ? 'Set goals, track progress, and conduct regular performance reviews' :
                    activeSection === 'kpis' ? 'Track and monitor key performance indicators' :
                    activeSection === 'mbp' ? 'Track and analyze your monthly business performance by product' :
                    activeSection === 'dashboard' ? 'Your business performance at a glance' :
                    activeSection === 'analytics' ? 'Detailed analytics and insights' :
                    activeSection === 'growth' ? 'Track your growth goals and KPIs' :
                    activeSection === 'integrations' ? 'Connect and sync with external accounting software' :
                    activeSection === 'revenue' ? 'Revenue trends and pipeline analysis' :
                    'Business insights and metrics'}
                </p>
              </div>

              {/* Filter Bar and Sync - Show on pages with QBO data */}
              {!['mbp', 'onepage', 'strategic', 'gsr', 'kpis', 'integrations'].includes(activeSection) && !isMobile && (
                <div className="flex items-center justify-between gap-4">
                  <FilterBar 
                    onFilterChange={setDateFilters} 
                    currentFilters={dateFilters}
                  />
                  <QBOSyncButton 
                    onSyncComplete={() => {
                      // Reload entire page to refresh all QBO data across all components
                      window.location.reload();
                    }} 
                  />
                </div>
              )}
              
              {/* Content */}
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
