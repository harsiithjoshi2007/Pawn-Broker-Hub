import { useState } from "react";
import { useComputeInterest } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Calculator as CalcIcon, Loader2, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

export default function Calculator() {
  const computeInterest = useComputeInterest();
  const [result, setResult] = useState<any>(null);

  // Form State
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("2");
  const [ratePeriod, setRatePeriod] = useState("month");
  const [interestType, setInterestType] = useState("simple");
  const [duration, setDuration] = useState("6");
  const [durationUnit, setDurationUnit] = useState("months");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal || !rate || !duration) return;

    try {
      const res = await computeInterest.mutateAsync({
        data: {
          principal: parseFloat(principal),
          interestRate: parseFloat(rate),
          ratePeriod: ratePeriod as any,
          interestType: interestType as any,
          duration: parseInt(duration, 10),
          durationUnit: durationUnit as any,
        }
      });
      setResult(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interest Calculator</h1>
        <p className="text-muted-foreground mt-1">Estimate loan payouts and view monthly breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-sidebar-primary/20">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalcIcon className="h-5 w-5 text-sidebar-primary" />
                Loan Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCalculate} className="space-y-5">
                <div className="space-y-2">
                  <Label>Principal Amount (₹)</Label>
                  <Input 
                    type="number" 
                    value={principal} 
                    onChange={e => setPrincipal(e.target.value)} 
                    className="font-mono text-xl h-12 border-sidebar-primary/30 focus-visible:ring-sidebar-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={rate} 
                      onChange={e => setRate(e.target.value)} 
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Per</Label>
                    <Select value={ratePeriod} onValueChange={setRatePeriod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input 
                      type="number" 
                      value={duration} 
                      onChange={e => setDuration(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Interest Type</Label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-md border text-sm font-medium cursor-pointer transition-colors ${interestType === 'simple' ? 'bg-sidebar-primary text-primary-foreground border-sidebar-primary' : 'bg-background hover:bg-muted'}`}>
                      <input type="radio" className="sr-only" checked={interestType === 'simple'} onChange={() => setInterestType('simple')} />
                      Simple
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-md border text-sm font-medium cursor-pointer transition-colors ${interestType === 'compound' ? 'bg-sidebar-primary text-primary-foreground border-sidebar-primary' : 'bg-background hover:bg-muted'}`}>
                      <input type="radio" className="sr-only" checked={interestType === 'compound'} onChange={() => setInterestType('compound')} />
                      Compound
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 mt-4 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white font-bold shadow-md" disabled={computeInterest.isPending}>
                  {computeInterest.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Calculate"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full h-12 border-dashed border-2">
            <Link href="/loans/new">
              Use these terms for a new loan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-sidebar text-sidebar-foreground border-none shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-white/70 mb-1">Principal</p>
                    <p className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(parseFloat(principal))}</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/10 border-accent/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-accent/80 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-accent">{formatCurrency(result.totalInterest)}</p>
                  </CardContent>
                </Card>
                <Card className="border-sidebar-primary shadow-md relative overflow-hidden ring-1 ring-sidebar-primary/20">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-sidebar-primary/10 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Payable</p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-sidebar-primary">{formatCurrency(result.totalPayable)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="bg-muted/20 border-b pb-4">
                  <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
                  <CardDescription>Projected interest accumulation over the term</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm shadow-sm">
                        <TableRow>
                          <TableHead className="pl-6 w-24">Period</TableHead>
                          <TableHead className="text-right">Interest Accum.</TableHead>
                          <TableHead className="text-right pr-6 font-bold text-foreground">Ending Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.monthlyBreakdown?.map((month: any, i: number) => (
                          <TableRow key={i} className="hover:bg-muted/30">
                            <TableCell className="pl-6 font-medium text-muted-foreground">Month {month.period}</TableCell>
                            <TableCell className="text-right font-mono text-sm">+{formatCurrency(month.interest)}</TableCell>
                            <TableCell className="text-right pr-6 font-mono text-sm font-bold">{formatCurrency(month.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[400px] rounded-xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CalcIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground/80 mb-2">Ready to Calculate</h3>
              <p className="max-w-xs">Enter your loan parameters on the left and click calculate to see the projection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
