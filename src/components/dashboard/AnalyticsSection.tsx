import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pieData = [
  { name: 'Digital Products', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Consulting', value: 30, color: 'hsl(var(--success))' },
  { name: 'Courses', value: 15, color: 'hsl(var(--warning))' },
  { name: 'Other', value: 10, color: 'hsl(var(--info))' },
];

const barData = [
  { month: 'Jan', organic: 4000, paid: 2400, social: 1200 },
  { month: 'Feb', organic: 3000, paid: 1398, social: 1800 },
  { month: 'Mar', organic: 2000, paid: 9800, social: 2200 },
  { month: 'Apr', organic: 2780, paid: 3908, social: 1600 },
  { month: 'May', organic: 1890, paid: 4800, social: 2000 },
  { month: 'Jun', organic: 2390, paid: 3800, social: 1900 },
];

const AnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="organic" fill="hsl(var(--primary))" name="Organic" />
                <Bar dataKey="paid" fill="hsl(var(--success))" name="Paid" />
                <Bar dataKey="social" fill="hsl(var(--warning))" name="Social" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;