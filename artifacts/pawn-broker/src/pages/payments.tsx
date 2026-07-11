import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function PaymentsList() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useListPayments({
    page,
    limit,
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Receipts</h1>
        <p className="text-muted-foreground mt-1">Global log of all incoming payments.</p>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2 bg-muted/20 border-b">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : !data || data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CreditCard className="h-8 w-8 mb-2 opacity-50" />
                        <p>No payment records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-6 font-mono text-xs font-medium text-muted-foreground">
                        {payment.receiptNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatIndianDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0 font-mono" asChild>
                          <Link href={`/loans/${payment.loanId}`}>
                            Loan #{payment.loanId} <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                          {payment.paymentMode.replace('_', ' ')}
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
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} records
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
