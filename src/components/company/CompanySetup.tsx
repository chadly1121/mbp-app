import { useState } from 'react';
import { useCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CompanySetup = () => {
  const { companies, currentCompany, setCurrentCompany, createCompany } = useCompany();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const { error } = await createCompany(companyName, companySlug);
    
    if (!error) {
      setIsDialogOpen(false);
      setCompanyName('');
      setCompanySlug('');
    }
    setIsCreating(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setCompanyName(name);
    setCompanySlug(generateSlug(name));
  };

  if (companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-elevated border-0 bg-gradient-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to MBP SaaS</CardTitle>
            <CardDescription>
              Let's set up your first company to get started with monthly business planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySlug">Company URL Slug</Label>
                <Input
                  id="companySlug"
                  placeholder="company-slug"
                  value={companySlug}
                  onChange={(e) => setCompanySlug(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating Company...' : 'Create Company'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-1 md:gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          value={currentCompany?.id || ''}
          onValueChange={(value) => {
            const company = companies.find(c => c.id === value);
            setCurrentCompany(company || null);
          }}
        >
          <SelectTrigger className={`${isMobile ? 'w-24' : 'w-48'} text-xs md:text-sm`}>
            <SelectValue placeholder={isMobile ? "Company" : "Select company"} />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id} className="text-xs md:text-sm">
                {isMobile ? company.name.slice(0, 12) + (company.name.length > 12 ? '...' : '') : company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size={isMobile ? "sm" : "sm"} className="shrink-0">
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            {isMobile ? 'New' : 'New Company'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Add a new company to manage separately in your MBP dashboard
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCompanyName">Company Name</Label>
              <Input
                id="newCompanyName"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCompanySlug">Company URL Slug</Label>
              <Input
                id="newCompanySlug"
                placeholder="company-slug"
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Company'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySetup;