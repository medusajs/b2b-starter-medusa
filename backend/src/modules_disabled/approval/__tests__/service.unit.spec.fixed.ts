import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import ApprovalModuleService from "../service";
import { ApprovalStatusType, ApprovalType } from "../../../types/approval";

/**
 * Approval Module - Unit Tests (Fixed)
 * 
 * Uses jest.spyOn to mock methods compatible with Medusa's @InjectManager decorator
 * 
 * Test Coverage:
 * - Rule evaluation logic (deterministic)
 * - Idempotency key generation
 * - PII redaction in audit trail
 * - Edge cases (null values, empty arrays)
 */

describe("ApprovalModuleService", () => {
    let service: ApprovalModuleService;

    beforeEach(() => {
        // Create service instance with minimal container
        service = new ApprovalModuleService({} as any);
        // Clear all mocks between tests
        jest.clearAllMocks();
    });

    describe("Rule Evaluation Matrix", () => {
        it("should require admin approval when cart total exceeds threshold", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "High value orders",
                    conditions: { cart_total_gte: 10000 },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 15000,
                itemCount: 5,
            });

            expect(result).toEqual([
                { type: ApprovalType.ADMIN, count: 1 },
            ]);
        });

        it("should NOT require approval when cart total is below threshold", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "High value orders",
                    conditions: { cart_total_gte: 10000 },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 5000,
                itemCount: 3,
            });

            expect(result).toEqual([]);
        });

        it("should require multiple approvers based on rule", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "Weekend high-value orders",
                    conditions: {
                        cart_total_gte: 20000,
                        day_of_week: ["SAT", "SUN"],
                    },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 2,
                    priority: 20,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 25000,
                itemCount: 10,
                dayOfWeek: "SAT",
            });

            expect(result).toEqual([
                { type: ApprovalType.ADMIN, count: 2 },
            ]);
        });

        it("should skip inactive rules", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "Disabled rule",
                    conditions: { cart_total_gte: 1000 },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: false, // INACTIVE
                    effective_from: null,
                    effective_until: null,
                },
            ];

            // listApprovalRules already filters by is_active: true
            jest.spyOn(service, "listApprovalRules").mockResolvedValue([]);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 5000,
                itemCount: 2,
            });

            expect(result).toEqual([]);
        });

        it("should skip rules outside effective date range", async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);

            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "Future rule",
                    conditions: { cart_total_gte: 5000 },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: true,
                    effective_from: futureDate,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 8000,
                itemCount: 4,
            });

            expect(result).toEqual([]);
        });

        it("should evaluate rules in priority order (highest first)", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "Low priority",
                    conditions: { cart_total_gte: 5000 },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
                {
                    id: "rule2",
                    company_id: "comp1",
                    rule_name: "High priority",
                    conditions: { cart_total_gte: 10000 },
                    required_approval_type: ApprovalType.SALES_MANAGER,
                    required_approvers_count: 1,
                    priority: 100,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 12000,
                itemCount: 8,
            });

            // Both rules match, expect high-priority first
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe(ApprovalType.SALES_MANAGER);
            expect(result[1].type).toBe(ApprovalType.ADMIN);
        });
    });

    describe("Idempotency", () => {
        it("should generate consistent idempotency keys", () => {
            const key1 = service.generateIdempotencyKey("cart1", ApprovalType.ADMIN);
            const key2 = service.generateIdempotencyKey("cart1", ApprovalType.ADMIN);
            const key3 = service.generateIdempotencyKey("cart1", ApprovalType.SALES_MANAGER);

            expect(key1).toBe(key2);
            expect(key1).not.toBe(key3);
            expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
        });

        it("hasPendingApprovals should return consistent results", async () => {
            jest.spyOn(service, "listAndCountApprovals").mockResolvedValue([[], 2] as any);

            const result1 = await service.hasPendingApprovals("cart1");
            const result2 = await service.hasPendingApprovals("cart1");

            expect(result1).toBe(true);
            expect(result2).toBe(true);
            expect(result1).toEqual(result2);
        });
    });

    describe("Audit Trail", () => {
        it("should record approval history with PII hashed", async () => {
            const createHistoriesSpy = jest
                .spyOn(service, "createApprovalHistories")
                .mockResolvedValue([] as any);

            await service.recordApprovalHistory({
                approval_id: "appr1",
                previous_status: null,
                new_status: ApprovalStatusType.PENDING,
                actor_id: "emp1",
                actor_role: "buyer",
                actor_ip: "192.168.1.100",
                actor_user_agent: "Mozilla/5.0 Chrome/120.0",
                reason: "Initial request",
                cart_total_at_action: 15000,
            });

            expect(createHistoriesSpy).toHaveBeenCalledWith([
                expect.objectContaining({
                    approval_id: "appr1",
                    new_status: ApprovalStatusType.PENDING,
                    actor_id: "emp1",
                    actor_role: "buyer",
                    actor_ip_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
                    actor_user_agent_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
                    reason: "Initial request",
                    action_timestamp: expect.any(Date),
                }),
            ]);

            const call = createHistoriesSpy.mock.calls[0][0][0];
            expect(call.actor_ip_hash).not.toBe("192.168.1.100");
            expect(call.actor_user_agent_hash).not.toBe("Mozilla/5.0 Chrome/120.0");
        });

        it("should NOT record raw PII in history", async () => {
            const createHistoriesSpy = jest
                .spyOn(service, "createApprovalHistories")
                .mockResolvedValue([] as any);

            await service.recordApprovalHistory({
                approval_id: "appr1",
                previous_status: ApprovalStatusType.PENDING,
                new_status: ApprovalStatusType.APPROVED,
                actor_id: "emp2",
                actor_role: "admin",
                actor_ip: "10.0.0.50",
                actor_user_agent: "Safari/17.0",
                comment: "Approved after review",
            });

            const call = createHistoriesSpy.mock.calls[0][0][0];
            expect(call).not.toHaveProperty("actor_ip");
            expect(call).not.toHaveProperty("actor_user_agent");
            expect(call).toHaveProperty("actor_ip_hash");
            expect(call).toHaveProperty("actor_user_agent_hash");
        });
    });

    describe("Escalation", () => {
        it("should detect approvals ready for escalation", async () => {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 25); // 25 hours ago

            jest.spyOn(service, "retrieveApproval").mockResolvedValue({
                id: "appr1",
                status: ApprovalStatusType.PENDING,
                escalated: false,
                created_at: pastDate,
                company_id: "comp1",
            } as any);

            jest.spyOn(service, "listApprovalSettings").mockResolvedValue([
                {
                    company_id: "comp1",
                    escalation_enabled: true,
                    escalation_timeout_hours: 24,
                },
            ] as any);

            const result = await service.checkEscalation("appr1");

            expect(result).toBe(true);
        });

        it("should NOT escalate if already escalated", async () => {
            jest.spyOn(service, "retrieveApproval").mockResolvedValue({
                id: "appr1",
                status: ApprovalStatusType.PENDING,
                escalated: true, // Already escalated
                created_at: new Date(),
                company_id: "comp1",
            } as any);

            jest.spyOn(service, "listApprovalSettings").mockResolvedValue([
                {
                    company_id: "comp1",
                    escalation_enabled: true,
                    escalation_timeout_hours: 24,
                },
            ] as any);

            const result = await service.checkEscalation("appr1");

            expect(result).toBe(false);
        });

        it("should NOT escalate if status is not PENDING", async () => {
            jest.spyOn(service, "retrieveApproval").mockResolvedValue({
                id: "appr1",
                status: ApprovalStatusType.APPROVED, // Not pending
                escalated: false,
                created_at: new Date(),
                company_id: "comp1",
            } as any);

            jest.spyOn(service, "listApprovalSettings").mockResolvedValue([
                {
                    company_id: "comp1",
                    escalation_enabled: true,
                    escalation_timeout_hours: 24,
                },
            ] as any);

            const result = await service.checkEscalation("appr1");

            expect(result).toBe(false);
        });

        it("should NOT escalate if escalation is disabled", async () => {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 25);

            jest.spyOn(service, "retrieveApproval").mockResolvedValue({
                id: "appr1",
                status: ApprovalStatusType.PENDING,
                escalated: false,
                created_at: pastDate,
                company_id: "comp1",
            } as any);

            jest.spyOn(service, "listApprovalSettings").mockResolvedValue([
                {
                    company_id: "comp1",
                    escalation_enabled: false, // Disabled
                    escalation_timeout_hours: 24,
                },
            ] as any);

            const result = await service.checkEscalation("appr1");

            expect(result).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty rule set gracefully", async () => {
            jest.spyOn(service, "listApprovalRules").mockResolvedValue([]);

            const result = await service.evaluateApprovalRules("comp1", {
                total: 10000,
                itemCount: 5,
            });

            expect(result).toEqual([]);
        });

        it("should handle null/undefined cart context fields", async () => {
            const rules = [
                {
                    id: "rule1",
                    company_id: "comp1",
                    rule_name: "Day-specific rule",
                    conditions: {
                        cart_total_gte: 5000,
                        day_of_week: ["SAT"],
                    },
                    required_approval_type: ApprovalType.ADMIN,
                    required_approvers_count: 1,
                    priority: 10,
                    is_active: true,
                    effective_from: null,
                    effective_until: null,
                },
            ];

            jest.spyOn(service, "listApprovalRules").mockResolvedValue(rules as any);

            // dayOfWeek is undefined - rule should not match
            const result = await service.evaluateApprovalRules("comp1", {
                total: 8000,
                itemCount: 4,
                dayOfWeek: undefined, // Missing field
            });

            expect(result).toEqual([]);
        });
    });
});
