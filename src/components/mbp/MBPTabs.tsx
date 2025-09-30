import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { FinancialPlanning } from "./tabs/FinancialPlanning";
import { RevenueForecast } from "./tabs/RevenueForecast";
import { CashFlowPlanning } from "./tabs/CashFlowPlanning";

import { StrategicPlanning } from "./tabs/StrategicPlanning";
import { ActionItems } from "./tabs/ActionItems";
import { MonthlyReview } from "./tabs/MonthlyReview";
import { MarketAnalysis } from "./tabs/MarketAnalysis";
import { SalesPlanning } from "./tabs/SalesPlanning";
import { LeadFunnel } from "./tabs/LeadFunnel";
import { JobPlanner } from "./tabs/JobPlanner";
import { ProductionPlanning } from "./tabs/ProductionPlanning";
import { MarketingPlan } from "./tabs/MarketingPlan";
import { ARTracker } from "./tabs/ARTracker";
import { OrganizationalStructure } from "./tabs/OrganizationalStructure";
import { HabitsTracker } from "./tabs/HabitsTracker";
import { VictoriesWins } from "./tabs/VictoriesWins";
import { ImplementationPlan } from "./tabs/ImplementationPlan";
import { 
  DollarSign, 
  TrendingUp, 
  Banknote, 
  Target, 
  Map,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Factory,
  Megaphone,
  CreditCard,
  Building,
  Activity,
  Trophy,
  Rocket
} from "lucide-react";

export const MBPTabs = () => {
  const isMobile = useIsMobile();

  const tabs = [
    {
      id: "financial",
      label: "Financial Planning",
      icon: DollarSign,
      shortLabel: "Financial"
    },
    {
      id: "revenue",
      label: "Revenue Forecast",
      icon: TrendingUp,
      shortLabel: "Revenue"
    },
    {
      id: "cashflow",
      label: "Cash Flow",
      icon: Banknote,
      shortLabel: "Cash Flow"
    },
    {
      id: "strategic",
      label: "Strategic Planning",
      icon: Map,
      shortLabel: "Strategic"
    },
    {
      id: "market",
      label: "Market Analysis",
      icon: BarChart3,
      shortLabel: "Market"
    },
    {
      id: "actions",
      label: "Action Items",
      icon: CheckSquare,
      shortLabel: "Actions"
    },
    {
      id: "review",
      label: "Monthly Review",
      icon: Calendar,
      shortLabel: "Review"
    },
    {
      id: "sales",
      label: "Sales Planning",
      icon: TrendingUp,
      shortLabel: "Sales"
    },
    {
      id: "leads",
      label: "Lead Funnel",
      icon: Users,
      shortLabel: "Leads"
    },
    {
      id: "jobs",
      label: "Job Planner",
      icon: Calendar,
      shortLabel: "Jobs"
    },
    {
      id: "production",
      label: "Production",
      icon: Factory,
      shortLabel: "Production"
    },
    {
      id: "marketing",
      label: "Marketing",
      icon: Megaphone,
      shortLabel: "Marketing"
    },
    {
      id: "ar",
      label: "AR Tracker",
      icon: CreditCard,
      shortLabel: "AR"
    },
    {
      id: "org",
      label: "Organization",
      icon: Building,
      shortLabel: "Org"
    },
    {
      id: "habits",
      label: "Habits Tracker",
      icon: Activity,
      shortLabel: "Habits"
    },
    {
      id: "victories",
      label: "Victories & Wins",
      icon: Trophy,
      shortLabel: "Victories"
    },
    {
      id: "implementation",
      label: "Implementation",
      icon: Rocket,
      shortLabel: "Implement"
    }
  ];

  return (
    <div className="w-full">
      <Tabs defaultValue="financial" className="w-full">
        <div className="border-b border-border/40 bg-background/95">
          <ScrollArea className="w-full">
            <TabsList className="h-12 w-max bg-transparent p-0 space-x-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative h-12 px-3 md:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs md:text-sm font-medium">
                        {isMobile ? tab.shortLabel : tab.label}
                      </span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="mt-6">
          <TabsContent value="financial" className="mt-0">
            <FinancialPlanning />
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-0">
            <RevenueForecast />
          </TabsContent>
          
          <TabsContent value="cashflow" className="mt-0">
            <CashFlowPlanning />
          </TabsContent>
          
          <TabsContent value="strategic" className="mt-0">
            <StrategicPlanning />
          </TabsContent>
          
          <TabsContent value="market" className="mt-0">
            <MarketAnalysis />
          </TabsContent>
          
          <TabsContent value="actions" className="mt-0">
            <ActionItems />
          </TabsContent>
          
          <TabsContent value="review" className="mt-0">
            <MonthlyReview />
          </TabsContent>
          
          <TabsContent value="sales" className="mt-0">
            <SalesPlanning />
          </TabsContent>
          
          <TabsContent value="leads" className="mt-0">
            <LeadFunnel />
          </TabsContent>
          
          <TabsContent value="jobs" className="mt-0">
            <JobPlanner />
          </TabsContent>
          
          <TabsContent value="production" className="mt-0">
            <ProductionPlanning />
          </TabsContent>
          
          <TabsContent value="marketing" className="mt-0">
            <MarketingPlan />
          </TabsContent>
          
          <TabsContent value="ar" className="mt-0">
            <ARTracker />
          </TabsContent>
          
          <TabsContent value="org" className="mt-0">
            <OrganizationalStructure />
          </TabsContent>
          
          <TabsContent value="habits" className="mt-0">
            <HabitsTracker />
          </TabsContent>
          
          <TabsContent value="victories" className="mt-0">
            <VictoriesWins />
          </TabsContent>
          
          <TabsContent value="implementation" className="mt-0">
            <ImplementationPlan />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};