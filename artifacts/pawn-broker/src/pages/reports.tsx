import { useState } from "react";
import { useGetCollectionReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileBarChart, Loader2, ArrowRight } from "lucide-react";

export default function Reports() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loanType, setLoanType] = useState<string>("all");

  const [activeParams, setActiveParams] = useState({
    from: fromDate,
    to: toDate,
    loanType: "all"
  });

  const { data: report, isLoading, isFetching } = useGetCollectionReport({
    from: activeParams.from,
    to: activeParams.to,
    loanType: activeParams.loanType !== "all" ? activeParams.loanType : undefined,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveParams({ from: fromDate, to: toDate, loanType });
  };

  const handleExportCSV = () => {
    if (!report || report.payments.length === 0) return;
    const headers = ['Date', 'Receipt No.', 'Loan No.', 'Mode', 'Interest (INR)', 'Principal (INR)', 'Total Amount (INR)'];
    const rows = report.payments.map((p: any) => [
      p.paymentDate,
      p.receiptNumber,
      p.loanNumber || `#${p.loanId}`,
      p.paymentMode.replace('_', ' ').toUpperCase(),
      p.interestPaid,
      p.principalPaid,
      p.amount,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection-report-${activeParams.from}-to-${activeParams.to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection Report</h1>
          <p className="text-muted-foreground mt-1">Generate reports on cash flow and payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!report || report.payments.length === 0} className="bg-background print:hidden" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" disabled={!report || report.payments.length === 0} className="bg-background print:hidden" onClick={handleExportPDF}>
            <FileBarChart className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 bg-card">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-end gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full flex-1">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Loan Type Filter</Label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="gold">Gold Only</SelectItem>
                    <SelectItem value="silver">Silver Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto bg-sidebar-primary hover:bg-sidebar-primary/90 text-white min-w-[120px]" disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : report ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-sidebar-primary/20 bg-sidebar-primary/5">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Collected</p>
                <p className="text-2xl font-bold font-mono tracking-tight text-sidebar-primary">{formatCurrency(report.totalCollected)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Interest Revenue</p>
                <p className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(report.totalInterestCollected)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Principal Recovered</p>
                <p className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(report.totalPrincipalCollected)}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Transactions</p>
                <p className="text-2xl font-bold font-mono tracking-tight">{report.transactionCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="text-lg">Transaction Log</CardTitle>
              <CardDescription>
                {formatIndianDate(activeParams.from)} to {formatIndianDate(activeParams.to)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">Date</TableHead>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Loan No.</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right pr-6 font-bold">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                          No transactions found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/20">
                          <TableCell className="pl-6 text-sm">{formatIndianDate(payment.paymentDate)}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{payment.receiptNumber}</TableCell>
                          <TableCell className="font-mono text-xs">{payment.loanNumber || `#${payment.loanId}`}</TableCell>
                          <TableCell>
                            <span className="uppercase text-[10px] font-medium px-2 py-0.5 bg-muted rounded border border-border">
                              {payment.paymentMode.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(payment.interestPaid)}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(payment.principalPaid)}</TableCell>
                          <TableCell className="text-right pr-6 font-mono text-sm font-bold text-accent">{formatCurrency(payment.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
