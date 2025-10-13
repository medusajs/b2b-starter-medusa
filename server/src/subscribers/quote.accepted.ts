export default async function onQuoteAccepted({ event }: any) {
  console.log("event:quote.accepted", event?.data);
}

