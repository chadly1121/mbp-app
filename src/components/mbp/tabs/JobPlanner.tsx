import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Plus, Clock, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  job_name: string;
  client_name?: string;
  job_type?: string;
  estimated_hours: number;
  actual_hours: number;
  hourly_rate: number;
  estimated_cost: number;
  actual_cost: number;
  planned_start_date?: string;
  planned_completion_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  status: 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  profitability: number;
  notes?: string;
}

export const JobPlanner = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    job_name: '',
    client_name: '',
    job_type: '',
    estimated_hours: 0,
    actual_hours: 0,
    hourly_rate: 0,
    estimated_cost: 0,
    actual_cost: 0,
    planned_start_date: '',
    planned_completion_date: '',
    actual_start_date: '',
    actual_completion_date: '',
    status: 'quoted' as const,
    notes: ''
  });

  useEffect(() => {
    if (currentCompany) {
      fetchJobs();
    }
  }, [currentCompany]);

  useEffect(() => {
    // Auto-calculate estimated cost when hours or rate changes
    setNewJob(prev => ({
      ...prev,
      estimated_cost: prev.estimated_hours * prev.hourly_rate
    }));
  }, [newJob.estimated_hours, newJob.hourly_rate]);

  useEffect(() => {
    // Auto-calculate actual cost when actual hours or rate changes
    setNewJob(prev => ({
      ...prev,
      actual_cost: prev.actual_hours * prev.hourly_rate
    }));
  }, [newJob.actual_hours, newJob.hourly_rate]);

  const fetchJobs = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('job_planner')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data as Job[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createJob = async () => {
    if (!currentCompany || !newJob.job_name) return;

    try {
      const profitability = newJob.estimated_cost > 0 
        ? ((newJob.estimated_cost - newJob.actual_cost) / newJob.estimated_cost) * 100
        : 0;

      const jobData = {
        company_id: currentCompany.id,
        ...newJob,
        profitability
      };

      const { error } = await supabase
        .from('job_planner')
        .insert([jobData]);

      if (error) throw error;

      toast({
        title: "Job created",
        description: `${newJob.job_name} has been added to your job planner.`,
      });

      setNewJob({
        job_name: '',
        client_name: '',
        job_type: '',
        estimated_hours: 0,
        actual_hours: 0,
        hourly_rate: 0,
        estimated_cost: 0,
        actual_cost: 0,
        planned_start_date: '',
        planned_completion_date: '',
        actual_start_date: '',
        actual_completion_date: '',
        status: 'quoted',
        notes: ''
      });
      setIsDialogOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'quoted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProfitabilityColor = (profitability: number) => {
    if (profitability > 20) return 'text-green-600';
    if (profitability > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getJobProgress = (job: Job) => {
    if (job.estimated_hours === 0) return 0;
    return Math.min((job.actual_hours / job.estimated_hours) * 100, 100);
  };

  const totalEstimatedRevenue = jobs.reduce((sum, job) => sum + job.estimated_cost, 0);
  const totalActualRevenue = jobs.reduce((sum, job) => sum + job.actual_cost, 0);
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const activeJobs = jobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading jobs...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Job Planner
          </h2>
          <p className="text-muted-foreground">
            Plan, schedule, and track your jobs from quote to completion
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_name">Job Name</Label>
                  <Input
                    id="job_name"
                    value={newJob.job_name}
                    onChange={(e) => setNewJob({ ...newJob, job_name: e.target.value })}
                    placeholder="e.g., Website Redesign"
                  />
                </div>
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={newJob.client_name}
                    onChange={(e) => setNewJob({ ...newJob, client_name: e.target.value })}
                    placeholder="Client or company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <Input
                    id="job_type"
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                    placeholder="e.g., Development, Consulting"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newJob.status} onValueChange={(value: any) => setNewJob({ ...newJob, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={newJob.estimated_hours}
                    onChange={(e) => setNewJob({ ...newJob, estimated_hours: Number(e.target.value) })}
                    min={0}
                    step={0.5}
                  />
                </div>
                <div>
                  <Label htmlFor="actual_hours">Actual Hours</Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    value={newJob.actual_hours}
                    onChange={(e) => setNewJob({ ...newJob, actual_hours: Number(e.target.value) })}
                    min={0}
                    step={0.5}
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={newJob.hourly_rate}
                    onChange={(e) => setNewJob({ ...newJob, hourly_rate: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    value={newJob.estimated_cost}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="actual_cost">Actual Cost ($)</Label>
                  <Input
                    id="actual_cost"
                    type="number"
                    value={newJob.actual_cost}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planned_start_date">Planned Start Date</Label>
                  <Input
                    id="planned_start_date"
                    type="date"
                    value={newJob.planned_start_date}
                    onChange={(e) => setNewJob({ ...newJob, planned_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="planned_completion_date">Planned Completion</Label>
                  <Input
                    id="planned_completion_date"
                    type="date"
                    value={newJob.planned_completion_date}
                    onChange={(e) => setNewJob({ ...newJob, planned_completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newJob.notes}
                  onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                  placeholder="Additional notes or requirements"
                />
              </div>

              <Button onClick={createJob} className="w-full" disabled={!newJob.job_name}>
                Create Job
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">All jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">Finished jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totalActualRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Actual earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-semibold mb-2">No Jobs Planned</h4>
            <p className="text-muted-foreground mb-4">Create your first job to start planning and tracking your work.</p>
          </Card>
        ) : (
          jobs.map((job) => {
            const progress = getJobProgress(job);
            const profitability = job.estimated_cost > 0 
              ? ((job.estimated_cost - job.actual_cost) / job.estimated_cost) * 100
              : 0;
            
            return (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.job_name}</CardTitle>
                      <CardDescription>
                        {job.client_name && `${job.client_name} • `}
                        {job.job_type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getProfitabilityColor(profitability)}>
                        {profitability.toFixed(1)}% profit
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hours Progress</span>
                      <span>{job.actual_hours}h / {job.estimated_hours}h</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Estimated Cost</div>
                      <div className="text-lg font-semibold">${job.estimated_cost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Actual Cost</div>
                      <div className="text-lg font-semibold">${job.actual_cost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Hourly Rate</div>
                      <div className="text-lg font-semibold">${job.hourly_rate}/hr</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Profitability</div>
                      <div className={`text-lg font-semibold ${getProfitabilityColor(profitability)}`}>
                        {profitability.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  {(job.planned_start_date || job.planned_completion_date) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {job.planned_start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Start: {new Date(job.planned_start_date).toLocaleDateString()}
                        </div>
                      )}
                      {job.planned_completion_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(job.planned_completion_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {job.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};