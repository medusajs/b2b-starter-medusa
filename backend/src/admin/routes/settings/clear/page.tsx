import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading } from "@medusajs/ui";
import { useState } from "react";

const isDemoResetEnabled = import.meta.env.VITE_ENABLE_DEMO_RESET === "true";

const CustomPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClearDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/admin/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear database");
      }

      alert("Done!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDemoResetEnabled) {
    return (
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex flex-col gap-2 justify-between">
          Data reset is not enabled in this environment
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="p-6 flex flex-col gap-2 justify-between">
        <Heading className="font-sans font-medium h1-core">
          Truncate database
        </Heading>

        <p>This will delete all orders and reset all inventory levels</p>
        <Button
          variant="danger"
          onClick={handleClearDatabase}
          isLoading={isLoading}
        >
          {isLoading ? "Processing..." : "Truncate database"}
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Clean up",
});

export default CustomPage;
