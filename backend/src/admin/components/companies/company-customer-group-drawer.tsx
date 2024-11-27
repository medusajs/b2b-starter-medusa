import { Button, Drawer, Hint, Table, toast } from "@medusajs/ui";
import { CompanyDTO } from "src/modules/company/types/common";
import {
  useAddCompanyToCustomerGroup,
  useAdminCustomerGroups,
  useRemoveCompanyFromCustomerGroup,
} from "../../hooks";

export function CompanyCustomerGroupDrawer({
  company,
  refetch,
  open,
  setOpen,
}: {
  company: CompanyDTO;
  refetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const {
    mutate: addMutate,
    loading: addLoading,
    error: addError,
  } = useAddCompanyToCustomerGroup(company.id);

  const {
    mutate: removeMutate,
    loading: removeLoading,
    error: removeError,
  } = useRemoveCompanyFromCustomerGroup(company.id);

  const {
    data,
    loading: customerGroupsLoading,
    error: customerGroupsError,
  } = useAdminCustomerGroups();

  const handleAdd = async (groupId: string) => {
    await addMutate(groupId).then(() => {
      setOpen(false);
      refetch();
      toast.success(`Company added to customer group successfully`);
    });
  };

  const handleRemove = async (groupId: string) => {
    await removeMutate(groupId).then(() => {
      refetch();
      toast.success(`Company removed from customer group successfully`);
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Add {company.name} to a Customer Group</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="space-y-4">
          <Hint variant="info">
            Adding {company.name} to a customer group will automatically add{" "}
            {company.employees?.length} linked employee
            {company.employees?.length === 1 ? "" : "s"} to the customer group.
          </Hint>
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
              {data?.map((group) => (
                <Table.Row key={group.id}>
                  <Table.Cell>{group.name}</Table.Cell>
                  <Table.Cell className="text-right">
                    {company.customer_group?.id &&
                    company.customer_group.id === group.id ? (
                      <Button
                        onClick={() => handleRemove(group.id)}
                        isLoading={removeLoading}
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
              ))}
            </Table.Body>
          </Table>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
