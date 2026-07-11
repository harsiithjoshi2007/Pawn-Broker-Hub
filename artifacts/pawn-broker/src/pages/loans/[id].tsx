import { useState } from "react";
import { useGetLoan, useRecordPayment, useCloseLoan, useRenewLoan, getGetLoanQueryKey, getListLoansQueryKey, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, CreditCard, XCircle, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronRight, Gem, History } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function LoanDetail() {
  const { id } = useParams();
  const loanId = parseInt(id || "0", 10);
  
  const { data: loan, isLoading } = useGetLoan(loanId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const recordPayment = useRecordPayment();
  const closeLoan = useCloseLoan();
  const renewLoan = useRenewLoan();

  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<string>("cash");
  const [reference, setReference] = useState("");

  // Close Loan State
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [discount, setDiscount] = useState<string>("0");
  const [closeMode, setCloseMode] = useState<string>("cash");

  // Renew Loan State
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewInterest, setRenewInterest] = useState<string>("");
  const [renewDuration, setRenewDuration] = useState<string>("");
  const [renewDurationUnit, setRenewDurationUnit] = useState<string>("months");

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!loan) {
    return <div className="text-center py-12">Loan not found</div>;
  }

  const handleRecordPayment = async () => {
    try {
      await recordPayment.mutateAsync({
        id: loanId,
        data: {
          paymentDate: new Date().toISOString().split('T')[0],
          amount: parseFloat(paymentAmount),
          paymentMode: paymentMode as any,
          referenceNumber: reference || undefined,
        }
      });
      
      toast({ title: "Payment Recorded", description: "The payment has been successfully recorded." });
      setIsPaymentOpen(false);
      setPaymentAmount("");
      setReference("");
      
      // Update cache locally instead of invalidating if possible, but invalidate is safer
      queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(loanId) });
      queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to record payment" });
    }
  };

  const handleCloseLoan = async () => {
    try {
      await closeLoan.mutateAsync({
        id: loanId,
        data: {
          discount: parseFloat(discount) || 0,
          paymentMode: closeMode as any,
        }
      });
      
      toast({ title: "Loan Closed", description: "The loan has been successfully closed." });
      setIsCloseOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(loanId) });
      queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to close loan" });
    }
  };

  const handleRenewLoan = async () => {
    try {
      await renewLoan.mutateAsync({
        id: loanId,
        data: {
          newInterestRate: parseFloat(renewInterest),
          newDuration: parseInt(renewDuration, 10),
          newDurationUnit: renewDurationUnit as any,
        }
      });
      
      toast({ title: "Loan Renewed", description: "The loan has been successfully renewed." });
      setIsRenewOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(loanId) });
      queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to renew loan" });
    }
  };

  const isClosed = loan.status === 'closed';
  const isActive = loan.status === 'active' || loan.status === 'partially_paid' || loan.status === 'overdue';

  // Calculate progress
  const totalDue = (loan.principalAmount || 0) + (loan.totalInterest || 0);
  const percentPaid = totalDue > 0 ? ((loan.amountPaid || 0) / totalDue) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50 h-10 w-10 shrink-0">
            <Link href="/loans"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight font-mono text-sidebar-primary">{loan.loanNumber}</h1>
              <Badge className={`status-${loan.status.toLowerCase()} text-sm px-3 py-1`} variant="outline">
                {loan.status.replace("_", " ").toUpperCase()}
              </Badge>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                loan.loanType === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {loan.loanType}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              Issued to 
              <Link href={`/customers/${loan.customerId}`} className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                {loan.customerName || `Customer #${loan.customerId}`}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:ml-auto">
          <Button variant="outline" className="print:hidden bg-background" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
          
          {isActive && (
            <>
              <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="print:hidden bg-background">
                    <RefreshCw className="mr-2 h-4 w-4" /> Renew
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Renew Loan</DialogTitle>
                    <DialogDescription>Extend the loan duration. Previous interest must be cleared.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>New Interest Rate (%)</Label>
                        <Input type="number" step="0.1" value={renewInterest} onChange={e => setRenewInterest(e.target.value)} defaultValue={loan.interestRate} />
                      </div>
                      <div className="space-y-2">
                        <Label>New Duration</Label>
                        <div className="flex gap-2">
                          <Input type="number" className="w-1/2" value={renewDuration} onChange={e => setRenewDuration(e.target.value)} defaultValue={loan.duration} />
                          <Select value={renewDurationUnit} onValueChange={setRenewDurationUnit}>
                            <SelectTrigger className="w-1/2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="months">Months</SelectItem>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRenewOpen(false)}>Cancel</Button>
                    <Button onClick={handleRenewLoan} disabled={renewLoan.isPending || !renewInterest || !renewDuration}>
                      {renewLoan.isPending ? "Processing..." : "Confirm Renewal"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="print:hidden">
                    <XCircle className="mr-2 h-4 w-4" /> Close Loan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Close Loan</DialogTitle>
                    <DialogDescription>Settle the outstanding balance to release the pledged items.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center mb-2">
                      <span className="font-medium text-muted-foreground">Final Settlement Amount</span>
                      <span className="font-mono text-2xl font-bold">{formatCurrency(loan.outstandingBalance)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Discount / Waiver (₹) (Optional)</Label>
                      <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select value={closeMode} onValueChange={setCloseMode}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCloseOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleCloseLoan} disabled={closeLoan.isPending}>
                      {closeLoan.isPending ? "Processing..." : "Confirm Closure"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <Button className="print:hidden bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground shadow-md font-bold">
                    <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>Add a partial or interest payment for this loan.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Amount Received (₹)</Label>
                      <Input type="number" className="font-mono text-xl h-12" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} autoFocus />
                      <p className="text-xs text-muted-foreground">Auto-splits: Interest is paid first, then principal.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Reference No. (Optional)</Label>
                        <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Txn ID" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                    <Button onClick={handleRecordPayment} className="bg-sidebar-primary" disabled={recordPayment.isPending || !paymentAmount || parseFloat(paymentAmount) <= 0}>
                      {recordPayment.isPending ? "Saving..." : "Save Payment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Financials */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sidebar-primary to-accent w-full" />
            <CardHeader className="pb-2">
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-muted/20 rounded-xl mb-6 border border-border/40">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Principal</p>
                  <p className="text-xl font-bold font-mono">{formatCurrency(loan.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-xl font-bold font-mono">{formatCurrency(loan.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl font-bold font-mono text-accent">{formatCurrency(loan.amountPaid)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding</p>
                  <p className={`text-xl font-bold font-mono ${loan.outstandingBalance && loan.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatCurrency(loan.outstandingBalance)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Repayment Progress</span>
                  <span className="font-bold">{percentPaid.toFixed(1)}%</span>
                </div>
                <Progress value={percentPaid} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Interest Rate</p>
                  <p className="font-medium">{loan.interestRate}% per {loan.ratePeriod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Interest Type</p>
                  <p className="font-medium capitalize">{loan.interestType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">{formatIndianDate(loan.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Due Date</p>
                  <p className={`font-medium ${loan.status === 'overdue' ? 'text-destructive' : ''}`}>
                    {formatIndianDate(loan.dueDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loan.payments && loan.payments.length > 0 ? (
                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Total Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/20">
                          <TableCell>{formatIndianDate(payment.paymentDate)}</TableCell>
                          <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                          <TableCell className="uppercase text-xs">{payment.paymentMode}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(payment.interestPaid)}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(payment.principalPaid)}</TableCell>
                          <TableCell className="text-right font-mono font-medium text-accent">{formatCurrency(payment.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No payments recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Items & Details */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-sidebar-primary" />
                Pledged Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loan.jewelleryItems && loan.jewelleryItems.length > 0 ? (
                <div className="space-y-4">
                  {loan.jewelleryItems.map((item, idx) => (
                    <div key={item.id} className="p-4 border border-border/60 rounded-lg bg-muted/10 relative">
                      <div className="absolute -top-2 -left-2 h-5 w-5 bg-muted-foreground text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-base">{item.jewelleryType}</h4>
                          <Badge variant="outline" className="mt-1 font-mono text-xs bg-background">{item.purity}</Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block mb-0.5">Est. Value</span>
                          <span className="font-mono font-bold text-foreground">{formatCurrency(item.estimatedValue)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block">Gross</span>
                          <span className="font-medium">{item.grossWeight}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Stone</span>
                          <span className="font-medium">{item.stoneWeight || 0}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Net</span>
                          <span className="font-medium text-sidebar-primary">{item.netWeight}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-sidebar-primary/5 rounded-lg border border-sidebar-primary/20 flex justify-between items-center">
                    <span className="font-medium">Total Items Value</span>
                    <span className="font-mono font-bold text-lg text-sidebar-primary">
                      {formatCurrency(loan.jewelleryItems.reduce((acc, item) => acc + (item.estimatedValue || 0), 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No items pledged.</p>
              )}
            </CardContent>
          </Card>

          {loan.notes && (
            <Card className="border-border/50 shadow-sm bg-muted/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes & Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{loan.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
