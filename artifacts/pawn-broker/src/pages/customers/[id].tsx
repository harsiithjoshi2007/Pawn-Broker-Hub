import { useState } from "react";
import { useGetCustomer, useListLoans, useListPayments, useDeleteCustomer, getGetCustomerQueryKey, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, FileText, Phone, CreditCard, Plus, User, Trash2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading: isLoadingCustomer } = useGetCustomer(customerId);
  const { data: loansData, isLoading: isLoadingLoans } = useListLoans({ customerId, limit: 50 });

  const deleteCustomer = useDeleteCustomer();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync({ id: customerId });
      toast({ title: "Customer Deleted", description: `${customer?.name} has been removed.` });
      queryClient.removeQueries({ queryKey: getGetCustomerQueryKey(customerId) });
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
      setLocation("/customers");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: e.message || "Could not delete customer. They may have active loans.",
      });
      setIsDeleteOpen(false);
    }
  };

  if (isLoadingCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button asChild className="mt-4"><Link href="/customers">Back to Customers</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-10 w-10 bg-muted/50">
            <Link href="/customers"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-sidebar-primary text-sidebar-primary-foreground text-xl">
              <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {customer.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="font-mono text-sidebar-primary font-medium px-2 py-0.5 bg-sidebar-primary/10 rounded">
                  {customer.customerId}
                </span>
                <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {customer.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ml-14 md:ml-0">
          <Button variant="outline" asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Link>
          </Button>
          <Button asChild className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground">
            <Link href={`/loans/new?customerId=${customer.id}`}>
              <Plus className="h-4 w-4 mr-2" /> New Loan
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Customer
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{customer.name}</strong>? This will permanently remove their profile.
              {(customer.activeLoansCount ?? 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ This customer has {customer.activeLoansCount} active loan(s). Delete those loans first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending || (customer.activeLoansCount ?? 0) > 0}
            >
              {deleteCustomer.isPending ? "Deleting..." : "Yes, Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="loans">Loan History</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-sidebar-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone Number</p>
                    <p className="font-medium mt-1">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium mt-1">{customer.whatsapp || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium mt-1">{customer.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-medium mt-1">{formatIndianDate(customer.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Relation</p>
                    <p className="font-medium mt-1">
                      {(customer as any).relationType && (customer as any).relativeName
                        ? `${(customer as any).relationType} ${(customer as any).relativeName}`
                        : (customer as any).relationType || (customer as any).relativeName || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Added On</p>
                    <p className="font-medium mt-1">{formatIndianDate(customer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Loans</p>
                    <p className="font-medium mt-1">
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        {customer.activeLoansCount || 0}
                      </Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sidebar-primary" />
                  Identity & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Aadhaar Number</p>
                    <p className="font-mono font-medium mt-1">{customer.aadhaarNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PAN Number</p>
                    <p className="font-mono font-medium mt-1 uppercase">{customer.panNumber || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium mt-1 leading-relaxed">
                      {customer.address ? (
                        <>
                          {customer.address}<br />
                          {[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}
                        </>
                      ) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="loans" className="mt-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Loan History</CardTitle>
                <CardDescription>All loans issued to this customer</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLoans ? (
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !loansData || loansData.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No loans found for this customer</p>
                  <Button variant="outline" asChild className="mt-4">
                    <Link href={`/loans/new?customerId=${customer.id}`}>Create First Loan</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border border-border/50 mt-4 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Loan No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loansData.data.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-mono text-sm">{loan.loanNumber}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              loan.loanType === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">{formatCurrency(loan.principalAmount)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatIndianDate(loan.createdAt)}</TableCell>
                          <TableCell>
                            <Badge className={`status-${loan.status.toLowerCase()}`} variant="outline">
                              {loan.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/loans/${loan.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <CustomerPayments customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Customer payments sub-component ──────────────────────────────────────────

function CustomerPayments({ customerId }: { customerId: number }) {
  const { data: paymentsData, isLoading } = useListPayments({ customerId, limit: 50 });

  if (isLoading) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardContent className="pt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const payments = (paymentsData?.data ?? []) as any[];

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>All payments made across this customer's loans.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No payments found for this customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Receipt No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan No.</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{p.receiptNumber}</TableCell>
                    <TableCell className="text-sm">{formatIndianDate(p.paymentDate)}</TableCell>
                    <TableCell>
                      <Link href={`/loans/${p.loanId}`} className="font-mono text-xs text-primary hover:underline">
                        {p.loanNumber ?? `#${p.loanId}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {p.paymentMode.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(p.interestPaid)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(p.principalPaid)}</TableCell>
                    <TableCell className="text-right pr-6 font-mono text-sm font-bold text-accent">{formatCurrency(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
