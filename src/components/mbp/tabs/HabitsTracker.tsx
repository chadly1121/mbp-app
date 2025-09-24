import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, Target, Calendar, Zap } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Habit {
  id: string;
  habit_name: string;
  habit_category?: string;
  user_name: string;
  target_frequency?: string;
  date_tracked: string;
  completed: boolean;
  streak_count?: number;
  notes?: string;
}

export const HabitsTracker = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newHabit, setNewHabit] = useState({
    habit_name: '',
    habit_category: 'health',
    user_name: '',
    target_frequency: 'daily',
    date_tracked: new Date().toISOString().split('T')[0],
    completed: false,
    notes: ''
  });

  const categories = [
    { value: 'health', label: 'Health & Fitness' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'learning', label: 'Learning & Development' },
    { value: 'business', label: 'Business' },
    { value: 'personal', label: 'Personal Development' },
    { value: 'finance', label: 'Finance' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'creativity', label: 'Creativity' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchHabits();
    }
  }, [currentCompany]);

  const fetchHabits = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('habits_tracker')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('date_tracked', { ascending: false });

      if (error) throw error;
      setHabits((data as Habit[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading habits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!currentCompany || !newHabit.habit_name || !newHabit.user_name) return;

    try {
      const { error } = await supabase
        .from('habits_tracker')
        .insert([{
          company_id: currentCompany.id,
          habit_name: newHabit.habit_name,
          habit_category: newHabit.habit_category,
          user_name: newHabit.user_name,
          target_frequency: newHabit.target_frequency,
          date_tracked: newHabit.date_tracked,
          completed: newHabit.completed,
          streak_count: 0,
          notes: newHabit.notes
        }]);

      if (error) throw error;

      toast({
        title: "Habit created",
        description: `${newHabit.habit_name} has been added to your habits tracker.`,
      });

      setNewHabit({
        habit_name: '',
        habit_category: 'health',
        user_name: '',
        target_frequency: 'daily',
        date_tracked: new Date().toISOString().split('T')[0],
        completed: false,
        notes: ''
      });
      setIsDialogOpen(false);
      fetchHabits();
    } catch (error: any) {
      toast({
        title: "Error creating habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleHabitCompletion = async (habitId: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('habits_tracker')
        .update({ completed: !currentCompleted })
        .eq('id', habitId);

      if (error) throw error;

      // Update local state
      setHabits(habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, completed: !currentCompleted }
          : habit
      ));

      toast({
        title: currentCompleted ? "Habit unmarked" : "Habit completed",
        description: currentCompleted ? "Habit has been unmarked." : "Great job! Keep up the streak!",
      });
    } catch (error: any) {
      toast({
        title: "Error updating habit",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return Target;
      case 'productivity': return Zap;
      case 'learning': return Calendar;
      default: return CheckSquare;
    }
  };

  const groupedHabits = habits.reduce((acc, habit) => {
    const user = habit.user_name;
    if (!acc[user]) acc[user] = [];
    acc[user].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading habits...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            Habits Tracker
          </h2>
          <p className="text-muted-foreground">
            Track personal and team habits to build positive routines
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="habit_name">Habit Name</Label>
                <Input
                  id="habit_name"
                  value={newHabit.habit_name}
                  onChange={(e) => setNewHabit({ ...newHabit, habit_name: e.target.value })}
                  placeholder="e.g., Morning Exercise, Read for 30 minutes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="habit_category">Category</Label>
                  <Select value={newHabit.habit_category} onValueChange={(value) => setNewHabit({ ...newHabit, habit_category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_frequency">Frequency</Label>
                  <Select value={newHabit.target_frequency} onValueChange={(value) => setNewHabit({ ...newHabit, target_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_name">User Name</Label>
                  <Input
                    id="user_name"
                    value={newHabit.user_name}
                    onChange={(e) => setNewHabit({ ...newHabit, user_name: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="date_tracked">Date</Label>
                  <Input
                    id="date_tracked"
                    type="date"
                    value={newHabit.date_tracked}
                    onChange={(e) => setNewHabit({ ...newHabit, date_tracked: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newHabit.notes}
                  onChange={(e) => setNewHabit({ ...newHabit, notes: e.target.value })}
                  placeholder="Additional notes about this habit..."
                />
              </div>
              <Button onClick={createHabit} className="w-full" disabled={!newHabit.habit_name || !newHabit.user_name}>
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Habits Tracked Yet</h4>
          <p className="text-muted-foreground">Start by adding your first habit to build positive routines.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHabits).map(([userName, userHabits]) => (
            <Card key={userName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  {userName}'s Habits
                </CardTitle>
                <CardDescription>
                  {userHabits.length} habit{userHabits.length !== 1 ? 's' : ''} tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {userHabits.map((habit) => {
                    const CategoryIcon = getCategoryIcon(habit.habit_category || '');
                    return (
                      <div key={habit.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <CategoryIcon className="h-5 w-5 mt-1 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium">{habit.habit_name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {habit.habit_category?.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {habit.target_frequency}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {habit.streak_count && habit.streak_count > 0 && (
                              <Badge className="bg-orange-100 text-orange-800">
                                {habit.streak_count} day streak
                              </Badge>
                            )}
                            <Button
                              variant={habit.completed ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleHabitCompletion(habit.id, habit.completed)}
                            >
                              {habit.completed ? "Completed" : "Mark Complete"}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          Date: {new Date(habit.date_tracked).toLocaleDateString()}
                        </div>

                        {habit.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <div className="font-medium text-muted-foreground mb-1">Notes</div>
                            <div>{habit.notes}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};