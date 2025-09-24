import { TrendingUp, Target, Zap, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const GrowthSection = () => {
  const goals = [
    { title: "Annual Revenue Target", current: 750000, target: 1000000, unit: "$" },
    { title: "Customer Acquisition", current: 1250, target: 2000, unit: "" },
    { title: "Market Share", current: 12, target: 20, unit: "%" },
    { title: "Product Lines", current: 3, target: 5, unit: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Growth Rate"
          value="23.5%"
          change={{ value: "+5.2% vs last quarter", trend: "up" }}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
        <MetricCard
          title="Market Penetration"
          value="12.3%"
          change={{ value: "+2.1% vs last year", trend: "up" }}
          icon={<Target className="h-5 w-5" />}
          variant="info"
        />
        <MetricCard
          title="Innovation Index"
          value="8.7/10"
          change={{ value: "+0.3 vs last quarter", trend: "up" }}
          icon={<Zap className="h-5 w-5" />}
          variant="warning"
        />
        <MetricCard
          title="Team Growth"
          value="45"
          change={{ value: "+12 new hires", trend: "up" }}
          icon={<Users className="h-5 w-5" />}
          variant="success"
        />
      </div>

      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>2025 Goals Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {goal.unit}{goal.current.toLocaleString()} / {goal.unit}{goal.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthSection;