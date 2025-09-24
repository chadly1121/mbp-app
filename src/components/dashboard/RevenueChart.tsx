import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', current: 65000, previous: 58000, target: 70000 },
  { month: 'Feb', current: 72000, previous: 62000, target: 75000 },
  { month: 'Mar', current: 68000, previous: 59000, target: 72000 },
  { month: 'Apr', current: 78000, previous: 65000, target: 80000 },
  { month: 'May', current: 85000, previous: 70000, target: 85000 },
  { month: 'Jun', current: 92000, previous: 75000, target: 90000 },
  { month: 'Jul', current: 88000, previous: 72000, target: 88000 },
  { month: 'Aug', current: 95000, previous: 78000, target: 95000 },
  { month: 'Sep', current: 87000, previous: 74000, target: 90000 },
  { month: 'Oct', current: 93000, previous: 79000, target: 95000 },
  { month: 'Nov', current: 89000, previous: 76000, target: 92000 },
  { month: 'Dec', current: 96000, previous: 82000, target: 98000 },
];

const RevenueChart = () => {
  return (
    <Card className="bg-gradient-card shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Monthly revenue comparison and targets</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: ${(entry.value as number).toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                name="Current Year"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 3 }}
                name="Previous Year"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;