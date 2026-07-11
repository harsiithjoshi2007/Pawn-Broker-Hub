import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth';
import { AppLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Customers from '@/pages/customers/index';
import NewCustomer from '@/pages/customers/new';
import CustomerDetail from '@/pages/customers/[id]';
import EditCustomer from '@/pages/customers/[id]/edit';
import Loans from '@/pages/loans/index';
import NewLoan from '@/pages/loans/new';
import LoanDetail from '@/pages/loans/[id]';
import Payments from '@/pages/payments';
import Calculator from '@/pages/calculator';
import Reports from '@/pages/reports';
import Settings from '@/pages/settings';
import Notifications from '@/pages/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/:rest*">
        <ErrorBoundary>
          <AppLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/customers/new" component={NewCustomer} />
              <Route path="/customers/:id/edit" component={EditCustomer} />
              <Route path="/customers/:id" component={CustomerDetail} />
              <Route path="/customers" component={Customers} />
              <Route path="/loans/new" component={NewLoan} />
              <Route path="/loans/:id" component={LoanDetail} />
              <Route path="/loans" component={Loans} />
              <Route path="/payments" component={Payments} />
              <Route path="/calculator" component={Calculator} />
              <Route path="/reports" component={Reports} />
              <Route path="/settings" component={Settings} />
              <Route path="/notifications" component={Notifications} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ErrorBoundary>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </WouterRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
