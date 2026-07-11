import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  useListCustomers, useListLoans,
  getListCustomersQueryKey, getListLoansQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, FileText, X } from "lucide-react";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debouncedQuery.length >= 2;

  const customerParams = { search: debouncedQuery, limit: 4 };
  const loanParams    = { search: debouncedQuery, limit: 4 };

  const { data: customers } = useListCustomers(
    customerParams,
    { query: { queryKey: getListCustomersQueryKey(customerParams), enabled } }
  );

  const { data: loans } = useListLoans(
    loanParams,
    { query: { queryKey: getListLoansQueryKey(loanParams), enabled } }
  );

  const hasResults =
    (customers?.data?.length ?? 0) > 0 || (loans?.data?.length ?? 0) > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigate = (path: string) => {
    setLocation(path);
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-md relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Search customers or loans…"
        className="w-full pl-9 pr-8 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {query && (
        <button
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          onClick={() => { setQuery(""); setDebouncedQuery(""); setOpen(false); }}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && enabled && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for "{debouncedQuery}"
            </div>
          ) : (
            <div className="py-1">
              {(customers?.data?.length ?? 0) > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40">
                    Customers
                  </p>
                  {customers!.data.map((c) => (
                    <button
                      key={c.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      <div className="h-7 w-7 rounded-full bg-sidebar-primary/15 text-sidebar-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone} · {c.customerId}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {(loans?.data?.length ?? 0) > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40">
                    Loans
                  </p>
                  {loans!.data.map((l) => (
                    <button
                      key={l.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => navigate(`/loans/${l.id}`)}
                    >
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-medium leading-tight">{l.loanNumber}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {(l as any).customerName ?? `Customer #${l.customerId}`} · {l.status.replace("_", " ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
