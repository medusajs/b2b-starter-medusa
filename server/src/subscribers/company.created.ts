export default async function onCompanyCreated({ event }: any) {
  // event.data => { id, ... }
  // Scaffold: log and later sync indexes
  console.log("event:company.created", event?.data);
}

