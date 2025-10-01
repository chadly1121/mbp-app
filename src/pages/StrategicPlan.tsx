import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStrategicPlan } from '@/hooks/useStrategicPlan';
import { Loader2, Plus, Save, Target, TrendingUp, Calendar } from 'lucide-react';
import { CompanyValue } from '@/types/strategicPlan';

export default function StrategicPlan() {
  const {
    longTermStrategy,
    annualGoals,
    quarterlyGoals,
    loading,
    saving,
    saveLongTerm,
    createAnnualGoals,
    updateAnnualGoals,
    createQuarterlyGoals,
    updateQuarterlyGoals,
  } = useStrategicPlan();

  const [vision, setVision] = useState('');
  const [revenueGoal, setRevenueGoal] = useState('');
  const [gpPercent, setGpPercent] = useState('');
  const [npPercent, setNpPercent] = useState('');
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [tactics, setTactics] = useState<string[]>([]);

  // Update state when data is loaded
  useEffect(() => {
    if (longTermStrategy) {
      setVision(longTermStrategy.long_term_vision || '');
      setRevenueGoal(longTermStrategy.three_year_revenue_goal?.toString() || '');
      setGpPercent(longTermStrategy.three_year_gp_percent?.toString() || '');
      setNpPercent(longTermStrategy.three_year_np_percent?.toString() || '');
      setValues(longTermStrategy.values_json || []);
      setTactics(longTermStrategy.tactics_json || []);
    }
  }, [longTermStrategy]);

  const handleSaveFoundation = () => {
    saveLongTerm({
      long_term_vision: vision,
      three_year_revenue_goal: revenueGoal ? Number(revenueGoal) : null,
      three_year_gp_percent: gpPercent ? Number(gpPercent) : null,
      three_year_np_percent: npPercent ? Number(npPercent) : null,
      values_json: values,
      tactics_json: tactics,
    });
  };

  const addValue = () => {
    setValues([...values, { name: '', description: '' }]);
  };

  const updateValue = (index: number, field: 'name' | 'description', value: string) => {
    const newValues = [...values];
    newValues[index][field] = value;
    setValues(newValues);
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const addTactic = () => {
    setTactics([...tactics, '']);
  };

  const updateTactic = (index: number, value: string) => {
    const newTactics = [...tactics];
    newTactics[index] = value;
    setTactics(newTactics);
  };

  const removeTactic = (index: number) => {
    setTactics(tactics.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">One Page Strategic Plan</h1>
          <p className="text-muted-foreground">Define your BHAG and long-term strategy</p>
        </div>
      </div>

      <Tabs defaultValue="foundation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="foundation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Foundation & BHAG
          </TabsTrigger>
          <TabsTrigger value="annual" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Annual Goals
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quarterly Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="foundation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foundation: Long-Term Vision & BHAG</CardTitle>
              <CardDescription>
                Define why you run your business and your 3-year vision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vision">Long-Term Vision (3 Years Out)</Label>
                <Textarea
                  id="vision"
                  placeholder="Why do you run your business? What's your 3-year vision?"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue Goal ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="4000000"
                    value={revenueGoal}
                    onChange={(e) => setRevenueGoal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gp">Gross Profit %</Label>
                  <Input
                    id="gp"
                    type="number"
                    placeholder="50"
                    value={gpPercent}
                    onChange={(e) => setGpPercent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="np">Net Profit %</Label>
                  <Input
                    id="np"
                    type="number"
                    placeholder="15"
                    value={npPercent}
                    onChange={(e) => setNpPercent(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Company Values</Label>
                  <Button onClick={addValue} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
                {values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Value name (e.g., Honest)"
                      value={value.name}
                      onChange={(e) => updateValue(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={value.description}
                      onChange={(e) => updateValue(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeValue(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tactics to Integrate Values</Label>
                  <Button onClick={addTactic} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tactic
                  </Button>
                </div>
                {tactics.map((tactic, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Post in office and shop. Daily reminders..."
                      value={tactic}
                      onChange={(e) => updateTactic(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeTactic(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveFoundation} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Foundation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Annual Strategic Goals</CardTitle>
              <CardDescription>
                Set your goals for the current fiscal year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Annual goals section coming soon. Define sales, revenue, financial, people goals, 
                critical focus areas, and implementation items for the year.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Strategic Goals</CardTitle>
              <CardDescription>
                Break down your annual goals into quarterly targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quarterly goals section coming soon. Define goals for Q1, Q2, Q3, and Q4 with 
                results analysis for each quarter.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
