import { DollarSign, TrendingUp, Users, Target, PieChart, BarChart3 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import SalesPipeline from "@/components/dashboard/SalesPipeline";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Executive Dashboard</h2>
          <p className="text-muted-foreground">Master Business Plan 2025 - Real-time insights and performance metrics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Current Year Revenue"
            value="$432,327"
            change={{ value: "+18.2% vs last year", trend: "up" }}
            icon={<DollarSign className="h-6 w-6" />}
            variant="success"
          />
          
          <MetricCard
            title="Gross Profit"
            value="$165,838"
            change={{ value: "+12.5% vs target", trend: "up" }}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="info"
          />
          
          <MetricCard
            title="Net Profit"
            value="-$19,707"
            change={{ value: "Improvement needed", trend: "down" }}
            icon={<BarChart3 className="h-6 w-6" />}
            variant="warning"
          />
          
          <MetricCard
            title="Active Projects"
            value="24"
            change={{ value: "+3 this week", trend: "up" }}
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <SalesPipeline />
        </div>

        {/* Business Planning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-card rounded-lg border border-border p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Strategic Planning</h3>
                <p className="text-sm text-muted-foreground">Goals & objectives</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Q1 Objectives</span>
                <span className="font-medium text-success">8/10 Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-success h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg border border-border p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <PieChart className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Budget Tracking</h3>
                <p className="text-sm text-muted-foreground">Financial planning</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget vs Actual</span>
                <span className="font-medium text-warning">92% Utilized</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg border border-border p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">KPI Dashboard</h3>
                <p className="text-sm text-muted-foreground">Performance metrics</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Key Metrics</span>
                <span className="font-medium text-success">On Track</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-success h-2 rounded-full"></div>
                <div className="flex-1 bg-success h-2 rounded-full"></div>
                <div className="flex-1 bg-warning h-2 rounded-full"></div>
                <div className="flex-1 bg-muted h-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
