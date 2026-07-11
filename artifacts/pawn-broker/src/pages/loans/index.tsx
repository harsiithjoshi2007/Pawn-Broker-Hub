import { useState } from "react";
import { useListLoans } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Search, Plus, Eye, Edit, FileText, AlertCircle, Skeleton, Filter } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoansList() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [loanType, setLoanType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading } = useListLoans({
    search: activeSearch || undefined,
    status: status !== "all" ? status : undefined,
    loanType: loanType !== "all" ? loanType : undefined,
    page,
    limit,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveSearch("");
    setStatus("all");
    setLoanType("all");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground mt-1">Manage active, closed, and overdue loans.</p>
        </div>
        <Button asChild className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground">
          <Link href="/loans/new">
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4 border-b bg-muted/20">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search loan no. or customer..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="w-[140px] bg-background">
                  <div className="flex items-center gap-2"><Filter className="h-3 w-3" /><SelectValue placeholder="Status" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="auction">Auction</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={loanType} onValueChange={(val) => { setLoanType(val); setPage(1); }}>
                <SelectTrigger className="w-[120px] bg-background">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" variant="secondary">Filter</Button>
              {(activeSearch || status !== "all" || loanType !== "all") && (
                <Button type="button" variant="ghost" onClick={clearFilters} className="text-muted-foreground">Clear</Button>
              )}
            </div>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Loan No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : !data || data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-8 w-8 mb-2 opacity-50" />
                        <p>No loans found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((loan) => (
                    <TableRow 
                      key={loan.id} 
                      className={`hover:bg-muted/20 transition-colors ${loan.status === 'overdue' ? 'bg-destructive/5' : ''}`}
                    >
                      <TableCell className="pl-6 font-mono text-sm font-medium">
                        {loan.loanNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/customers/${loan.customerId}`} className="hover:underline text-primary">
                          {loan.customerName || `Customer #${loan.customerId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          loan.loanType === 'gold' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-800 border border-slate-300'
                        }`}>
                          {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(loan.principalAmount)}</TableCell>
                      <TableCell className="text-sm">
                        {loan.interestRate}%/{loan.ratePeriod === 'month' ? 'mo' : loan.ratePeriod === 'year' ? 'yr' : 'day'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          {loan.status === 'overdue' && <AlertCircle className="h-3 w-3 text-destructive mr-1.5" />}
                          <span className={loan.status === 'overdue' ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {formatIndianDate(loan.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`status-${loan.status.toLowerCase()}`} variant="outline">
                          {loan.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="outline" size="sm" asChild className="h-8 shadow-sm">
                          <Link href={`/loans/${loan.id}`}>
                            View Details
                          </Link>
                        </Button>
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
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} entries
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page * limit >= data.total}
                  onClick={() => setPage(p => p + 1)}
                >
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
