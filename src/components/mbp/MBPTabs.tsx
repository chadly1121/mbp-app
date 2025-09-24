import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { FinancialPlanning } from "./tabs/FinancialPlanning";
import { RevenueForecast } from "./tabs/RevenueForecast";
import { CashFlowPlanning } from "./tabs/CashFlowPlanning";
import { KPITracking } from "./tabs/KPITracking";
import { StrategicPlanning } from "./tabs/StrategicPlanning";
import { ActionItems } from "./tabs/ActionItems";
import { MonthlyReview } from "./tabs/MonthlyReview";
import { MarketAnalysis } from "./tabs/MarketAnalysis";
import { 
  DollarSign, 
  TrendingUp, 
  Banknote, 
  Target, 
  Map,
  CheckSquare,
  Calendar,
  BarChart3
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
      id: "kpis",
      label: "KPI Tracking",
      icon: Target,
      shortLabel: "KPIs"
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
          
          <TabsContent value="kpis" className="mt-0">
            <KPITracking />
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
        </div>
      </Tabs>
    </div>
  );
};