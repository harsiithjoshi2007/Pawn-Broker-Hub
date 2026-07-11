import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      setLocation("/dashboard");
    } catch (error) {
      form.setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-sidebar relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sidebar-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sidebar-primary/20 blur-[150px]" />
      </div>

      <div className="w-full max-w-md p-8 md:p-10 bg-card rounded-2xl shadow-2xl border border-border/50 relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-sidebar-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sidebar-primary/20 rotate-12 transition-transform hover:rotate-0 duration-300">
            <Diamond className="h-8 w-8 text-white -rotate-12 hover:rotate-0 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">Pawn Broker</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Professional Gold & Silver Management</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@pawnbroker.com" className="h-12 bg-muted/50 border-border/50 focus-visible:ring-sidebar-primary/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-foreground/80 font-medium">Password</FormLabel>
                    <a href="#" className="text-sm text-sidebar-primary hover:text-sidebar-primary/80 transition-colors font-medium">Forgot password?</a>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="h-12 bg-muted/50 border-border/50 focus-visible:ring-sidebar-primary/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium text-center">{form.formState.errors.root.message}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-sidebar-primary hover:bg-sidebar-primary/90 text-primary-foreground font-bold shadow-lg shadow-sidebar-primary/20 transition-all active:scale-[0.98]" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : "Sign In to Workspace"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
