import { Button, Drawer, Input, Label, Text } from "@medusajs/ui";
import { useState } from "react";
import { UpdateCompanyDTO } from "src/modules/company/types/mutations";

export function CompanyForm({
  company,
  handleSubmit,
  loading,
  error,
}: {
  company?: Partial<UpdateCompanyDTO>;
  handleSubmit: (data: Partial<UpdateCompanyDTO>) => Promise<void>;
  loading: boolean;
  error: Error;
}) {
  const [formData, setFormData] = useState<Partial<UpdateCompanyDTO>>(
    company || {}
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <Label size="xsmall">Company Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Medusa"
          />
          <Label size="xsmall">Company Phone</Label>
          <Input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="1234567890"
          />
          <Label size="xsmall">Company Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="medusa@medusa.com"
          />
          <Label size="xsmall">Company Address</Label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="1234 Main St"
          />
          <Label size="xsmall">Company City</Label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
          />
          <Label size="xsmall">Company State</Label>
          <Input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="NY"
          />
          <Label size="xsmall">Company Zip</Label>
          <Input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="10001"
          />
          <Label size="xsmall">Company Country</Label>
          <Input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="USA"
          />
          {/* TODO: Add logo upload */}
          <Label size="xsmall">Company Logo URL</Label>
          <Input
            type="text"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Drawer.Close>
        <Button
          isLoading={loading}
          onClick={async () => await handleSubmit(formData)}
        >
          Save
        </Button>
        {error && (
          <Text className="txt-compact-small text-ui-fg-warning">
            Error: {error?.message}
          </Text>
        )}
      </Drawer.Footer>
    </form>
  );
}
