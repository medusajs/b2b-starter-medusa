import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  adminHeaders,
  createAdminUser,
  createStoreUser,
} from "../../../utils/admin"
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../../utils/store"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  inApp: true,
  env: { JWT_SECRET: "supersecret" },
  testSuite: ({ api, getContainer }) => {
    describe("API 360° E2E Coverage", () => {
      let storeHeaders: any
      let companyId: string

      beforeEach(async () => {
        const container = getContainer()
        await createAdminUser(adminHeaders, container)
        const publishableKey = await generatePublishableKey(container)
        storeHeaders = generateStoreHeaders({ publishableKey })
        const res = await createStoreUser({ api, storeHeaders })
        storeHeaders.headers["Authorization"] = `Bearer ${res.token}`
      })

      // ==================== COMPANY MODULE ====================
      describe("Company Module", () => {
        it("POST /store/companies - creates company", async () => {
          const res = await api.post("/store/companies", {
            name: "Test Solar Corp",
            email: "contact@testsolar.com",
            phone: "+1234567890",
            currency_code: "USD",
            address: "123 Solar St",
            city: "Solar City",
            state: "CA",
            zip: "12345",
            country: "USA",
            spending_limit_reset_frequency: "monthly",
          }, storeHeaders)

          expect(res.status).toBe(200)
          expect(res.data.companies[0]).toHaveProperty("id")
          companyId = res.data.companies[0].id
        })

        it("GET /store/companies/:id - retrieves company", async () => {
          const res = await api.get(`/store/companies/${companyId}`, storeHeaders)
          expect(res.status).toBe(200)
          expect(res.data.company.id).toBe(companyId)
        })

        it("POST /store/companies/:id - updates company", async () => {
          const res = await api.post(`/store/companies/${companyId}`, {
            name: "Updated Solar Corp",
          }, storeHeaders)
          expect(res.status).toBe(200)
          expect(res.data.company.name).toBe("Updated Solar Corp")
        })

        it("DELETE /store/companies/:id - deletes company", async () => {
          const res = await api.delete(`/store/companies/${companyId}`, storeHeaders)
          expect(res.status).toBe(204)
        })
      })



      // ==================== HEALTH CHECK ====================
      describe("Health Check", () => {
        it("GET /health - returns healthy status", async () => {
          const res = await api.get("/health")
          expect(res.status).toBe(200)
        })
      })
    })
  },
})
