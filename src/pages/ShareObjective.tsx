import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, Users } from "lucide-react";

interface ObjectiveLink {
  id: string;
  objective_id: string;
  role: string;
  token: string;
  revoked: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  target_date: string | null;
  status: string;
  priority: string;
  completion_percentage: number;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export default function ShareObjective() {
  const { token } = useParams<{ token: string }>();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [linkData, setLinkData] = useState<ObjectiveLink | null>(null);
  const [revoked, setRevoked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadObjective() {
      if (!token) return;

      try {
        setLoading(true);

        // Get the link data
        const { data: link, error: linkError } = await supabase
          .from("objective_links")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (linkError) throw linkError;

        if (!link || link.revoked || (link.expires_at && new Date(link.expires_at) < new Date())) {
          setRevoked(true);
          setLoading(false);
          return;
        }

        setLinkData(link);

        // Get the objective data
        const { data: objectiveData, error: objectiveError } = await supabase
          .from("strategic_objectives")
          .select("*")
          .eq("id", link.objective_id)
          .single();

        if (objectiveError) throw objectiveError;

        setObjective(objectiveData);

        // Track access
        await supabase.from("objective_link_access").insert({
          link_id: link.id,
          email: null,
        });

      } catch (err: any) {
        console.error('Error loading shared objective:', err);
        setError(err.message || 'Failed to load objective');
      } finally {
        setLoading(false);
      }
    }

    loadObjective();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared objective...</p>
        </div>
      </div>
    );
  }

  if (revoked || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              {error || "This link has been revoked or expired."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!objective) {
    return <Navigate to="/" replace />;
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      not_started: 'bg-gray-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'destructive',
      high: 'orange',
      medium: 'yellow',
      low: 'green'
    };
    return colors[priority as keyof typeof colors] || 'secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <Badge variant="outline" className="mb-2">
            Shared as {linkData?.role}
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">Strategic Objective</h1>
          <p className="text-muted-foreground">Viewing shared objective details</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{objective.title}</CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    variant={getPriorityColor(objective.priority) as any}
                    className="capitalize"
                  >
                    {objective.priority} Priority
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="capitalize"
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(objective.status)}`} />
                    {objective.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {objective.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-foreground">{objective.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {objective.target_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Date</p>
                    <p className="text-foreground">
                      {new Date(objective.target_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Access Level</p>
                  <p className="text-foreground capitalize">{linkData?.role}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                <span className="text-sm text-foreground">{objective.completion_percentage}%</span>
              </div>
              <Progress value={objective.completion_percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>This objective was shared with you via a secure link.</p>
          <p>Contact the objective owner for more information or to request access changes.</p>
        </div>
      </div>
    </div>
  );
}