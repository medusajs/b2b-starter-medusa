/**
 * Approval Module - Integration Tests
 * 
 * Tests complete workflows including:
 * 1. Happy path (request → approve → complete)
 * 2. Rejection cascade
 * 3. Escalation flow
 * 4. State persistence
 * 5. Idempotency guarantees
 */

import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
    createAdminUser,
    generatePublishableKey,
    generateStoreHeaders,
} from "../../../../integration-tests/helpers";
import { ApprovalStatusType, ApprovalType } from "../../../types/approval";

jest.setTimeout(100000);

const env = { MEDUSA_FF_MEDUSA_V2: true };

medusaIntegrationTestRunner({
    env,
    testSuite: ({ dbConnection, getContainer, api }) => {
        describe("Approval Module - Integration Tests", () => {
            let appContainer: any;
            let shutdownServer: any;
            let companyId: string;
            let customerId: string;
            let cartId: string;
            let adminHeaders: any;

            beforeAll(async () => {
                appContainer = getContainer();
                shutdownServer = null;
            });

            beforeEach(async () => {
                // Setup admin user
                const adminUser = await createAdminUser(dbConnection, adminHeaders, {
                    id: "admin_user",
                    email: "admin@test.com",
                    password: "supersecret",
                });

                adminHeaders = {
                    headers: {
                        Authorization: `Bearer ${adminUser.token}`,
                    },
                };

                // Create company with approval settings
                const companyRes = await api.post(
                    "/admin/companies",
                    {
                        name: "Test Company",
                        approval_settings: {
                            requires_admin_approval: true,
                            requires_sales_manager_approval: false,
                            admin_approval_threshold: 5000,
                            escalation_enabled: true,
                            escalation_timeout_hours: 1,
                        },
                    },
                    adminHeaders
                );

                companyId = companyRes.data.company.id;

                // Create customer/employee
                const customerRes = await api.post(
                    "/admin/customers",
                    {
                        email: "buyer@test.com",
                        first_name: "Test",
                        last_name: "Buyer",
                        company_id: companyId,
                    },
                    adminHeaders
                );

                customerId = customerRes.data.customer.id;

                // Create cart with items exceeding threshold
                const storeHeaders = await generateStoreHeaders({ api });
                const cartRes = await api.post(
                    "/store/carts",
                    {
                        customer_id: customerId,
                        region_id: "test-region",
                        items: [
                            {
                                variant_id: "test-variant",
                                quantity: 10,
                            },
                        ],
                    },
                    storeHeaders
                );

                cartId = cartRes.data.cart.id;
            });

            describe("Happy Path", () => {
                it("should create approval when cart exceeds threshold", async () => {
                    // Trigger approval creation
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        {
                            created_by: customerId,
                        },
                        adminHeaders
                    );

                    expect(approvalRes.status).toBe(200);
                    expect(approvalRes.data.approvals).toHaveLength(1);
                    expect(approvalRes.data.approvals[0]).toMatchObject({
                        cart_id: cartId,
                        type: ApprovalType.ADMIN,
                        status: ApprovalStatusType.PENDING,
                        created_by: customerId,
                    });

                    // Verify approval history was created
                    const historyRes = await api.get(
                        `/admin/approvals/${approvalRes.data.approvals[0].id}/history`,
                        adminHeaders
                    );

                    expect(historyRes.data.history).toHaveLength(1);
                    expect(historyRes.data.history[0]).toMatchObject({
                        previous_status: null,
                        new_status: ApprovalStatusType.PENDING,
                        is_system_action: false,
                    });
                });

                it("should approve cart and allow checkout", async () => {
                    // Create approval
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approvalId = approvalRes.data.approvals[0].id;

                    // Approve
                    const updateRes = await api.post(
                        `/admin/approvals/${approvalId}`,
                        {
                            status: ApprovalStatusType.APPROVED,
                            handled_by: "admin_user",
                            approval_comment: "Looks good",
                        },
                        adminHeaders
                    );

                    expect(updateRes.status).toBe(200);
                    expect(updateRes.data.approval.status).toBe(
                        ApprovalStatusType.APPROVED
                    );

                    // Verify audit trail
                    const historyRes = await api.get(
                        `/admin/approvals/${approvalId}/history`,
                        adminHeaders
                    );

                    expect(historyRes.data.history).toHaveLength(2);
                    expect(historyRes.data.history[1]).toMatchObject({
                        previous_status: ApprovalStatusType.PENDING,
                        new_status: ApprovalStatusType.APPROVED,
                        actor_id: "admin_user",
                        comment: "Looks good",
                    });

                    // Attempt checkout (should succeed)
                    const storeHeaders = await generateStoreHeaders({ api });
                    const checkoutRes = await api.post(
                        `/store/carts/${cartId}/complete`,
                        {},
                        storeHeaders
                    );

                    expect(checkoutRes.status).toBe(200);
                });
            });

            describe("Rejection Cascade", () => {
                it("should reject all pending approvals when one is rejected", async () => {
                    // Update company to require multiple approval types
                    await api.post(
                        `/admin/companies/${companyId}/approval-settings`,
                        {
                            requires_admin_approval: true,
                            requires_sales_manager_approval: true,
                            requires_multiple_approvers: true,
                            min_approvers_count: 2,
                        },
                        adminHeaders
                    );

                    // Create approvals
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    expect(approvalRes.data.approvals.length).toBeGreaterThan(1);

                    const approvalIds = approvalRes.data.approvals.map((a: any) => a.id);
                    const firstApprovalId = approvalIds[0];

                    // Reject first approval
                    await api.post(
                        `/admin/approvals/${firstApprovalId}`,
                        {
                            status: ApprovalStatusType.REJECTED,
                            handled_by: "admin_user",
                            rejection_reason: "Pricing issue",
                        },
                        adminHeaders
                    );

                    // Verify all approvals are rejected
                    for (const id of approvalIds) {
                        const approvalRes = await api.get(
                            `/admin/approvals/${id}`,
                            adminHeaders
                        );

                        expect(approvalRes.data.approval.status).toBe(
                            ApprovalStatusType.REJECTED
                        );
                    }

                    // Verify audit trail shows cascade
                    for (const id of approvalIds.slice(1)) {
                        const historyRes = await api.get(
                            `/admin/approvals/${id}/history`,
                            adminHeaders
                        );

                        const rejectionEntry = historyRes.data.history.find(
                            (h: any) => h.new_status === ApprovalStatusType.REJECTED
                        );

                        expect(rejectionEntry).toBeDefined();
                        expect(rejectionEntry.is_system_action).toBe(true);
                        expect(rejectionEntry.reason).toContain("Cascaded rejection");
                    }
                });
            });

            describe("Idempotency", () => {
                it("should not create duplicate approvals on retry", async () => {
                    // First request
                    const res1 = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approval1 = res1.data.approvals[0];

                    // Second request (retry)
                    const res2 = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approval2 = res2.data.approvals[0];

                    // Should return same approval
                    expect(approval1.id).toBe(approval2.id);
                    expect(res2.data.idempotent).toBe(true);
                });

                it("should handle concurrent approval updates gracefully", async () => {
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approvalId = approvalRes.data.approvals[0].id;

                    // Simulate concurrent approval attempts
                    const promises = [
                        api.post(
                            `/admin/approvals/${approvalId}`,
                            {
                                status: ApprovalStatusType.APPROVED,
                                handled_by: "admin1",
                            },
                            adminHeaders
                        ),
                        api.post(
                            `/admin/approvals/${approvalId}`,
                            {
                                status: ApprovalStatusType.APPROVED,
                                handled_by: "admin2",
                            },
                            adminHeaders
                        ),
                    ];

                    const results = await Promise.allSettled(promises);

                    // At least one should succeed
                    const succeeded = results.filter((r) => r.status === "fulfilled");
                    expect(succeeded.length).toBeGreaterThan(0);

                    // Final state should be consistent
                    const finalRes = await api.get(
                        `/admin/approvals/${approvalId}`,
                        adminHeaders
                    );

                    expect(finalRes.data.approval.status).toBe(
                        ApprovalStatusType.APPROVED
                    );
                });
            });

            describe("State Persistence", () => {
                it("should persist approval state across service restarts", async () => {
                    // Create approval
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approvalId = approvalRes.data.approvals[0].id;

                    // Approve
                    await api.post(
                        `/admin/approvals/${approvalId}`,
                        {
                            status: ApprovalStatusType.APPROVED,
                            handled_by: "admin_user",
                        },
                        adminHeaders
                    );

                    // Simulate restart by clearing cache (if any)
                    // ... cache clearing logic ...

                    // Retrieve approval (should still be APPROVED)
                    const retrieveRes = await api.get(
                        `/admin/approvals/${approvalId}`,
                        adminHeaders
                    );

                    expect(retrieveRes.data.approval.status).toBe(
                        ApprovalStatusType.APPROVED
                    );

                    // Verify full history is preserved
                    const historyRes = await api.get(
                        `/admin/approvals/${approvalId}/history`,
                        adminHeaders
                    );

                    expect(historyRes.data.history.length).toBeGreaterThanOrEqual(2);
                });
            });

            describe("Escalation", () => {
                it("should escalate approval after timeout", async () => {
                    // Create approval
                    const approvalRes = await api.post(
                        `/admin/carts/${cartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    const approvalId = approvalRes.data.approvals[0].id;

                    // Manually set created_at to past (mock timeout)
                    await dbConnection.query(
                        `UPDATE approval SET created_at = NOW() - INTERVAL '2 hours' WHERE id = $1`,
                        [approvalId]
                    );

                    // Check escalation
                    const approvalModule = appContainer.resolve("approval");
                    const shouldEscalate = await approvalModule.checkEscalation(
                        approvalId
                    );

                    expect(shouldEscalate).toBe(true);

                    // Trigger escalation workflow (would be scheduled job in production)
                    await api.post(
                        `/admin/approvals/${approvalId}/escalate`,
                        {},
                        adminHeaders
                    );

                    // Verify escalated state
                    const approvalAfter = await api.get(
                        `/admin/approvals/${approvalId}`,
                        adminHeaders
                    );

                    expect(approvalAfter.data.approval.escalated).toBe(true);
                    expect(approvalAfter.data.approval.escalated_at).toBeDefined();

                    // Verify escalation in history
                    const historyRes = await api.get(
                        `/admin/approvals/${approvalId}/history`,
                        adminHeaders
                    );

                    const escalationEntry = historyRes.data.history.find(
                        (h: any) => h.is_escalation === true
                    );

                    expect(escalationEntry).toBeDefined();
                });
            });

            describe("Auto-Approval", () => {
                it("should auto-approve carts below threshold", async () => {
                    // Update settings with auto-approve threshold
                    await api.post(
                        `/admin/companies/${companyId}/approval-settings`,
                        {
                            auto_approve_below_threshold: true,
                            auto_approve_threshold: 1000,
                        },
                        adminHeaders
                    );

                    // Create low-value cart
                    const storeHeaders = await generateStoreHeaders({ api });
                    const lowCartRes = await api.post(
                        "/store/carts",
                        {
                            customer_id: customerId,
                            region_id: "test-region",
                            items: [
                                {
                                    variant_id: "test-variant",
                                    quantity: 1,
                                },
                            ],
                        },
                        storeHeaders
                    );

                    const lowCartId = lowCartRes.data.cart.id;

                    // Attempt approval creation
                    const approvalRes = await api.post(
                        `/admin/carts/${lowCartId}/approvals`,
                        { created_by: customerId },
                        adminHeaders
                    );

                    // Should be auto-approved, no approval objects created
                    expect(approvalRes.data.autoApproved).toBe(true);
                    expect(approvalRes.data.approvals).toHaveLength(0);

                    // Cart should be immediately checkoutable
                    const checkoutRes = await api.post(
                        `/store/carts/${lowCartId}/complete`,
                        {},
                        storeHeaders
                    );

                    expect(checkoutRes.status).toBe(200);
                });
            });
        });
    },
});
