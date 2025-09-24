import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, Target, TrendingUp } from "lucide-react";

const pipelineData = [
  {
    stage: "Prospecting",
    deals: 24,
    value: 145000,
    probability: 10,
    color: "bg-muted"
  },
  {
    stage: "Qualification",
    deals: 18,
    value: 125000,
    probability: 25,
    color: "bg-info/20"
  },
  {
    stage: "Proposal",
    deals: 12,
    value: 98000,
    probability: 50,
    color: "bg-warning/20"
  },
  {
    stage: "Negotiation",
    deals: 8,
    value: 78000,
    probability: 75,
    color: "bg-success/20"
  },
  {
    stage: "Closed Won",
    deals: 5,
    value: 52000,
    probability: 100,
    color: "bg-success"
  }
];

const SalesPipeline = () => {
  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);
  
  return (
    <Card className="bg-gradient-card shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Sales Pipeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total pipeline value: ${totalValue.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">+12% this month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipelineData.map((stage, index) => {
          const weightedValue = (stage.value * stage.probability) / 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  <span className="font-medium text-foreground">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{stage.deals}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">${stage.value.toLocaleString()}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stage.probability}%
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Weighted value</span>
                  <span>${weightedValue.toLocaleString()}</span>
                </div>
                <Progress 
                  value={stage.probability} 
                  className="h-2"
                />
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Weighted Pipeline</span>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-bold text-primary">
                ${pipelineData.reduce((sum, stage) => sum + (stage.value * stage.probability) / 100, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesPipeline;