export function formatAmount(amount: number, region: any): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: region?.currency_code || 'USD',
  })
  
  return formatter.format(amount / 100) // Assuming amounts are stored in cents
}
