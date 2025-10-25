import { Container, Heading } from "@medusajs/ui"
import { CreateBundleForm } from "../../components/bundles/create-bundle-form"
import { BundlesList } from "../../components/bundles/bundles-list"

const BundlesPage = () => {
  return (
    <Container>
      <Heading level="h1" className="mb-8">
        Manage Bundles
      </Heading>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Heading level="h2" className="mb-4">
            Create New Bundle
          </Heading>
          <CreateBundleForm />
        </div>
        <div>
          <Heading level="h2" className="mb-4">
            Existing Bundles
          </Heading>
          <BundlesList />
        </div>
      </div>
    </Container>
  )
}

export default BundlesPage
