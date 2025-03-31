import AddAddress from "@/modules/account/components/address-card/add-address"
import EditAddress from "@/modules/account/components/address-card/edit-address-modal"
import { B2BCustomer } from "@/types/global"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: B2BCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
        <AddAddress region={region} />
        {customer.addresses.map((address) => {
          return (
            <EditAddress
              region={region}
              address={address}
              key={address.id}
              customer={customer}
            />
          )
        })}
      </div>
    </div>
  )
}

export default AddressBook
