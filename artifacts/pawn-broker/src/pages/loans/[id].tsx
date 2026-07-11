import { useState, useEffect } from "react";
import { useGetLoan, useRecordPayment, useCloseLoan, useRenewLoan, useUpdateLoan, useDeleteLoan, getGetLoanQueryKey, getListLoansQueryKey, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, CreditCard, XCircle, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronRight, Gem, History, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function LoanDetail() {
  const { id } = useParams();
  const loanId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  
  const { data: loan, isLoading } = useGetLoan(loanId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const recordPayment = useRecordPayment();
  const closeLoan = useCloseLoan();
  const renewLoan = useRenewLoan();
  const updateLoan = useUpdateLoan();
  const deleteLoan = useDeleteLoan();

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

  // Delete Loan State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Edit Loan State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editPenaltyRate, setEditPenaltyRate] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editLoanNumber, setEditLoanNumber] = useState<string>("");

  // Shop settings (for print receipt)
  const [shopSettings, setShopSettings] = useState<any>(null);
  useEffect(() => {
    fetch("/api/shop-settings", { credentials: "include" })
      .then(r => r.json())
      .then(setShopSettings)
      .catch(() => {});
  }, []);

  const handleDeleteLoan = async () => {
    try {
      await deleteLoan.mutateAsync({ id: loanId });
      toast({ title: "Loan Deleted", description: `Loan ${loan?.loanNumber} has been permanently deleted.` });
      queryClient.removeQueries({ queryKey: getGetLoanQueryKey(loanId) });
      queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
      setLocation("/loans");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: e.message || "Could not delete loan." });
      setIsDeleteOpen(false);
    }
  };

  const openEditDialog = () => {
    if (!loan) return;
    setEditLoanNumber(loan.loanNumber || "");
    setEditNotes(loan.notes || "");
    setEditPenaltyRate(loan.penaltyRate != null ? String(loan.penaltyRate) : "");
    setEditDueDate(loan.dueDate ? loan.dueDate.split("T")[0] : "");
    setEditStatus(loan.status || "active");
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!loan) {
    return <div className="text-center py-12">Loan not found</div>;
  }

  const invalidateLoan = () => {
    queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(loanId) });
    queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
  };

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
      
      invalidateLoan();
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
      invalidateLoan();
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
      invalidateLoan();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to renew loan" });
    }
  };

  const handleEditLoan = async () => {
    try {
      const payload: Record<string, any> = {};
      if (editLoanNumber.trim() && editLoanNumber.trim() !== loan.loanNumber) payload.loanNumber = editLoanNumber.trim();
      if (editNotes !== (loan.notes || "")) payload.notes = editNotes || null;
      if (editPenaltyRate !== (loan.penaltyRate != null ? String(loan.penaltyRate) : "")) {
        payload.penaltyRate = editPenaltyRate ? parseFloat(editPenaltyRate) : null;
      }
      if (editDueDate && editDueDate !== (loan.dueDate ? loan.dueDate.split("T")[0] : "")) {
        payload.dueDate = editDueDate;
      }
      if (editStatus !== loan.status) payload.status = editStatus;

      if (Object.keys(payload).length === 0) {
        setIsEditOpen(false);
        return;
      }

      await updateLoan.mutateAsync({ id: loanId, data: payload });
      toast({ title: "Loan Updated", description: "Loan details have been saved." });
      setIsEditOpen(false);
      invalidateLoan();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to update loan" });
    }
  };

  const isClosed = loan.status === 'closed';
  const isActive = loan.status === 'active' || loan.status === 'partially_paid' || loan.status === 'overdue';

  // Calculate progress
  const totalDue = (loan.principalAmount || 0) + (loan.totalInterest || 0);
  const percentPaid = totalDue > 0 ? ((loan.amountPaid || 0) / totalDue) * 100 : 0;

  const fmt = (n: number | null | undefined) =>
    `Rs.${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div>
      {/* ── PRINT-ONLY RECEIPT (hidden on screen) ─────────────────────────── */}
      <div className="hidden print:block text-black bg-white p-6 max-w-[700px] mx-auto font-sans text-sm">
        {/* Shop Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {shopSettings?.shopName || "Pawn Broker"}
          </h1>
          {shopSettings?.shopAddress && (
            <p className="text-sm mt-1">{shopSettings.shopAddress}</p>
          )}
          {shopSettings?.shopPhone && (
            <p className="text-sm">Ph: {shopSettings.shopPhone}</p>
          )}
          <h2 className="text-lg font-bold uppercase mt-3 border border-black inline-block px-6 py-1">
            Loan Receipt
          </h2>
        </div>

        {/* Loan Info Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
          <div><span className="font-semibold">Loan No:</span> {loan.loanNumber}</div>
          <div><span className="font-semibold">Type:</span> {loan.loanType === "gold" ? "Gold Loan" : "Silver Loan"}</div>
          <div><span className="font-semibold">Issue Date:</span> {formatIndianDate(loan.startDate)}</div>
          <div><span className="font-semibold">Due Date:</span> {formatIndianDate(loan.dueDate)}</div>
          <div><span className="font-semibold">Status:</span> {loan.status.replace("_", " ").toUpperCase()}</div>
          <div><span className="font-semibold">Duration:</span> {loan.duration} {loan.durationUnit}</div>
        </div>

        {/* Customer Info */}
        <div className="border border-black p-3 mb-4">
          <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Customer Information</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="font-semibold">Name:</span> {loan.customerName}</div>
            {(loan as any).customerRelationType && (
              <div>
                <span className="font-semibold">Relation:</span>{" "}
                {(loan as any).customerRelationType} {(loan as any).customerRelativeName}
              </div>
            )}
            <div><span className="font-semibold">Phone:</span> {(loan as any).customerPhone || "—"}</div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border border-black p-3 mb-4">
          <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Financial Details</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="font-semibold">Principal Amount:</span> {fmt(loan.principalAmount)}</div>
            <div>
              <span className="font-semibold">Interest Rate:</span>{" "}
              {loan.interestRate}% per {loan.ratePeriod} ({loan.interestType})
            </div>
            <div><span className="font-semibold">Total Interest:</span> {fmt(loan.totalInterest)}</div>
            <div><span className="font-semibold">Total Payable:</span> {fmt(loan.totalPayable)}</div>
            <div><span className="font-semibold">Amount Paid:</span> {fmt(loan.amountPaid)}</div>
            <div className="font-bold">
              <span>Outstanding Balance:</span> {fmt(loan.outstandingBalance)}
            </div>
            {loan.penaltyRate != null && (
              <div><span className="font-semibold">Penalty Rate:</span> {loan.penaltyRate}% per month</div>
            )}
          </div>
        </div>

        {/* Pledged Items */}
        {loan.jewelleryItems && loan.jewelleryItems.length > 0 && (
          <div className="border border-black p-3 mb-4">
            <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Pledged Items</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="text-left py-1">#</th>
                  <th className="text-left py-1">Item</th>
                  <th className="text-left py-1">Purity</th>
                  <th className="text-right py-1">Gross</th>
                  <th className="text-right py-1">Net</th>
                  <th className="text-right py-1">Value</th>
                </tr>
              </thead>
              <tbody>
                {loan.jewelleryItems.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-1">{i + 1}</td>
                    <td className="py-1">{item.jewelleryType}</td>
                    <td className="py-1">{item.purity}</td>
                    <td className="text-right py-1">{item.grossWeight}g</td>
                    <td className="text-right py-1">{item.netWeight}g</td>
                    <td className="text-right py-1">{fmt(item.estimatedValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t border-black">
                  <td colSpan={5} className="pt-1">Total</td>
                  <td className="text-right pt-1">
                    {fmt(loan.jewelleryItems.reduce((s, i) => s + (i.estimatedValue || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border border-gray-400 bg-gray-50 p-3 mb-6 text-xs">
          <h3 className="font-bold uppercase tracking-wider mb-1">Terms & Disclaimer</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Interest is charged at <strong>{loan.interestRate}% per {loan.ratePeriod}</strong> on the principal amount of {fmt(loan.principalAmount)}.</li>
            <li>The pledged item(s) will be held as collateral until the full outstanding amount is cleared.</li>
            <li>In case of non-payment beyond the due date, additional penalty charges may apply at {loan.penaltyRate ?? 0}% per month.</li>
            <li>If the loan is not settled within the expiry period, the pledged items may be auctioned to recover dues.</li>
            <li>This is a computer-generated receipt. For queries, contact {shopSettings?.shopPhone || "the shop"}.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="border-t border-black pt-2 text-center text-xs">
            <p>Customer Signature</p>
          </div>
          <div className="border-t border-black pt-2 text-center text-xs">
            <p>Authorised Signatory</p>
            <p className="font-semibold mt-1">{shopSettings?.shopName || "Pawn Broker"}</p>
          </div>
        </div>
      </div>

      {/* ── SCREEN CONTENT (hidden when printing) ─────────────────────────── */}
      <div className="space-y-6 pb-20 max-w-6xl mx-auto print:hidden">
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

          {/* Delete Loan */}
          <Button
            variant="outline"
            className="print:hidden border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Delete Loan
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete loan <strong>{loan.loanNumber}</strong>?
                  This will also remove all associated payments and pledged items. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteLoan} disabled={deleteLoan.isPending}>
                  {deleteLoan.isPending ? "Deleting..." : "Yes, Delete Loan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Loan — always available (admin/manager use) */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="print:hidden bg-background" onClick={openEditDialog}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Loan Details</DialogTitle>
                <DialogDescription>Update notes, penalty rate, due date, or status. Financial amounts must be changed via Renew.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Loan Number</Label>
                  <Input
                    value={editLoanNumber}
                    onChange={e => setEditLoanNumber(e.target.value)}
                    className="font-mono"
                    placeholder="e.g. GL-2026-00001"
                  />
                  <p className="text-xs text-muted-foreground">Only change if there was an entry error.</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="partially_paid">Partially Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Expiry date will be auto-set to 1 month after the due date.</p>
                </div>
                <div className="space-y-2">
                  <Label>Penalty Rate (% per month, optional)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editPenaltyRate}
                    onChange={e => setEditPenaltyRate(e.target.value)}
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes / Remarks</Label>
                  <Textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Any internal notes about this loan..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleEditLoan}
                  disabled={updateLoan.isPending}
                  className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
                >
                  {updateLoan.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
                        <Input type="number" step="0.1" value={renewInterest} onChange={e => setRenewInterest(e.target.value)} placeholder={String(loan.interestRate)} />
                      </div>
                      <div className="space-y-2">
                        <Label>New Duration</Label>
                        <div className="flex gap-2">
                          <Input type="number" className="w-1/2" value={renewDuration} onChange={e => setRenewDuration(e.target.value)} placeholder={String(loan.duration)} />
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
                {loan.penaltyRate != null && (
                  <div>
                    <p className="text-muted-foreground mb-1">Penalty Rate</p>
                    <p className="font-medium">{loan.penaltyRate}% / month</p>
                  </div>
                )}
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

          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Notes & Remarks
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={openEditDialog}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loan.notes ? (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{loan.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added. Click Edit to add remarks.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>{/* end screen-content wrapper */}
    </div>
  );
}
