import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ARRecord {
  id: string;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  due_date: string;
  invoice_amount: number;
  paid_amount?: number;
  balance_due: number;
  days_outstanding?: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_terms?: string;
  notes?: string;
}

export const ARTracker = () => {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [arRecords, setARRecords] = useState<ARRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newRecord, setNewRecord] = useState({
    invoice_number: '',
    client_name: '',
    invoice_date: '',
    due_date: '',
    invoice_amount: '',
    paid_amount: '',
    payment_terms: 'Net 30',
    notes: ''
  });

  const paymentTermsOptions = [
    'Net 15',
    'Net 30', 
    'Net 45',
    'Net 60',
    'Due on Receipt',
    'COD'
  ];

  useEffect(() => {
    if (currentCompany) {
      fetchARRecords();
    }
  }, [currentCompany]);

  const fetchARRecords = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('ar_tracker')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setARRecords((data as ARRecord[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading AR records",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createARRecord = async () => {
    if (!currentCompany || !newRecord.invoice_number || !newRecord.client_name) return;

    try {
      const invoiceAmount = parseFloat(newRecord.invoice_amount);
      const paidAmount = newRecord.paid_amount ? parseFloat(newRecord.paid_amount) : 0;
      const balanceDue = invoiceAmount - paidAmount;
      
      // Calculate days outstanding
      const dueDate = new Date(newRecord.due_date);
      const today = new Date();
      const daysOutstanding = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine status
      let status: 'pending' | 'partial' | 'paid' | 'overdue' = 'pending';
      if (balanceDue === 0) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partial';
      } else if (daysOutstanding > 0) {
        status = 'overdue';
      }

      const { error } = await supabase
        .from('ar_tracker')
        .insert([{
          company_id: currentCompany.id,
          invoice_number: newRecord.invoice_number,
          client_name: newRecord.client_name,
          invoice_date: newRecord.invoice_date,
          due_date: newRecord.due_date,
          invoice_amount: invoiceAmount,
          paid_amount: paidAmount,
          balance_due: balanceDue,
          days_outstanding: daysOutstanding,
          status: status,
          payment_terms: newRecord.payment_terms,
          notes: newRecord.notes
        }]);

      if (error) throw error;

      toast({
        title: "AR record created",
        description: `Invoice ${newRecord.invoice_number} has been added to your AR tracker.`,
      });

      setNewRecord({
        invoice_number: '',
        client_name: '',
        invoice_date: '',
        due_date: '',
        invoice_amount: '',
        paid_amount: '',
        payment_terms: 'Net 30',
        notes: ''
      });
      setIsDialogOpen(false);
      fetchARRecords();
    } catch (error: any) {
      toast({
        title: "Error creating AR record",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTotalOutstanding = () => {
    return arRecords.reduce((total, record) => total + record.balance_due, 0);
  };

  const getOverdueAmount = () => {
    return arRecords
      .filter(record => record.status === 'overdue')
      .reduce((total, record) => total + record.balance_due, 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading AR records...</div>;
  }

  if (!currentCompany) {
    return <div className="flex items-center justify-center p-8">Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Accounts Receivable Tracker
          </h2>
          <p className="text-muted-foreground">
            Track outstanding invoices and monitor payment collections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add AR Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={newRecord.invoice_number}
                    onChange={(e) => setNewRecord({ ...newRecord, invoice_number: e.target.value })}
                    placeholder="e.g., INV-001"
                  />
                </div>
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={newRecord.client_name}
                    onChange={(e) => setNewRecord({ ...newRecord, client_name: e.target.value })}
                    placeholder="e.g., ABC Company"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={newRecord.invoice_date}
                    onChange={(e) => setNewRecord({ ...newRecord, invoice_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newRecord.due_date}
                    onChange={(e) => setNewRecord({ ...newRecord, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_amount">Invoice Amount</Label>
                  <Input
                    id="invoice_amount"
                    type="number"
                    value={newRecord.invoice_amount}
                    onChange={(e) => setNewRecord({ ...newRecord, invoice_amount: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="paid_amount">Paid Amount</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    value={newRecord.paid_amount}
                    onChange={(e) => setNewRecord({ ...newRecord, paid_amount: e.target.value })}
                    placeholder="e.g., 0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select value={newRecord.payment_terms} onValueChange={(value) => setNewRecord({ ...newRecord, payment_terms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Additional notes about the invoice..."
                />
              </div>
              <Button onClick={createARRecord} className="w-full" disabled={!newRecord.invoice_number || !newRecord.client_name}>
                Add AR Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalOutstanding().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${getOverdueAmount().toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      {arRecords.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No AR Records Yet</h4>
          <p className="text-muted-foreground">Start by adding your first invoice to track accounts receivable.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {arRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {record.invoice_number}
                      {record.status === 'overdue' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </CardTitle>
                    <CardDescription>{record.client_name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Invoice Amount</div>
                    <div className="font-medium">${record.invoice_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Balance Due</div>
                    <div className="font-medium">${record.balance_due.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div className="font-medium">{new Date(record.due_date).toLocaleDateString()}</div>
                  </div>
                  {record.days_outstanding !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Days Outstanding</div>
                      <div className={`font-medium ${record.days_outstanding > 0 ? 'text-destructive' : ''}`}>
                        {record.days_outstanding}
                      </div>
                    </div>
                  )}
                </div>
                {record.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="text-sm">{record.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};