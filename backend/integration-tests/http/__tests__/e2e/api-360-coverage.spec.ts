import { medusaIntegrationTestRunner } from "medusa-test-utils"

jest.setTimeout(50000)

medusaIntegrationTestRunner({
  testSuite: ({ api }) => {
    describe("API 360° E2E Coverage", () => {
      let adminHeaders: Record<string, string>
      let storeHeaders: Record<string, string>
      let companyId: string
      let employeeId: string
      let quoteId: string

      beforeAll(async () => {
        // Admin auth
        const adminRes = await api.post("/auth/user/emailpass", {
          email: "admin@test.com",
          password: "supersecret",
        })
        adminHeaders = { Authorization: `Bearer ${adminRes.data.token}` }

        // Store customer auth
        const customerRes = await api.post("/auth/customer/emailpass/register", {
          email: "customer@test.com",
          password: "password123",
        })
        storeHeaders = { Authorization: `Bearer ${customerRes.data.token}` }
      })

      // ==================== COMPANY MODULE ====================
      describe("Company Module", () => {
        it("POST /admin/companies - creates company", async () => {
          const res = await api.post("/admin/companies", {
            name: "Test Solar Corp",
            email: "contact@testsolar.com",
            phone: "+1234567890",
            currency_code: "usd",
          }, { headers: adminHeaders })

          expect(res.status).toBe(200)
          expect(res.data.company).toHaveProperty("id")
          companyId = res.data.company.id
        })

        it("GET /admin/companies - lists companies", async () => {
          const res = await api.get("/admin/companies", { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.companies).toBeInstanceOf(Array)
        })

        it("GET /admin/companies/:id - retrieves company", async () => {
          const res = await api.get(`/admin/companies/${companyId}`, { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.company.id).toBe(companyId)
        })

        it("POST /admin/companies/:id - updates company", async () => {
          const res = await api.post(`/admin/companies/${companyId}`, {
            name: "Updated Solar Corp",
          }, { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.company.name).toBe("Updated Solar Corp")
        })

        it("POST /admin/companies/:id/employees - adds employee", async () => {
          const res = await api.post(`/admin/companies/${companyId}/employees`, {
            email: "employee@testsolar.com",
            spending_limit: 10000,
          }, { headers: adminHeaders })
          expect(res.status).toBe(200)
          employeeId = res.data.employee.id
        })

        it("GET /admin/companies/:id/employees - lists employees", async () => {
          const res = await api.get(`/admin/companies/${companyId}/employees`, { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.employees).toBeInstanceOf(Array)
        })

        it("DELETE /admin/companies/:id/employees/:employeeId - removes employee", async () => {
          const res = await api.delete(`/admin/companies/${companyId}/employees/${employeeId}`, { headers: adminHeaders })
          expect(res.status).toBe(200)
        })
      })

      // ==================== QUOTE MODULE ====================
      describe("Quote Module", () => {
        it("POST /store/quotes - creates quote", async () => {
          const res = await api.post("/store/quotes", {
            items: [{ variant_id: "variant_123", quantity: 5 }],
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.quote).toHaveProperty("id")
          quoteId = res.data.quote.id
        })

        it("GET /store/quotes - lists customer quotes", async () => {
          const res = await api.get("/store/quotes", { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.quotes).toBeInstanceOf(Array)
        })

        it("GET /store/quotes/:id - retrieves quote", async () => {
          const res = await api.get(`/store/quotes/${quoteId}`, { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.quote.id).toBe(quoteId)
        })

        it("POST /admin/quotes/:id/messages - adds message", async () => {
          const res = await api.post(`/admin/quotes/${quoteId}/messages`, {
            text: "Price adjusted for bulk order",
          }, { headers: adminHeaders })
          expect(res.status).toBe(200)
        })

        it("GET /admin/quotes/:id/messages - lists messages", async () => {
          const res = await api.get(`/admin/quotes/${quoteId}/messages`, { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.messages).toBeInstanceOf(Array)
        })

        it("POST /admin/quotes/:id/accept - accepts quote", async () => {
          const res = await api.post(`/admin/quotes/${quoteId}/accept`, {}, { headers: adminHeaders })
          expect(res.status).toBe(200)
        })

        it("POST /store/quotes/:id/reject - rejects quote", async () => {
          const res = await api.post(`/store/quotes/${quoteId}/reject`, {
            reason: "Price too high",
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
        })
      })

      // ==================== APPROVAL MODULE ====================
      describe("Approval Module", () => {
        it("GET /admin/approval-settings - retrieves settings", async () => {
          const res = await api.get("/admin/approval-settings", { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.approval_settings).toHaveProperty("id")
        })

        it("POST /admin/approval-settings - updates settings", async () => {
          const res = await api.post("/admin/approval-settings", {
            merchant_approval_required: true,
            merchant_approval_threshold: 5000,
          }, { headers: adminHeaders })
          expect(res.status).toBe(200)
        })

        it("GET /store/approvals - lists pending approvals", async () => {
          const res = await api.get("/store/approvals", { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.approvals).toBeInstanceOf(Array)
        })

        it("POST /admin/approvals/:id/approve - approves request", async () => {
          const res = await api.post("/admin/approvals/approval_123/approve", {}, { headers: adminHeaders })
          expect([200, 404]).toContain(res.status) // 404 if no approval exists
        })

        it("POST /admin/approvals/:id/reject - rejects request", async () => {
          const res = await api.post("/admin/approvals/approval_123/reject", {
            reason: "Budget exceeded",
          }, { headers: adminHeaders })
          expect([200, 404]).toContain(res.status)
        })
      })

      // ==================== CATALOG MODULE ====================
      describe("Catalog Module", () => {
        it("GET /store/catalog - retrieves catalog", async () => {
          const res = await api.get("/store/catalog", { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.products).toBeInstanceOf(Array)
        })

        it("GET /store/catalog?category=solar-panels - filters by category", async () => {
          const res = await api.get("/store/catalog?category=solar-panels", { headers: storeHeaders })
          expect(res.status).toBe(200)
        })
      })

      // ==================== FINANCING MODULE ====================
      describe("Financing Module", () => {
        it("GET /store/financing/options - lists options", async () => {
          const res = await api.get("/store/financing/options", { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.options).toBeInstanceOf(Array)
        })

        it("POST /store/financing/calculate - calculates payment", async () => {
          const res = await api.post("/store/financing/calculate", {
            amount: 50000,
            term_months: 60,
            interest_rate: 4.5,
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data).toHaveProperty("monthly_payment")
        })

        it("POST /store/financing/applications - submits application", async () => {
          const res = await api.post("/store/financing/applications", {
            amount: 50000,
            term_months: 60,
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
        })

        it("GET /admin/financing/applications - lists applications", async () => {
          const res = await api.get("/admin/financing/applications", { headers: adminHeaders })
          expect(res.status).toBe(200)
          expect(res.data.applications).toBeInstanceOf(Array)
        })
      })

      // ==================== SOLAR MODULE ====================
      describe("Solar Module", () => {
        it("POST /store/solar/estimate - calculates solar estimate", async () => {
          const res = await api.post("/store/solar/estimate", {
            monthly_usage_kwh: 1000,
            roof_area_sqft: 500,
            location: { lat: 37.7749, lng: -122.4194 },
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data).toHaveProperty("estimated_system_size")
        })

        it("GET /store/solar/products - lists solar products", async () => {
          const res = await api.get("/store/solar/products", { headers: storeHeaders })
          expect(res.status).toBe(200)
          expect(res.data.products).toBeInstanceOf(Array)
        })

        it("POST /store/solar/consultation - requests consultation", async () => {
          const res = await api.post("/store/solar/consultation", {
            preferred_date: "2024-12-01",
            contact_method: "email",
          }, { headers: storeHeaders })
          expect(res.status).toBe(200)
        })
      })

      // ==================== HEALTH CHECK ====================
      describe("Health Check", () => {
        it("GET /health - returns healthy status", async () => {
          const res = await api.get("/health")
          expect(res.status).toBe(200)
          expect(res.data.status).toBe("healthy")
        })
      })

      // ==================== CLEANUP ====================
      afterAll(async () => {
        if (companyId) {
          await api.delete(`/admin/companies/${companyId}`, { headers: adminHeaders }).catch(() => {})
        }
      })
    })
  },
})
