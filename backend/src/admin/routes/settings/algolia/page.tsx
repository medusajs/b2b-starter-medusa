import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, toast } from "@medusajs/ui";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "../../../lib/client";

const AlgoliaPage = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/algolia/sync", {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Successfully triggered data sync to Algolia");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to sync data to Algolia");
    },
  });

  const handleSync = () => {
    mutate();
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Algolia Sync</Heading>
      </div>
      <div className="px-6 py-8">
        <Button variant="primary" onClick={handleSync} isLoading={isPending}>
          Sync Data to Algolia
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Algolia",
});

export default AlgoliaPage;
