import { DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import Sidebar from "@/components/dashboard/Sidebar";
import FilterBar from "@/components/dashboard/FilterBar";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import GrowthSection from "@/components/dashboard/GrowthSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'analytics':
        return <AnalyticsSection />;
      case 'growth':
        return <GrowthSection />;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RevenueChart />
              <SalesPipeline />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 px-6 py-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {activeSection === 'dashboard' ? 'Executive Dashboard' :
                 activeSection === 'analytics' ? 'Analytics Overview' :
                 activeSection === 'growth' ? 'Growth Metrics' :
                 activeSection === 'revenue' ? 'Revenue Analysis' :
                 'Dashboard'}
              </h2>
              <p className="text-muted-foreground">
                {activeSection === 'dashboard' ? 'Your business performance at a glance' :
                 activeSection === 'analytics' ? 'Detailed analytics and insights' :
                 activeSection === 'growth' ? 'Track your growth goals and KPIs' :
                 activeSection === 'revenue' ? 'Revenue trends and pipeline analysis' :
                 'Business insights and metrics'}
              </p>
            </div>

            <FilterBar onFilterChange={() => {}} />
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
