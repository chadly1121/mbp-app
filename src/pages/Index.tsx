import { DollarSign, TrendingUp, Users, ShoppingCart, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import AppSidebar from "@/components/dashboard/Sidebar";
import FilterBar from "@/components/dashboard/FilterBar";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import GrowthSection from "@/components/dashboard/GrowthSection";
import CompanySetup from "@/components/company/CompanySetup";
import { MBPTabs } from "@/components/mbp/MBPTabs";
import { QBOIntegration } from "@/components/integrations/QBOIntegration";
import { StrategicPlanning } from "@/components/mbp/tabs/StrategicPlanning";
import { GSRDashboard } from "@/components/dashboard/GSRDashboard";
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
        console.log('Invite found but user not logged in');
        // User is not logged in, show message
        toast({
          title: "Login Required",
          description: "Please log in to accept this collaboration invitation.",
          variant: "destructive"
        });
      }
    };

    handleInviteAcceptance();
  }, [user]);

  const renderContent = () => {
    switch (activeSection) {
      case 'strategic':
        return <StrategicPlanning />;
      case 'gsr':
        return <GSRDashboard />;
      case 'mbp':
        return <MBPTabs />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'growth':
        return <GrowthSection />;
      case 'integrations':
        return (
          <div className="space-y-6">
            <QBOIntegration />
          </div>
        );
      case 'revenue':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RevenueChart />
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
                value="$847,230"
                change={{ value: "+12.5% from last month", trend: "up" }}
                icon={<DollarSign className="h-5 w-5" />}
                variant="success"
              />
              <MetricCard
                title="Growth Rate"
                value="23.1%"
                change={{ value: "+2.3% from last quarter", trend: "up" }}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="info"
              />
              <MetricCard
                title="Active Customers"
                value="1,234"
                change={{ value: "+89 new this month", trend: "up" }}
                icon={<Users className="h-5 w-5" />}
                variant="default"
              />
              <MetricCard
                title="Conversion Rate"
                value="3.2%"
                change={{ value: "-0.1% from last week", trend: "down" }}
                icon={<ShoppingCart className="h-5 w-5" />}
                variant="warning"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <RevenueChart />
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
                  {activeSection === 'strategic' ? 'Strategic Planning' :
                   activeSection === 'gsr' ? 'Goal Setting & Review' :
                   activeSection === 'mbp' ? 'Monthly Business Planning' :
                   activeSection === 'dashboard' ? 'Executive Dashboard' :
                   activeSection === 'analytics' ? 'Analytics Overview' :
                   activeSection === 'growth' ? 'Growth Metrics' :
                   activeSection === 'integrations' ? 'Integrations' :
                   activeSection === 'revenue' ? 'Revenue Analysis' :
                   'Dashboard'}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {activeSection === 'strategic' ? 'Define and track your strategic objectives and initiatives' :
                   activeSection === 'gsr' ? 'Set goals, track progress, and conduct regular performance reviews' :
                   activeSection === 'mbp' ? 'Track and analyze your monthly business performance by product' :
                   activeSection === 'dashboard' ? 'Your business performance at a glance' :
                   activeSection === 'analytics' ? 'Detailed analytics and insights' :
                   activeSection === 'growth' ? 'Track your growth goals and KPIs' :
                   activeSection === 'integrations' ? 'Connect and sync with external accounting software' :
                   activeSection === 'revenue' ? 'Revenue trends and pipeline analysis' :
                   'Business insights and metrics'}
                </p>
              </div>

              {/* Filter Bar - Hide on mobile for MBP and Strategic sections */}
              {!['mbp', 'strategic', 'gsr'].includes(activeSection) && !isMobile && <FilterBar onFilterChange={() => {}} />}
              
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
