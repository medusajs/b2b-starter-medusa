import { HttpTypes } from "@medusajs/types";
import { Button, Drawer, Hint, Table, toast } from "@medusajs/ui";
import { QueryCompany } from "../../../../types";
import {
  useAddCompanyToCustomerGroup,
  useRemoveCompanyFromCustomerGroup,
} from "../../../hooks/api";

export function CompanyCustomerGroupDrawer({
  company,
  customerGroups,
  open,
  setOpen,
}: {
  company: QueryCompany;
  customerGroups?: HttpTypes.AdminCustomerGroup[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutateAsync: addMutate, isPending: addLoading } =
    useAddCompanyToCustomerGroup(company.id);

  const { mutateAsync: removeMutate, isPending: removeLoading } =
    useRemoveCompanyFromCustomerGroup(company.id);

  const handleAdd = async (groupId: string) => {
    await addMutate(groupId, {
      onSuccess: async () => {
        setOpen(false);
        toast.success(`Company added to customer group successfully`);
      },
      onError: (error) => {
        toast.error("Failed to add company to customer group");
      },
    });
  };

  const handleRemove = async (groupId: string) => {
    await removeMutate(groupId, {
      onSuccess: async () => {
        toast.success(`Company removed from customer group successfully`);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Failed to remove company from customer group");
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Add {company.name} to a Customer Group</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="space-y-4 h-full overflow-y-hidden">
          <Hint variant="info">
            Adding {company.name} to a customer group will automatically add{" "}
            {company.employees?.length} linked employee
            {company.employees?.length === 1 ? "" : "s"} to the customer group.
          </Hint>
          <div className="h-full overflow-y-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Customer Group</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Actions
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {customerGroups ? (
                  customerGroups.map((group) => (
                    <Table.Row key={group.id}>
                      <Table.Cell>{group.name}</Table.Cell>
                      <Table.Cell className="text-right">
                        {company.customer_group?.id &&
                        company.customer_group.id === group.id ? (
                          <Button
                            onClick={() => handleRemove(group.id)}
                            isLoading={removeLoading}
                            variant="danger"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAdd(group.id)}
                            disabled={
                              (company.customer_group?.id &&
                                company.customer_group.id !== group.id) ||
                              addLoading
                            }
                            isLoading={addLoading}
                          >
                            Add
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell>No customer groups found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
