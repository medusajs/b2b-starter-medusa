import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BroomSparkle } from "@medusajs/icons";
import { Button, Container, Heading } from "@medusajs/ui";
import { useState } from "react";

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

      alert("Database cleared and seeded successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to clear and seed database");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="p-6 flex flex-col gap-2 justify-between">
        <Heading className="font-sans font-medium h1-core">
          Truncate database
        </Heading>

        <p>This will delete all orders and reset all products</p>
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
  icon: BroomSparkle,
});

export default CustomPage;
