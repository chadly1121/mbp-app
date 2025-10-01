import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStrategicPlan } from '@/hooks/useStrategicPlan';
import { Loader2, Plus, Save, Target, TrendingUp, Calendar, Trash2, Edit } from 'lucide-react';
import { CompanyValue, AnnualStrategicGoals, QuarterlyStrategicGoals } from '@/types/strategicPlan';
import { toast } from 'sonner';

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
  
  // Annual goals state
  const [editingAnnual, setEditingAnnual] = useState<string | null>(null);
  const [showAnnualForm, setShowAnnualForm] = useState(false);
  const [annualForm, setAnnualForm] = useState({
    fiscal_year: new Date().getFullYear(),
    sales_goal: '',
    revenue_goal: '',
    financial_goal: '',
    people_goal: '',
    critical_focus: '',
    implementation_items: ['']
  });

  // Quarterly goals state
  const [editingQuarterly, setEditingQuarterly] = useState<string | null>(null);
  const [showQuarterlyForm, setShowQuarterlyForm] = useState(false);
  const [quarterlyForm, setQuarterlyForm] = useState({
    year: new Date().getFullYear(),
    quarter: 1,
    sales_goal: '',
    revenue_goal: '',
    financial_goal: '',
    people_goal: '',
    critical_focus: '',
    implementation_items: [''],
    results_analysis: ''
  });

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

  // Annual goals functions
  const handleSaveAnnual = () => {
    const data = {
      fiscal_year: annualForm.fiscal_year,
      sales_goal: annualForm.sales_goal ? Number(annualForm.sales_goal) : undefined,
      revenue_goal: annualForm.revenue_goal ? Number(annualForm.revenue_goal) : undefined,
      financial_goal: annualForm.financial_goal || undefined,
      people_goal: annualForm.people_goal || undefined,
      critical_focus: annualForm.critical_focus || undefined,
      implementation_items_json: annualForm.implementation_items.filter(item => item.trim() !== '')
    };

    if (editingAnnual) {
      updateAnnualGoals({ id: editingAnnual, data });
    } else {
      createAnnualGoals(data);
    }
    
    setShowAnnualForm(false);
    setEditingAnnual(null);
    resetAnnualForm();
  };

  const resetAnnualForm = () => {
    setAnnualForm({
      fiscal_year: new Date().getFullYear(),
      sales_goal: '',
      revenue_goal: '',
      financial_goal: '',
      people_goal: '',
      critical_focus: '',
      implementation_items: ['']
    });
  };

  const editAnnual = (goal: AnnualStrategicGoals) => {
    setEditingAnnual(goal.id);
    setAnnualForm({
      fiscal_year: goal.fiscal_year,
      sales_goal: goal.sales_goal?.toString() || '',
      revenue_goal: goal.revenue_goal?.toString() || '',
      financial_goal: goal.financial_goal || '',
      people_goal: goal.people_goal || '',
      critical_focus: goal.critical_focus || '',
      implementation_items: goal.implementation_items_json.length > 0 ? goal.implementation_items_json : ['']
    });
    setShowAnnualForm(true);
  };

  const addAnnualImplementationItem = () => {
    setAnnualForm(prev => ({
      ...prev,
      implementation_items: [...prev.implementation_items, '']
    }));
  };

  const updateAnnualImplementationItem = (index: number, value: string) => {
    setAnnualForm(prev => ({
      ...prev,
      implementation_items: prev.implementation_items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeAnnualImplementationItem = (index: number) => {
    setAnnualForm(prev => ({
      ...prev,
      implementation_items: prev.implementation_items.filter((_, i) => i !== index)
    }));
  };

  // Quarterly goals functions
  const handleSaveQuarterly = () => {
    const data = {
      year: quarterlyForm.year,
      quarter: quarterlyForm.quarter,
      sales_goal: quarterlyForm.sales_goal ? Number(quarterlyForm.sales_goal) : undefined,
      revenue_goal: quarterlyForm.revenue_goal ? Number(quarterlyForm.revenue_goal) : undefined,
      financial_goal: quarterlyForm.financial_goal || undefined,
      people_goal: quarterlyForm.people_goal || undefined,
      critical_focus: quarterlyForm.critical_focus || undefined,
      implementation_items_json: quarterlyForm.implementation_items.filter(item => item.trim() !== ''),
      results_analysis: quarterlyForm.results_analysis || undefined
    };

    if (editingQuarterly) {
      updateQuarterlyGoals({ id: editingQuarterly, data });
    } else {
      createQuarterlyGoals(data);
    }
    
    setShowQuarterlyForm(false);
    setEditingQuarterly(null);
    resetQuarterlyForm();
  };

  const resetQuarterlyForm = () => {
    setQuarterlyForm({
      year: new Date().getFullYear(),
      quarter: 1,
      sales_goal: '',
      revenue_goal: '',
      financial_goal: '',
      people_goal: '',
      critical_focus: '',
      implementation_items: [''],
      results_analysis: ''
    });
  };

  const editQuarterly = (goal: QuarterlyStrategicGoals) => {
    setEditingQuarterly(goal.id);
    setQuarterlyForm({
      year: goal.year,
      quarter: goal.quarter,
      sales_goal: goal.sales_goal?.toString() || '',
      revenue_goal: goal.revenue_goal?.toString() || '',
      financial_goal: goal.financial_goal || '',
      people_goal: goal.people_goal || '',
      critical_focus: goal.critical_focus || '',
      implementation_items: goal.implementation_items_json.length > 0 ? goal.implementation_items_json : [''],
      results_analysis: goal.results_analysis || ''
    });
    setShowQuarterlyForm(true);
  };

  const addQuarterlyImplementationItem = () => {
    setQuarterlyForm(prev => ({
      ...prev,
      implementation_items: [...prev.implementation_items, '']
    }));
  };

  const updateQuarterlyImplementationItem = (index: number, value: string) => {
    setQuarterlyForm(prev => ({
      ...prev,
      implementation_items: prev.implementation_items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeQuarterlyImplementationItem = (index: number) => {
    setQuarterlyForm(prev => ({
      ...prev,
      implementation_items: prev.implementation_items.filter((_, i) => i !== index)
    }));
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
                  <div key={index} className="flex gap-2 items-start">
                    <Textarea
                      placeholder="Post in office and shop. Daily reminders..."
                      value={tactic}
                      onChange={(e) => updateTactic(index, e.target.value)}
                      className="flex-1 min-h-[60px] resize-y"
                      rows={2}
                    />
                    <Button
                      onClick={() => removeTactic(index)}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Annual Strategic Goals</h2>
              <p className="text-muted-foreground">Set goals for each fiscal year</p>
            </div>
            <Button onClick={() => { resetAnnualForm(); setShowAnnualForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Annual Goals
            </Button>
          </div>

          {showAnnualForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingAnnual ? 'Edit' : 'Add'} Annual Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="annual-fiscal-year">Fiscal Year</Label>
                  <Input
                    id="annual-fiscal-year"
                    type="number"
                    value={annualForm.fiscal_year}
                    onChange={(e) => setAnnualForm(prev => ({ ...prev, fiscal_year: Number(e.target.value) }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual-sales">Sales Goal ($)</Label>
                    <Input
                      id="annual-sales"
                      type="number"
                      placeholder="1000000"
                      value={annualForm.sales_goal}
                      onChange={(e) => setAnnualForm(prev => ({ ...prev, sales_goal: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annual-revenue">Revenue Goal ($)</Label>
                    <Input
                      id="annual-revenue"
                      type="number"
                      placeholder="1200000"
                      value={annualForm.revenue_goal}
                      onChange={(e) => setAnnualForm(prev => ({ ...prev, revenue_goal: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual-financial">Financial Goal</Label>
                  <Textarea
                    id="annual-financial"
                    placeholder="Increase profit margin by 5%"
                    value={annualForm.financial_goal}
                    onChange={(e) => setAnnualForm(prev => ({ ...prev, financial_goal: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual-people">People Goal</Label>
                  <Textarea
                    id="annual-people"
                    placeholder="Hire 3 new team members"
                    value={annualForm.people_goal}
                    onChange={(e) => setAnnualForm(prev => ({ ...prev, people_goal: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual-critical">Critical Focus</Label>
                  <Textarea
                    id="annual-critical"
                    placeholder="Expand to new markets"
                    value={annualForm.critical_focus}
                    onChange={(e) => setAnnualForm(prev => ({ ...prev, critical_focus: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Implementation Items</Label>
                    <Button onClick={addAnnualImplementationItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  {annualForm.implementation_items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Textarea
                        placeholder="Implementation item..."
                        value={item}
                        onChange={(e) => updateAnnualImplementationItem(index, e.target.value)}
                        className="flex-1 min-h-[60px] resize-y"
                        rows={2}
                      />
                      <Button
                        onClick={() => removeAnnualImplementationItem(index)}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveAnnual} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      setShowAnnualForm(false); 
                      setEditingAnnual(null); 
                      resetAnnualForm(); 
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {annualGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Fiscal Year {goal.fiscal_year}</CardTitle>
                      <CardDescription>Annual Strategic Goals</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAnnual(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.sales_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Sales Goal</Label>
                      <p className="text-lg">${goal.sales_goal.toLocaleString()}</p>
                    </div>
                  )}
                  {goal.revenue_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Revenue Goal</Label>
                      <p className="text-lg">${goal.revenue_goal.toLocaleString()}</p>
                    </div>
                  )}
                  {goal.financial_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Financial Goal</Label>
                      <p>{goal.financial_goal}</p>
                    </div>
                  )}
                  {goal.people_goal && (
                    <div>
                      <Label className="text-sm font-semibold">People Goal</Label>
                      <p>{goal.people_goal}</p>
                    </div>
                  )}
                  {goal.critical_focus && (
                    <div>
                      <Label className="text-sm font-semibold">Critical Focus</Label>
                      <p>{goal.critical_focus}</p>
                    </div>
                  )}
                  {goal.implementation_items_json.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Implementation Items</Label>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {goal.implementation_items_json.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Quarterly Strategic Goals</h2>
              <p className="text-muted-foreground">Break down annual goals into quarterly targets</p>
            </div>
            <Button onClick={() => { resetQuarterlyForm(); setShowQuarterlyForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Quarterly Goals
            </Button>
          </div>

          {showQuarterlyForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingQuarterly ? 'Edit' : 'Add'} Quarterly Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quarterly-year">Year</Label>
                    <Input
                      id="quarterly-year"
                      type="number"
                      value={quarterlyForm.year}
                      onChange={(e) => setQuarterlyForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quarterly-quarter">Quarter</Label>
                    <Input
                      id="quarterly-quarter"
                      type="number"
                      min="1"
                      max="4"
                      value={quarterlyForm.quarter}
                      onChange={(e) => setQuarterlyForm(prev => ({ ...prev, quarter: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quarterly-sales">Sales Goal ($)</Label>
                    <Input
                      id="quarterly-sales"
                      type="number"
                      placeholder="250000"
                      value={quarterlyForm.sales_goal}
                      onChange={(e) => setQuarterlyForm(prev => ({ ...prev, sales_goal: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quarterly-revenue">Revenue Goal ($)</Label>
                    <Input
                      id="quarterly-revenue"
                      type="number"
                      placeholder="300000"
                      value={quarterlyForm.revenue_goal}
                      onChange={(e) => setQuarterlyForm(prev => ({ ...prev, revenue_goal: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarterly-financial">Financial Goal</Label>
                  <Textarea
                    id="quarterly-financial"
                    placeholder="Reduce costs by 2%"
                    value={quarterlyForm.financial_goal}
                    onChange={(e) => setQuarterlyForm(prev => ({ ...prev, financial_goal: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarterly-people">People Goal</Label>
                  <Textarea
                    id="quarterly-people"
                    placeholder="Complete team training"
                    value={quarterlyForm.people_goal}
                    onChange={(e) => setQuarterlyForm(prev => ({ ...prev, people_goal: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarterly-critical">Critical Focus</Label>
                  <Textarea
                    id="quarterly-critical"
                    placeholder="Launch new product line"
                    value={quarterlyForm.critical_focus}
                    onChange={(e) => setQuarterlyForm(prev => ({ ...prev, critical_focus: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Implementation Items</Label>
                    <Button onClick={addQuarterlyImplementationItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  {quarterlyForm.implementation_items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Textarea
                        placeholder="Implementation item..."
                        value={item}
                        onChange={(e) => updateQuarterlyImplementationItem(index, e.target.value)}
                        className="flex-1 min-h-[60px] resize-y"
                        rows={2}
                      />
                      <Button
                        onClick={() => removeQuarterlyImplementationItem(index)}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarterly-results">Results & Analysis</Label>
                  <Textarea
                    id="quarterly-results"
                    placeholder="Quarter performance analysis and learnings..."
                    value={quarterlyForm.results_analysis}
                    onChange={(e) => setQuarterlyForm(prev => ({ ...prev, results_analysis: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveQuarterly} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      setShowQuarterlyForm(false); 
                      setEditingQuarterly(null); 
                      resetQuarterlyForm(); 
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {quarterlyGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Q{goal.quarter} {goal.year}</CardTitle>
                      <CardDescription>Quarterly Strategic Goals</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editQuarterly(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.sales_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Sales Goal</Label>
                      <p className="text-lg">${goal.sales_goal.toLocaleString()}</p>
                    </div>
                  )}
                  {goal.revenue_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Revenue Goal</Label>
                      <p className="text-lg">${goal.revenue_goal.toLocaleString()}</p>
                    </div>
                  )}
                  {goal.financial_goal && (
                    <div>
                      <Label className="text-sm font-semibold">Financial Goal</Label>
                      <p>{goal.financial_goal}</p>
                    </div>
                  )}
                  {goal.people_goal && (
                    <div>
                      <Label className="text-sm font-semibold">People Goal</Label>
                      <p>{goal.people_goal}</p>
                    </div>
                  )}
                  {goal.critical_focus && (
                    <div>
                      <Label className="text-sm font-semibold">Critical Focus</Label>
                      <p>{goal.critical_focus}</p>
                    </div>
                  )}
                  {goal.implementation_items_json.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">Implementation Items</Label>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {goal.implementation_items_json.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {goal.results_analysis && (
                    <div>
                      <Label className="text-sm font-semibold">Results & Analysis</Label>
                      <p className="whitespace-pre-wrap">{goal.results_analysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
