import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCustomer, useUpdateCustomer, getGetCustomerQueryKey, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const RELATION_OPTIONS = [
  { value: "S/o", label: "S/o — Son of" },
  { value: "D/o", label: "D/o — Daughter of" },
  { value: "W/o", label: "W/o — Wife of" },
  { value: "H/o", label: "H/o — Husband of" },
  { value: "C/o", label: "C/o — Care of" },
];

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+]+$/, "Must contain only numbers"),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  relationType: z.string().optional().or(z.literal("")),
  relativeName: z.string().optional().or(z.literal("")),
  aadhaarNumber: z.string().length(12, "Aadhaar must be exactly 12 digits").regex(/^[0-9]+$/, "Must contain only numbers").optional().or(z.literal("")),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function EditCustomer() {
  const { id } = useParams();
  const customerId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useGetCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "", phone: "", whatsapp: "", email: "",
      dateOfBirth: "", relationType: "", relativeName: "",
      aadhaarNumber: "", panNumber: "", address: "", city: "", state: "", pincode: "",
    },
  });

  useEffect(() => {
    if (customer) {
      const c = customer as any;
      form.reset({
        name:          c.name,
        phone:         c.phone,
        whatsapp:      c.whatsapp      || "",
        email:         c.email         || "",
        dateOfBirth:   c.dateOfBirth   ? c.dateOfBirth.split("T")[0] : "",
        relationType:  c.relationType  || "",
        relativeName:  c.relativeName  || "",
        aadhaarNumber: c.aadhaarNumber || "",
        panNumber:     c.panNumber     || "",
        address:       c.address       || "",
        city:          c.city          || "",
        state:         c.state         || "",
        pincode:       c.pincode       || "",
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const payload = {
        ...data,
        whatsapp:      data.whatsapp      || undefined,
        email:         data.email         || undefined,
        dateOfBirth:   data.dateOfBirth   || undefined,
        relationType:  data.relationType  || undefined,
        relativeName:  data.relativeName  || undefined,
        aadhaarNumber: data.aadhaarNumber || undefined,
        panNumber:     data.panNumber     || undefined,
      };
      const result = await updateCustomer.mutateAsync({ id: customerId, data: payload as any });
      toast({ title: "Customer Updated", description: `Profile for ${result.name} has been updated.` });
      queryClient.setQueryData(getGetCustomerQueryKey(customerId), result);
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
      setLocation(`/customers/${customerId}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to update customer", description: error.message || "An unexpected error occurred." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button asChild className="mt-4"><Link href="/customers">Back to Customers</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/customers/${customerId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground mt-1">Update profile for <span className="font-mono text-sidebar-primary">{customer.customerId}</span></p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic contact details for the customer.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Enter customer's full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Relation Type */}
              <FormField control={form.control} name="relationType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="S/o, W/o, D/o…" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Relative Name */}
              <FormField control={form.control} name="relativeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Relative's Name</FormLabel>
                  <FormControl><Input placeholder="Father / Husband / Guardian name" {...field} /></FormControl>
                  <FormDescription>Person name used in the relation</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Phone */}
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* WhatsApp */}
              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl><Input placeholder="Leave blank if same as phone" {...field} /></FormControl>
                  <FormDescription>For sending receipts and reminders</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Email */}
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="customer@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Date of Birth */}
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Identity & Address</CardTitle>
              <CardDescription>KYC documents and residential address.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl><Input placeholder="12-digit Aadhaar" maxLength={12} className="font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="panNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="ABCDE1234F" className="font-mono uppercase" {...field}
                      onChange={e => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Separator className="md:col-span-2 my-2" />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Address</FormLabel>
                  <FormControl><Input placeholder="House no, Street, Area" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town</FormLabel>
                  <FormControl><Input placeholder="City" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input placeholder="State" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl><Input placeholder="6 digits" maxLength={6} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild type="button">
              <Link href={`/customers/${customerId}`}>Cancel</Link>
            </Button>
            <Button type="submit"
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground min-w-[150px]"
              disabled={updateCustomer.isPending}>
              {updateCustomer.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
