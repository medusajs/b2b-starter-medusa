export default async function onSpendingLimitExceeded({ event }: any) {
  console.warn("event:employee.spending_limit_exceeded", event?.data);
}

