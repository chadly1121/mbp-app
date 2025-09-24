import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, Star, Users, TrendingUp } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Victory {
  id: string;
  victory_title: string;
  description?: string;
  category?: string;
  date_achieved: string;
  impact_level: 'low' | 'medium' | 'high' | 'game_changing';
  team_members?: string;
  lessons_learned?: string;
}

export const VictoriesWins = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [victories, setVictories] = useState<Victory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newVictory, setNewVictory] = useState({
    victory_title: '',
    description: '',
    category: 'business',
    date_achieved: new Date().toISOString().split('T')[0],
    impact_level: 'medium' as const,
    team_members: '',
    lessons_learned: ''
  });

  const categories = [
    { value: 'business', label: 'Business Growth' },
    { value: 'financial', label: 'Financial Achievement' },
    { value: 'team', label: 'Team Success' },
    { value: 'customer', label: 'Customer Success' },
    { value: 'product', label: 'Product Innovation' },
    { value: 'operational', label: 'Operational Excellence' },
    { value: 'partnership', label: 'Strategic Partnership' },
    { value: 'recognition', label: 'Awards & Recognition' }
  ];

  const impactLevels = [
    { value: 'low', label: 'Low Impact' },
    { value: 'medium', label: 'Medium Impact' },
    { value: 'high', label: 'High Impact' },
    { value: 'game_changing', label: 'Game Changing' }
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchVictories();
    }
  }, [currentCompany]);

  const fetchVictories = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('victories_wins')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('date_achieved', { ascending: false });

      if (error) throw error;
      setVictories((data as Victory[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading victories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVictory = async () => {
    if (!currentCompany || !newVictory.victory_title) return;

    try {
      const { error } = await supabase
        .from('victories_wins')
        .insert([{
          company_id: currentCompany.id,
          victory_title: newVictory.victory_title,
          description: newVictory.description,
          category: newVictory.category,
          date_achieved: newVictory.date_achieved,
          impact_level: newVictory.impact_level,
          team_members: newVictory.team_members,
          lessons_learned: newVictory.lessons_learned
        }]);

      if (error) throw error;

      toast({
        title: "Victory recorded",
        description: `${newVictory.victory_title} has been added to your victories.`,
      });

      setNewVictory({
        victory_title: '',
        description: '',
        category: 'business',
        date_achieved: new Date().toISOString().split('T')[0],
        impact_level: 'medium',
        team_members: '',
        lessons_learned: ''
      });
      setIsDialogOpen(false);
      fetchVictories();
    } catch (error: any) {
      toast({
        title: "Error recording victory",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'game_changing': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'game_changing': return Star;
      case 'high': return Trophy;
      case 'medium': return TrendingUp;
      default: return Users;
    }
  };

  const groupedVictories = victories.reduce((acc, victory) => {
    const category = victory.category || 'business';
    if (!acc[category]) acc[category] = [];
    acc[category].push(victory);
    return acc;
  }, {} as Record<string, Victory[]>);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading victories...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Victories & Wins
          </h2>
          <p className="text-muted-foreground">
            Celebrate achievements and capture lessons learned from your successes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Victory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record a Victory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="victory_title">Victory Title</Label>
                <Input
                  id="victory_title"
                  value={newVictory.victory_title}
                  onChange={(e) => setNewVictory({ ...newVictory, victory_title: e.target.value })}
                  placeholder="e.g., Closed biggest deal in company history"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVictory.description}
                  onChange={(e) => setNewVictory({ ...newVictory, description: e.target.value })}
                  placeholder="Describe the victory and its significance..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newVictory.category} onValueChange={(value) => setNewVictory({ ...newVictory, category: value })}>
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
                  <Label htmlFor="impact_level">Impact Level</Label>
                  <Select value={newVictory.impact_level} onValueChange={(value: any) => setNewVictory({ ...newVictory, impact_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {impactLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_achieved">Date Achieved</Label>
                  <Input
                    id="date_achieved"
                    type="date"
                    value={newVictory.date_achieved}
                    onChange={(e) => setNewVictory({ ...newVictory, date_achieved: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="team_members">Team Members</Label>
                  <Input
                    id="team_members"
                    value={newVictory.team_members}
                    onChange={(e) => setNewVictory({ ...newVictory, team_members: e.target.value })}
                    placeholder="Who was involved?"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lessons_learned">Lessons Learned</Label>
                <Textarea
                  id="lessons_learned"
                  value={newVictory.lessons_learned}
                  onChange={(e) => setNewVictory({ ...newVictory, lessons_learned: e.target.value })}
                  placeholder="What can be learned from this success?"
                />
              </div>
              <Button onClick={createVictory} className="w-full" disabled={!newVictory.victory_title}>
                Record Victory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Victories</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{victories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Changing</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {victories.filter(v => v.impact_level === 'game_changing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {victories.filter(v => v.impact_level === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {victories.filter(v => new Date(v.date_achieved).getFullYear() === new Date().getFullYear()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {victories.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Victories Recorded Yet</h4>
          <p className="text-muted-foreground">Start by recording your first victory to celebrate your achievements.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVictories).map(([category, categoryVictories]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {categories.find(c => c.value === category)?.label || category} Victories
                </CardTitle>
                <CardDescription>
                  {categoryVictories.length} victor{categoryVictories.length !== 1 ? 'ies' : 'y'} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryVictories.map((victory) => {
                    const ImpactIcon = getImpactIcon(victory.impact_level);
                    return (
                      <div key={victory.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              <ImpactIcon className="h-4 w-4" />
                              {victory.victory_title}
                            </h4>
                            {victory.description && (
                              <p className="text-sm text-muted-foreground mt-1">{victory.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(victory.impact_level)}>
                              {victory.impact_level.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          <div>Date: {new Date(victory.date_achieved).toLocaleDateString()}</div>
                          {victory.team_members && (
                            <div>Team: {victory.team_members}</div>
                          )}
                        </div>

                        {victory.lessons_learned && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Lessons Learned</div>
                            <div className="text-sm">{victory.lessons_learned}</div>
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