import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListCustomers, useCreateLoan, useGetCustomer, getGetCustomerQueryKey, getListLoansQueryKey, useComputeInterest } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Search, Calculator, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const jewelleryItemSchema = z.object({
  jewelleryType: z.string().min(1, "Type is required"),
  category: z.string().optional().or(z.literal("")),
  grossWeight: z.coerce.number().min(0.1, "Must be > 0"),
  stoneWeight: z.coerce.number().optional().default(0),
  netWeight: z.coerce.number().optional().default(0),
  purity: z.string().min(1, "Purity required"),
  estimatedValue: z.coerce.number().min(1, "Value required"),
  marketValue: z.coerce.number().optional(),
});

const loanSchema = z.object({
  customerId: z.number({ required_error: "Please select a customer" }),
  loanType: z.enum(["gold", "silver"]),
  principalAmount: z.coerce.number().min(100, "Amount must be at least ₹100"),
  interestRate: z.coerce.number().min(0.1, "Rate required"),
  ratePeriod: z.enum(["day", "month", "year"]),
  interestType: z.enum(["simple", "compound"]),
  duration: z.coerce.number().min(1, "Duration required"),
  durationUnit: z.enum(["days", "months", "years"]),
  penaltyRate: z.coerce.number().optional().default(0),
  notes: z.string().optional().or(z.literal("")),
  jewelleryItems: z.array(jewelleryItemSchema).min(1, "At least one item required"),
});

type LoanFormValues = z.infer<typeof loanSchema>;

function parseUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    customerId: p.get('customerId') ? parseInt(p.get('customerId')!) : null,
    principal: p.get('principal') ? parseFloat(p.get('principal')!) : null,
    rate: p.get('rate') ? parseFloat(p.get('rate')!) : null,
    ratePeriod: p.get('ratePeriod') || null,
    interestType: p.get('interestType') || null,
    duration: p.get('duration') ? parseInt(p.get('duration')!) : null,
    durationUnit: p.get('durationUnit') || null,
  };
}

export default function NewLoan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlParams = parseUrlParams();

  const [step, setStep] = useState(urlParams.customerId ? 2 : 1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Auto-load customer from URL param (e.g. coming from customer detail page)
  const urlCustomerId = urlParams.customerId ?? 0;
  const { data: urlCustomer } = useGetCustomer(urlCustomerId, {
    query: {
      queryKey: getGetCustomerQueryKey(urlCustomerId),
      enabled: !!urlParams.customerId,
    },
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useListCustomers(
    { search: customerSearch, limit: 5 },
    { query: { queryKey: ['listCustomers', customerSearch], enabled: step === 1 && customerSearch.length > 1 } }
  );

  const createLoan = useCreateLoan();
  const computeInterest = useComputeInterest();

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      customerId: urlParams.customerId ?? 0,
      loanType: "gold",
      principalAmount: urlParams.principal ?? 0,
      interestRate: urlParams.rate ?? 2,
      ratePeriod: (urlParams.ratePeriod as any) ?? "month",
      interestType: (urlParams.interestType as any) ?? "simple",
      duration: urlParams.duration ?? 6,
      durationUnit: (urlParams.durationUnit as any) ?? "months",
      penaltyRate: 0,
      notes: "",
      jewelleryItems: [
        {
          jewelleryType: "",
          category: "",
          grossWeight: 0,
          stoneWeight: 0,
          netWeight: 0,
          purity: "22K",
          estimatedValue: 0,
        }
      ],
    },
  });

  // Set selected customer once URL customer data loads (e.g. "New Loan" from customer detail page)
  useEffect(() => {
    if (urlCustomer && !selectedCustomer) {
      setSelectedCustomer(urlCustomer);
    }
  }, [urlCustomer]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "jewelleryItems",
  });

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValue("customerId", customer.id);
    setStep(2);
  };

  // Watch values for live calculation
  const watchPrincipal = form.watch("principalAmount");
  const watchRate = form.watch("interestRate");
  const watchRatePeriod = form.watch("ratePeriod");
  const watchDuration = form.watch("duration");
  const watchDurationUnit = form.watch("durationUnit");
  const watchInterestType = form.watch("interestType");

  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Use a debounced or manual calculation here instead of automatic to save API calls
  const performCalculation = async () => {
    if (!watchPrincipal || !watchRate || !watchDuration) return;
    
    setIsCalculating(true);
    try {
      const res = await computeInterest.mutateAsync({
        data: {
          principal: watchPrincipal,
          interestRate: watchRate,
          ratePeriod: watchRatePeriod,
          interestType: watchInterestType,
          duration: watchDuration,
          durationUnit: watchDurationUnit,
        }
      });
      setCalcResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: LoanFormValues) => {
    try {
      // Fix undefined vs empty string issues
      const payload = {
        ...data,
        notes: data.notes || undefined,
        jewelleryItems: data.jewelleryItems.map(item => ({
          ...item,
          category: item.category || undefined,
          stoneWeight: item.stoneWeight || undefined,
          netWeight: item.netWeight || item.grossWeight - (item.stoneWeight || 0),
          marketValue: item.marketValue || undefined,
        }))
      };

      const result = await createLoan.mutateAsync({ data: payload });
      
      toast({
        title: "Loan Created Successfully",
        description: `Loan ${result.loanNumber} has been recorded.`,
      });
      
      queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
      setLocation(`/loans/${result.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create loan",
        description: error.message || "An unexpected error occurred. Check all required fields.",
      });
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger("jewelleryItems");
    if (isValid) {
      setStep(3);
      performCalculation();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
          <Link href="/loans"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue New Loan</h1>
          <p className="text-muted-foreground mt-1">Record a new gold or silver loan.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center w-full max-w-3xl">
          <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-sidebar-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 1 ? 'bg-sidebar-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : "1"}
            </div>
            <span className="text-sm font-medium">Customer</span>
          </div>
          <div className={`h-1 flex-1 transition-colors ${step >= 2 ? 'bg-sidebar-primary' : 'bg-muted'}`} />
          <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-sidebar-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 2 ? 'bg-sidebar-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
              {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : "2"}
            </div>
            <span className="text-sm font-medium">Items</span>
          </div>
          <div className={`h-1 flex-1 transition-colors ${step >= 3 ? 'bg-sidebar-primary' : 'bg-muted'}`} />
          <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-sidebar-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 3 ? 'bg-sidebar-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
            <span className="text-sm font-medium">Terms</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="shadow-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
            <CardDescription>Search for an existing customer or add a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone, or ID..." 
                className="pl-10 h-12 text-lg bg-muted/30"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>

            {customerSearch.length > 1 && (
              <div className="border rounded-md divide-y overflow-hidden shadow-sm">
                {isLoadingCustomers ? (
                  <div className="p-4 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Searching...
                  </div>
                ) : customersData?.data.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No customers found matching "{customerSearch}"
                  </div>
                ) : (
                  customersData?.data.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="p-4 hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors"
                      onClick={() => selectCustomer(customer)}
                    >
                      <div>
                        <div className="font-medium text-lg">{customer.name}</div>
                        <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                          <span className="font-mono">{customer.customerId}</span>
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="rounded-full h-8 w-8 p-0 shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center gap-4 py-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground uppercase font-medium tracking-wider">OR</span>
              <Separator className="flex-1" />
            </div>

            <div className="flex justify-center">
              <Button asChild variant="outline" className="h-12 px-6">
                <Link href="/customers/new">
                  <Plus className="mr-2 h-4 w-4" /> Register New Customer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCustomer && step > 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Selected Customer Summary Card */}
            <Card className="bg-sidebar text-sidebar-foreground border-none shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <CardContent className="p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-sidebar-primary rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedCustomer.name}</h3>
                    <p className="text-sm text-sidebar-foreground/80 font-mono mt-0.5">{selectedCustomer.customerId} • {selectedCustomer.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent">
                  Change
                </Button>
              </CardContent>
            </Card>

            {step === 2 && (
              <Card className="shadow-sm border-border/50 animate-in fade-in slide-in-from-right-8 duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Jewellery Items</CardTitle>
                    <CardDescription>Add all items being pledged for this loan.</CardDescription>
                  </div>
                  <Button type="button" onClick={() => append({
                    jewelleryType: "", category: "", grossWeight: 0, stoneWeight: 0, netWeight: 0, purity: "22K", estimatedValue: 0
                  })} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 mt-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-5 border border-border/60 rounded-lg bg-card shadow-sm relative group">
                      <div className="absolute -top-3 -left-3 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>
                      
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-3 -right-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`jewelleryItems.${index}.jewelleryType`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Item Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Ring, Chain, Bangle" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`jewelleryItems.${index}.purity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purity</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="24K">24K (99.9%)</SelectItem>
                                  <SelectItem value="22K">22K (91.6%)</SelectItem>
                                  <SelectItem value="18K">18K (75.0%)</SelectItem>
                                  <SelectItem value="14K">14K (58.3%)</SelectItem>
                                  <SelectItem value="Silver">Silver</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`jewelleryItems.${index}.grossWeight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gross Wt. (g)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`jewelleryItems.${index}.stoneWeight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stone Wt. (g)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`jewelleryItems.${index}.estimatedValue`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Estimated Value (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" className="font-mono text-lg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground" onClick={nextStep}>
                      Continue to Terms <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle>Loan Terms</CardTitle>
                      <CardDescription>Financial details for this agreement.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="loanType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Metal Type</FormLabel>
                            <FormControl>
                              <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === 'gold' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-border bg-card hover:bg-muted'}`}>
                                  <input type="radio" value="gold" checked={field.value === 'gold'} onChange={() => field.onChange('gold')} className="sr-only" />
                                  <span className="font-bold text-lg">Gold Loan</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${field.value === 'silver' ? 'border-slate-400 bg-slate-100 text-slate-800' : 'border-border bg-card hover:bg-muted'}`}>
                                  <input type="radio" value="silver" checked={field.value === 'silver'} onChange={() => field.onChange('silver')} className="sr-only" />
                                  <span className="font-bold text-lg">Silver Loan</span>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <FormField
                          control={form.control}
                          name="principalAmount"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-lg">Principal Amount (₹) <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" className="font-mono text-2xl h-14" {...field} onBlur={(e) => { field.onBlur(); performCalculation(); }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interest Rate (%) <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" className="font-mono" {...field} onBlur={(e) => { field.onBlur(); performCalculation(); }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ratePeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate Period</FormLabel>
                              <Select value={field.value} onValueChange={(v) => { field.onChange(v); performCalculation(); }}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="month">Per Month</SelectItem>
                                  <SelectItem value="year">Per Year</SelectItem>
                                  <SelectItem value="day">Per Day</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onBlur={(e) => { field.onBlur(); performCalculation(); }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="durationUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration Unit</FormLabel>
                              <Select value={field.value} onValueChange={(v) => { field.onChange(v); performCalculation(); }}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="shadow-lg border-sidebar-primary/20 bg-sidebar-primary/5">
                    <CardHeader className="bg-sidebar-primary text-primary-foreground rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" /> 
                        Summary Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Button type="button" variant="outline" className="w-full bg-white mb-2" onClick={performCalculation} disabled={isCalculating}>
                          {isCalculating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
                          Recalculate
                        </Button>

                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground font-medium">Principal</span>
                          <span className="font-mono text-lg font-bold">{formatCurrency(watchPrincipal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-muted-foreground font-medium">Est. Interest</span>
                          <span className="font-mono text-lg text-destructive font-medium">
                            {calcResult ? `+ ${formatCurrency(calcResult.totalInterest)}` : "-"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3">
                          <span className="font-bold text-foreground">Total Payable</span>
                          <span className="font-mono text-2xl font-black text-sidebar-primary">
                            {calcResult ? formatCurrency(calcResult.totalPayable) : formatCurrency(watchPrincipal)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-4 rounded-b-lg border-t border-border/50">
                      <p className="text-xs text-muted-foreground text-center w-full">
                        This is an estimate based on full term completion without early payments.
                      </p>
                    </CardFooter>
                  </Card>

                  <div className="flex flex-col gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-12 w-full">
                      Back to Items
                    </Button>
                    <Button type="submit" className="h-14 w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground text-lg font-bold shadow-md hover:shadow-lg transition-all" disabled={createLoan.isPending}>
                      {createLoan.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Loan...</>
                      ) : (
                        <><Save className="mr-2 h-5 w-5" /> Confirm & Issue Loan</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      )}
    </div>
  );
}

// Needed imports workaround
import { ArrowRight } from "lucide-react";
