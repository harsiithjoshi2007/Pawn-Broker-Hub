export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatIndianDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
