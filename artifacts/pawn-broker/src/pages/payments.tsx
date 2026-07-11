import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { CreditCard, ArrowUpRight, Search, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function PaymentsList() {
  const [page, setPage] = useState(1);
  const limit = 20;

  // Search / filter state
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const hasFilters = activeSearch || mode !== "all" || from || to;

  const { data, isLoading } = useListPayments({
    search: activeSearch || undefined,
    mode: mode !== "all" ? mode : undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setActiveSearch("");
    setMode("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const modeLabel: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Receipts</h1>
        <p className="text-muted-foreground mt-1">Search and filter all incoming payments.</p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4 border-b bg-muted/20">
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Search row */}
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search receipt no. or loan no.…"
                  className="pl-9 bg-background"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" className="shrink-0">
                <Filter className="h-4 w-4 mr-1.5" /> Filter
              </Button>
              {hasFilters && (
                <Button type="button" variant="ghost" onClick={clearFilters} className="text-muted-foreground shrink-0">
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                <Select value={mode} onValueChange={(v) => { setMode(v); setPage(1); }}>
                  <SelectTrigger className="w-[150px] bg-background h-9">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <Input
                  type="date"
                  className="w-[145px] bg-background h-9 text-sm"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  className="w-[145px] bg-background h-9 text-sm"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Receipt No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Loan No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right pr-6 font-bold">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : !data || data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CreditCard className="h-8 w-8 mb-2 opacity-50" />
                        <p>{hasFilters ? "No payments match your filters" : "No payment records found"}</p>
                        {hasFilters && (
                          <Button variant="link" onClick={clearFilters} className="mt-1">Clear filters</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6 font-mono text-xs font-medium text-muted-foreground">
                        {payment.receiptNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatIndianDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0 font-mono text-xs" asChild>
                          <Link href={`/loans/${payment.loanId}`}>
                            {payment.loanNumber ?? `#${payment.loanId}`}
                            <ArrowUpRight className="ml-0.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.customerName ? (
                          <span className="text-foreground">{payment.customerName}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                          {modeLabel[payment.paymentMode] ?? payment.paymentMode.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(payment.interestPaid)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(payment.principalPaid)}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-mono text-sm font-bold text-accent">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.total > limit && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, data.total)} of {data.total} records
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page * limit >= data.total} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
