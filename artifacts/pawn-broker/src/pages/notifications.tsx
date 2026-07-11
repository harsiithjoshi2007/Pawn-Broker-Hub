import { useListLoans, useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { AlertCircle, CreditCard, FileText, Bell, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Notifications() {
  const { data: overdueLoans, isLoading: loadingOverdue } = useListLoans({
    status: "overdue",
    limit: 20,
  });

  const { data: recentPayments, isLoading: loadingPayments } = useListPayments({
    limit: 10,
  });

  const { data: recentLoans, isLoading: loadingLoans } = useListLoans({
    limit: 10,
  });

  const overdueCount = overdueLoans?.total ?? 0;

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell className="h-7 w-7 text-sidebar-primary" />
          {overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              {overdueCount > 9 ? "9+" : overdueCount}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-0.5">Alerts and recent activity.</p>
        </div>
      </div>

      {/* Overdue Alerts */}
      <Card className="shadow-sm border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive text-lg">
            <AlertCircle className="h-5 w-5" />
            Overdue Loans
            {overdueCount > 0 && (
              <Badge variant="destructive" className="ml-1">{overdueCount}</Badge>
            )}
          </CardTitle>
          <CardDescription>Loans past their due date that require immediate attention.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOverdue ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !overdueLoans || overdueLoans.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-70" />
              <p className="font-medium text-green-600">No overdue loans — all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueLoans.data.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-destructive/20 hover:border-destructive/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold">{loan.loanNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {loan.customerName ?? `Customer #${loan.customerId}`} · Due {formatIndianDate(loan.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-destructive">
                      {formatCurrency(loan.outstandingBalance)}
                    </span>
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Link href={`/loans/${loan.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {overdueLoans.total > 20 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  And {overdueLoans.total - 20} more.{" "}
                  <Link href="/loans?status=overdue" className="text-primary underline">View all overdue</Link>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-accent" />
            Recent Payments
          </CardTitle>
          <CardDescription>Last 10 payments recorded across all loans.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !recentPayments || recentPayments.data.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentPayments.data.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <p className="text-sm font-medium font-mono">{p.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.loanNumber ?? `Loan #${p.loanId}`} · {p.customerName ?? ""} · {formatIndianDate(p.paymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-accent">{formatCurrency(p.amount)}</p>
                    <p className="text-xs uppercase text-muted-foreground">{p.paymentMode.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
              <div className="pt-1 text-center">
                <Button variant="link" size="sm" asChild className="text-muted-foreground">
                  <Link href="/payments">View all payments →</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Loans */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Recent Loans
          </CardTitle>
          <CardDescription>Last 10 loans issued.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLoans ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !recentLoans || recentLoans.data.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No loans found.</p>
          ) : (
            <div className="space-y-2">
              {recentLoans.data.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold">{loan.loanNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {(loan as any).customerName ?? `Customer #${loan.customerId}`} · {formatIndianDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{formatCurrency(loan.principalAmount)}</p>
                      <Badge className={`status-${loan.status} text-xs`} variant="outline">
                        {loan.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/loans/${loan.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-1 text-center">
                <Button variant="link" size="sm" asChild className="text-muted-foreground">
                  <Link href="/loans">View all loans →</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
