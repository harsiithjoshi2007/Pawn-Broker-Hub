---
name: Wouter routing pattern for this app
description: How to correctly structure Wouter v3 routes with auth guard and ErrorBoundary
---

## The correct pattern

Use a `ProtectedLayout` component (NOT `/:rest*` catch-all wrapping AppLayout):

```tsx
function ProtectedLayout() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  useEffect(() => { if (!user) setLocation('/login'); }, [user, setLocation]);
  if (!user) return null;
  return (
    <AppLayout>
      <ErrorBoundary key={location}>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/customers/new" component={NewCustomer} />
          ...
        </Switch>
      </ErrorBoundary>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/"><Redirect to="/dashboard" /></Route>
      <Route><ProtectedLayout /></Route>  {/* catch-all, no path */}
    </Switch>
  );
}
```

**Why:** Using `<Route path="/:rest*">` wrapping both ErrorBoundary and AppLayout caused blank pages for specific routes (customers/new, loans/new). Root causes were hard to isolate but include ErrorBoundary persisting stale error state AND potential Wouter nested-context edge cases. The `ProtectedLayout` pattern is cleaner: AppLayout never remounts on navigation, ErrorBoundary wraps only the page Switch and resets via `key={location}` on each nav.

**How to apply:** Any new protected page just needs a `<Route path="/newpage" component={NewPage} />` inside the Switch in ProtectedLayout. Auth is handled centrally.
