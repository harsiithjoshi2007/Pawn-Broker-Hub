/**
 * Tests for refetch-on-reconnect behaviour.
 *
 * Verifies that React Query re-fetches stale active queries when
 * onlineManager transitions from offline → online. This is the mechanism
 * that ensures staff always see fresh loan/customer data after reconnecting.
 *
 * These tests exercise React Query's QueryClient and QueryObserver APIs
 * directly — no React components or native modules needed.
 */

import { QueryClient, QueryObserver, onlineManager } from '@tanstack/react-query';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,           // always stale → will refetch on reconnect
        gcTime: 60_000,
        retry: false,           // don't mask failures with retries in tests
        networkMode: 'offlineFirst',
        refetchOnReconnect: true,
      },
    },
  });
}

/**
 * Resolves once the query settles (not pending/loading).
 * Polls every 20 ms up to `timeoutMs`.
 */
function waitForQuery(
  client: QueryClient,
  key: unknown[],
  timeoutMs = 3000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    function check() {
      const state = client.getQueryState(key);
      if (state && state.status !== 'pending') {
        resolve();
      } else if (Date.now() >= deadline) {
        reject(
          new Error(
            `Query ${JSON.stringify(key)} did not settle within ${timeoutMs}ms` +
              ` (state=${JSON.stringify(state?.status)})`,
          ),
        );
      } else {
        setTimeout(check, 20);
      }
    }

    check();
  });
}

/**
 * Waits until the fetch function has been called at least `count` times.
 */
function waitForCalls(
  fn: jest.Mock,
  count: number,
  timeoutMs = 3000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    function check() {
      if (fn.mock.calls.length >= count) {
        resolve();
      } else if (Date.now() >= deadline) {
        reject(
          new Error(
            `Expected ${count} call(s) but got ${fn.mock.calls.length} after ${timeoutMs}ms`,
          ),
        );
      } else {
        setTimeout(check, 20);
      }
    }

    check();
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('refetch-on-reconnect behaviour', () => {
  let client: QueryClient;

  beforeEach(() => {
    client = makeClient();
    // mount() subscribes the client to onlineManager events —
    // without this, setOnline(true) does not trigger refetches.
    client.mount();
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    client.clear();
    client.unmount();
    onlineManager.setOnline(true);
  });

  // ── Loan list ─────────────────────────────────────────────────────────────

  describe('loan list query', () => {
    const QUERY_KEY = ['loans', 'list'];

    it('refetches active stale query when coming back online', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ data: [], total: 0 });

      // Activate the query via an observer (simulates a mounted <LoansScreen>)
      const observer = new QueryObserver(client, {
        queryKey: QUERY_KEY,
        queryFn: fetchFn,
      });
      const unsub = observer.subscribe(() => {});

      // Wait for the initial fetch to complete
      await waitForQuery(client, QUERY_KEY);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Simulate going offline, then coming back online
      onlineManager.setOnline(false);
      onlineManager.setOnline(true);

      // onlineManager.subscribe fires, client.#queryCache.onOnline() triggers
      // observer to refetch — wait for the second call
      await waitForCalls(fetchFn, 2);

      unsub();
    });

    it('serves cached data immediately when offline', () => {
      const seed = { data: [{ id: 1, status: 'active' }], total: 1 };
      client.setQueryData(QUERY_KEY, seed);

      onlineManager.setOnline(false);

      // Cache must remain intact — staff can still browse loans offline
      expect(client.getQueryData(QUERY_KEY)).toEqual(seed);
    });

    it('does NOT refetch when the observer is unmounted (inactive query)', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ data: [], total: 0 });

      const observer = new QueryObserver(client, {
        queryKey: QUERY_KEY,
        queryFn: fetchFn,
      });
      const unsub = observer.subscribe(() => {});
      await waitForQuery(client, QUERY_KEY);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Unmount — observer becomes inactive
      unsub();

      onlineManager.setOnline(false);
      onlineManager.setOnline(true);

      // Give React Query time to process the reconnect event
      await new Promise((r) => setTimeout(r, 100));

      // Inactive queries must NOT be auto-refetched
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  // ── Customer list ─────────────────────────────────────────────────────────

  describe('customer list query', () => {
    const QUERY_KEY = ['customers', 'list'];

    it('refetches active stale query when coming back online', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ data: [], total: 0 });

      const observer = new QueryObserver(client, {
        queryKey: QUERY_KEY,
        queryFn: fetchFn,
      });
      const unsub = observer.subscribe(() => {});

      await waitForQuery(client, QUERY_KEY);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      onlineManager.setOnline(false);
      onlineManager.setOnline(true);

      await waitForCalls(fetchFn, 2);

      unsub();
    });

    it('serves cached customer data immediately when offline', () => {
      const seed = { data: [{ id: 7, name: 'Priya Sharma' }], total: 1 };
      client.setQueryData(QUERY_KEY, seed);

      onlineManager.setOnline(false);

      expect(client.getQueryData(QUERY_KEY)).toEqual(seed);
    });
  });

  // ── Multiple concurrent queries ───────────────────────────────────────────

  it('refetches both loans and customers when reconnecting with both active', async () => {
    const loanFetch = jest.fn().mockResolvedValue({ data: [], total: 0 });
    const customerFetch = jest.fn().mockResolvedValue({ data: [], total: 0 });

    const loanObserver = new QueryObserver(client, {
      queryKey: ['loans', 'list'],
      queryFn: loanFetch,
    });
    const customerObserver = new QueryObserver(client, {
      queryKey: ['customers', 'list'],
      queryFn: customerFetch,
    });

    const unsubLoan = loanObserver.subscribe(() => {});
    const unsubCustomer = customerObserver.subscribe(() => {});

    await Promise.all([
      waitForQuery(client, ['loans', 'list']),
      waitForQuery(client, ['customers', 'list']),
    ]);
    expect(loanFetch).toHaveBeenCalledTimes(1);
    expect(customerFetch).toHaveBeenCalledTimes(1);

    onlineManager.setOnline(false);
    onlineManager.setOnline(true);

    await Promise.all([
      waitForCalls(loanFetch, 2),
      waitForCalls(customerFetch, 2),
    ]);

    unsubLoan();
    unsubCustomer();
  });
});
