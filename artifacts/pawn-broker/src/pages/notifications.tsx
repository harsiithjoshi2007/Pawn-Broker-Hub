import { useState } from "react";
import { useListLoans, useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatIndianDate } from "@/lib/utils";
import { AlertCircle, CreditCard, FileText, Bell, CheckCircle2, MessageSquare, Loader2, Send, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { toast } = useToast();
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [sendingIds, setSendingIds]   = useState<Set<number>>(new Set());
  const [sendingAll, setSendingAll]   = useState(false);
  const [sendBanner, setSendBanner]   = useState<{ type: "success" | "error"; text: string } | null>(null);
  // WhatsApp "Send All" — list of wa.me links shown for manual sending
  const [waLinks, setWaLinks] = useState<{ loanNumber: string; customerName: string; waLink: string; skipped?: boolean }[]>([]);
  const [showWaDialog, setShowWaDialog] = useState(false);

  const { data: overdueLoans,   isLoading: loadingOverdue   } = useListLoans({ status: "overdue", limit: 20 });
  const { data: recentPayments, isLoading: loadingPayments  } = useListPayments({ limit: 10 });
  const { data: recentLoans,    isLoading: loadingLoans     } = useListLoans({ limit: 10 });

  const overdueCount = overdueLoans?.total ?? 0;

  // ── Individual Remind button ───────────────────────────────────────────────
  const sendReminder = async (loanId: number) => {
    setSendingIds(prev => new Set([...prev, loanId]));
    setSendBanner(null);
    try {
      const res  = await fetch(`/api/messages/send/${loanId}`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      if (channel === "whatsapp" && data.waLink) {
        // Open WhatsApp in a new tab — message is pre-filled, staff just taps Send
        window.open(data.waLink, "_blank", "noopener,noreferrer");
        setSendBanner({ type: "success", text: "WhatsApp opened with message pre-filled — just tap Send." });
      } else {
        setSendBanner({ type: "success", text: `SMS sent to ${data.to}` });
      }
    } catch (e: any) {
      setSendBanner({ type: "error", text: e.message });
    } finally {
      setSendingIds(prev => { const n = new Set(prev); n.delete(loanId); return n; });
    }
  };

  // ── Send All ───────────────────────────────────────────────────────────────
  const sendAllReminders = async () => {
    setSendingAll(true);
    setSendBanner(null);
    try {
      const res  = await fetch("/api/messages/send-overdue", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      if (data.whatsapp) {
        // Show a dialog listing all wa.me links for staff to open one by one
        setWaLinks(data.waLinks ?? []);
        setShowWaDialog(true);
      } else {
        if (data.sent > 0 && data.failed === 0) {
          setSendBanner({ type: "success", text: `${data.sent} SMS reminder${data.sent !== 1 ? "s" : ""} sent successfully.` });
        } else {
          const failedItem = data.results?.find((r: any) => r.status === "failed" || r.status === "skipped");
          const failReason = failedItem?.reason ? ` — ${failedItem.reason}` : "";
          setSendBanner({ type: "error", text: `${data.sent} sent · ${data.failed} failed out of ${data.total} loans.${failReason}` });
        }
      }
    } catch (e: any) {
      setSendBanner({ type: "error", text: e.message });
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      {/* Header */}
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
          <p className="text-muted-foreground mt-0.5">Alerts and overdue reminders.</p>
        </div>
      </div>

      {/* WhatsApp "Send All" link list */}
      {showWaDialog && (
        <Card className="shadow-sm border-green-400/40 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-green-800 dark:text-green-300 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Reminders — Open each link to send
              </CardTitle>
              <button onClick={() => setShowWaDialog(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>
            <CardDescription>
              WhatsApp opens with the message pre-filled. Just tap <strong>Send</strong> in WhatsApp for each customer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waLinks.map((item, i) => (
                <div key={i} className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${item.skipped ? "opacity-50 border-border" : "border-green-300/60 bg-background"}`}>
                  <div>
                    <span className="font-mono font-semibold">{item.loanNumber}</span>
                    <span className="ml-2 text-muted-foreground">{item.customerName ?? "Unknown"}</span>
                    {item.skipped && <span className="ml-2 text-xs text-destructive">No phone — skipped</span>}
                  </div>
                  {!item.skipped && (
                    <a
                      href={item.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 hover:opacity-70"
                    >
                      Open WhatsApp <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Loans + Messaging */}
      <Card className="shadow-sm border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                <AlertCircle className="h-5 w-5" />
                Overdue Loans
                {overdueCount > 0 && <Badge variant="destructive" className="ml-1">{overdueCount}</Badge>}
              </CardTitle>
              <CardDescription className="mt-1">
                Send SMS (Fast2SMS) or WhatsApp reminders to overdue customers.
              </CardDescription>
            </div>

            {overdueCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Channel toggle */}
                <div className="flex rounded-md border border-border overflow-hidden bg-background text-sm">
                  <button
                    onClick={() => setChannel("sms")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 font-medium transition-colors ${
                      channel === "sms"
                        ? "bg-sidebar-primary text-white"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> SMS
                  </button>
                  <button
                    onClick={() => setChannel("whatsapp")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 font-medium transition-colors ${
                      channel === "whatsapp"
                        ? "bg-green-600 text-white"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                </div>

                {/* Send All */}
                <Button
                  size="sm"
                  onClick={sendAllReminders}
                  disabled={sendingAll || sendingIds.size > 0}
                  className="bg-destructive/90 hover:bg-destructive text-white h-8"
                >
                  {sendingAll
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Loading…</>
                    : <><Send className="h-3.5 w-3.5 mr-1.5" /> Send All ({overdueCount})</>
                  }
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Result banner */}
          {sendBanner && (
            <div className={`mb-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
              sendBanner.type === "success"
                ? "border-green-400/50 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                : "border-destructive/40 bg-destructive/5 text-destructive"
            }`}>
              <span className="mt-0.5 shrink-0">{sendBanner.type === "success" ? "✓" : "✗"}</span>
              <p className="flex-1">{sendBanner.text}</p>
              <button onClick={() => setSendBanner(null)} className="shrink-0 opacity-50 hover:opacity-100 leading-none">✕</button>
            </div>
          )}

          {/* WhatsApp note */}
          {channel === "whatsapp" && (
            <div className="mb-4 rounded-md border border-green-300/50 bg-green-50/60 dark:bg-green-900/10 px-3 py-2 text-xs text-green-800 dark:text-green-300 flex gap-2">
              <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                WhatsApp uses <strong>wa.me deep links</strong> — free, no API key needed.
                Clicking Remind opens WhatsApp with the message pre-filled; you just tap Send.
              </span>
            </div>
          )}

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
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-destructive/20 hover:border-destructive/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold">{loan.loanNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(loan as any).customerName ?? `Customer #${loan.customerId}`} · Due {formatIndianDate(loan.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-mono text-sm font-bold text-destructive hidden sm:block">
                      {formatCurrency(loan.outstandingBalance)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendReminder(loan.id)}
                      disabled={sendingIds.has(loan.id) || sendingAll}
                      title={`Send ${channel === "whatsapp" ? "WhatsApp" : "SMS"} reminder`}
                      className="h-7 text-xs border-sidebar-primary/40 text-sidebar-primary hover:bg-sidebar-primary/10 gap-1"
                    >
                      {sendingIds.has(loan.id)
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : channel === "whatsapp"
                          ? <><ExternalLink className="h-3 w-3" /> WhatsApp</>
                          : <><Send className="h-3 w-3" /> Remind</>
                      }
                    </Button>
                    <Button variant="outline" size="sm" asChild
                      className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
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
