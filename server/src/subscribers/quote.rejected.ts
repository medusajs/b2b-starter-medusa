export default async function onQuoteRejected({ event }: any) {
  console.log("event:quote.rejected", event?.data);
}

