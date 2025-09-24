import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Building, UserCheck, UserX } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Position {
  id: string;
  position_title: string;
  department?: string;
  employee_name?: string;
  reports_to_position?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'filled' | 'vacant' | 'pending';
  salary_range?: string;
  responsibilities?: string;
  required_skills?: string;
}

export const OrganizationalStructure = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newPosition, setNewPosition] = useState({
    position_title: '',
    department: '',
    employee_name: '',
    reports_to_position: '',
    employment_type: 'full_time' as const,
    status: 'vacant' as const,
    salary_range: '',
    responsibilities: '',
    required_skills: ''
  });

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' }
  ];

  const departments = [
    'Executive',
    'Sales',
    'Marketing',
    'Operations',
    'Finance',
    'HR',
    'IT',
    'Customer Service',
    'R&D',
    'Legal'
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchPositions();
    }
  }, [currentCompany]);

  const fetchPositions = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('department', { ascending: true });

      if (error) throw error;
      setPositions((data as Position[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading organizational structure",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPosition = async () => {
    if (!currentCompany || !newPosition.position_title) return;

    try {
      const { error } = await supabase
        .from('organizational_structure')
        .insert([{
          company_id: currentCompany.id,
          position_title: newPosition.position_title,
          department: newPosition.department,
          employee_name: newPosition.employee_name,
          reports_to_position: newPosition.reports_to_position,
          employment_type: newPosition.employment_type,
          status: newPosition.status,
          salary_range: newPosition.salary_range,
          responsibilities: newPosition.responsibilities,
          required_skills: newPosition.required_skills
        }]);

      if (error) throw error;

      toast({
        title: "Position created",
        description: `${newPosition.position_title} has been added to your organizational structure.`,
      });

      setNewPosition({
        position_title: '',
        department: '',
        employee_name: '',
        reports_to_position: '',
        employment_type: 'full_time',
        status: 'vacant',
        salary_range: '',
        responsibilities: '',
        required_skills: ''
      });
      setIsDialogOpen(false);
      fetchPositions();
    } catch (error: any) {
      toast({
        title: "Error creating position",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled': return UserCheck;
      case 'pending': return Users;
      default: return UserX;
    }
  };

  const groupedPositions = positions.reduce((acc, position) => {
    const dept = position.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(position);
    return acc;
  }, {} as Record<string, Position[]>);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading organizational structure...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Organizational Structure
          </h2>
          <p className="text-muted-foreground">
            Define your company's organizational chart and manage positions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Position</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="position_title">Position Title</Label>
                <Input
                  id="position_title"
                  value={newPosition.position_title}
                  onChange={(e) => setNewPosition({ ...newPosition, position_title: e.target.value })}
                  placeholder="e.g., Marketing Manager"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newPosition.department} onValueChange={(value) => setNewPosition({ ...newPosition, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={newPosition.employment_type} onValueChange={(value: any) => setNewPosition({ ...newPosition, employment_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_name">Employee Name</Label>
                  <Input
                    id="employee_name"
                    value={newPosition.employee_name}
                    onChange={(e) => setNewPosition({ ...newPosition, employee_name: e.target.value })}
                    placeholder="Leave empty if vacant"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newPosition.status} onValueChange={(value: any) => setNewPosition({ ...newPosition, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reports_to_position">Reports To</Label>
                  <Input
                    id="reports_to_position"
                    value={newPosition.reports_to_position}
                    onChange={(e) => setNewPosition({ ...newPosition, reports_to_position: e.target.value })}
                    placeholder="e.g., CEO, VP of Marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <Input
                    id="salary_range"
                    value={newPosition.salary_range}
                    onChange={(e) => setNewPosition({ ...newPosition, salary_range: e.target.value })}
                    placeholder="e.g., $50,000 - $70,000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={newPosition.responsibilities}
                  onChange={(e) => setNewPosition({ ...newPosition, responsibilities: e.target.value })}
                  placeholder="List the main responsibilities for this position..."
                />
              </div>
              <div>
                <Label htmlFor="required_skills">Required Skills</Label>
                <Textarea
                  id="required_skills"
                  value={newPosition.required_skills}
                  onChange={(e) => setNewPosition({ ...newPosition, required_skills: e.target.value })}
                  placeholder="List the required skills and qualifications..."
                />
              </div>
              <Button onClick={createPosition} className="w-full" disabled={!newPosition.position_title}>
                Create Position
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {positions.length === 0 ? (
        <Card className="p-8 text-center">
          <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Positions Defined Yet</h4>
          <p className="text-muted-foreground">Start by adding your first position to build your organizational structure.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPositions).map(([department, deptPositions]) => (
            <Card key={department}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {department}
                </CardTitle>
                <CardDescription>
                  {deptPositions.length} position{deptPositions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {deptPositions.map((position) => {
                    const StatusIcon = getStatusIcon(position.status);
                    return (
                      <div key={position.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{position.position_title}</h4>
                            {position.employee_name && (
                              <p className="text-sm text-muted-foreground">{position.employee_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={getStatusColor(position.status)}>
                              {position.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {position.reports_to_position && (
                            <div>
                              <span className="text-muted-foreground">Reports to:</span> {position.reports_to_position}
                            </div>
                          )}
                          {position.employment_type && (
                            <div>
                              <span className="text-muted-foreground">Type:</span> {position.employment_type.replace('_', ' ')}
                            </div>
                          )}
                          {position.salary_range && (
                            <div>
                              <span className="text-muted-foreground">Salary:</span> {position.salary_range}
                            </div>
                          )}
                        </div>

                        {position.responsibilities && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <div className="font-medium text-muted-foreground mb-1">Responsibilities</div>
                            <div>{position.responsibilities}</div>
                          </div>
                        )}

                        {position.required_skills && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <div className="font-medium text-muted-foreground mb-1">Required Skills</div>
                            <div>{position.required_skills}</div>
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