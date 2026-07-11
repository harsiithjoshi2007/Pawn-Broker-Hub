import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, AlertCircle, IndianRupee, TrendingUp, Briefcase, Gavel, ArrowRight, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const COLORS = {
  gold: "hsl(var(--sidebar-primary))",
  silver: "hsl(var(--muted-foreground))",
  active: "hsl(var(--accent))",
  overdue: "hsl(var(--destructive))",
  closed: "hsl(var(--muted-foreground))",
  auction: "hsl(var(--chart-5))",
  partially_paid: "hsl(var(--chart-3))",
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4 mb-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusData = stats.loanStatusBreakdown.map((item) => ({
    name: item.status.replace("_", " ").toUpperCase(),
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || COLORS.active,
  }));

  const totalMetalLoans = stats.goldLoansCount + stats.silverLoansCount;
  const goldPercent = totalMetalLoans ? (stats.goldLoansCount / totalMetalLoans) * 100 : 0;
  const silverPercent = totalMetalLoans ? (stats.silverLoansCount / totalMetalLoans) * 100 : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground">
            <Link href="/loans/new">New Loan</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Active Loans" value={stats.totalActiveLoans} icon={FileText} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard title="Overdue Loans" value={stats.totalOverdueLoans} icon={AlertCircle} color="text-destructive" bgColor="bg-destructive/10" />
        <MetricCard title="Today's Collection" value={formatCurrency(stats.todayCollection)} icon={IndianRupee} color="text-accent" bgColor="bg-accent/10" />
        <MetricCard title="Monthly Income" value={formatCurrency(stats.monthlyIncome)} icon={TrendingUp} color="text-sidebar-primary" bgColor="bg-sidebar-primary/10" />
        <MetricCard title="Loan Portfolio" value={formatCurrency(stats.loanPortfolioValue)} icon={Briefcase} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard title="Auction Loans" value={stats.totalAuctionLoans} icon={Gavel} color="text-chart-5" bgColor="bg-chart-5/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Monthly Disbursements</CardTitle>
              <CardDescription>Loan amounts given out over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyDisbursement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Loans</CardTitle>
                <CardDescription>Latest 10 loans issued</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/loans">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>Loan No.</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentLoans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent loans</TableCell>
                      </TableRow>
                    ) : (
                      stats.recentLoans.slice(0, 5).map((loan) => (
                        <TableRow key={loan.id} className="border-border/50">
                          <TableCell className="font-mono text-xs">{loan.loanNumber}</TableCell>
                          <TableCell className="font-medium">{loan.customerName || `Customer #${loan.customerId}`}</TableCell>
                          <TableCell className="font-mono text-sm">{formatCurrency(loan.principalAmount)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatIndianDate(loan.createdAt)}</TableCell>
                          <TableCell>
                            <Badge className={`status-${loan.status.toLowerCase()}`} variant="outline">
                              {loan.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Split</CardTitle>
              <CardDescription>Gold vs Silver loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-sidebar-primary">Gold ({stats.goldLoansCount})</span>
                  <span className="font-medium text-muted-foreground">Silver ({stats.silverLoansCount})</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-sidebar-primary transition-all duration-500" style={{ width: `${goldPercent}%` }} />
                  <div className="h-full bg-muted-foreground transition-all duration-500" style={{ width: `${silverPercent}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Loan Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, "Loans"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {stats.totalOverdueLoans > 0 && (
            <Card className="shadow-sm border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                  <AlertCircle className="h-5 w-5" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-4">
                  You have <strong className="text-destructive font-bold">{stats.totalOverdueLoans}</strong> loans that are currently overdue.
                </p>
                <Button variant="destructive" className="w-full shadow-sm" asChild>
                  <Link href="/loans?status=overdue">View Overdue Loans</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-foreground/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight mt-1 text-foreground">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
