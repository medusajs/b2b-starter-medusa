/**
 * @jest-environment node
 * @file approvals.test.ts
 * @description Unit tests for approvals data layer
 */

import {
    listApprovals,
    retrieveApproval,
    updateApproval,
    startApprovalFlow,
} from "@/lib/data/approvals"
import { sdk } from "@/lib/config"
import {
    getAuthHeaders,
    getCacheOptions,
    getCacheTag,
} from "@/lib/data/cookies"
import { retrieveCart } from "@/lib/data/cart"
import { getCartApprovalStatus } from "@/lib/util/get-cart-approval-status"
import { ApprovalStatusType } from "@/types/approval"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

// Mock dependencies
jest.mock("@/lib/config")
jest.mock("@/lib/data/cookies")
jest.mock("@/lib/data/cart")
jest.mock("@/lib/util/get-cart-approval-status")
jest.mock("next/cache")
jest.mock("next/navigation", () => ({
    redirect: jest.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT: ${url}`)
    }),
}))

describe("approvals.ts - Data Layer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("listApprovals", () => {
        it("should list approvals with default parameters", async () => {
            const mockApprovals = {
                approvals: [
                    {
                        id: "approval_1",
                        status: "pending",
                        type: "spending_limit",
                        cart_id: "cart_123",
                    },
                    {
                        id: "approval_2",
                        status: "approved",
                        type: "admin_review",
                        cart_id: "cart_456",
                    },
                ],
                count: 2,
                offset: 0,
                limit: 100,
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({
                    Authorization: "Bearer token",
                })
                ; (getCacheOptions as jest.Mock).mockResolvedValue({
                    tags: ["approvals"],
                })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue(mockApprovals)

            const result = await listApprovals()

            expect(result).toEqual(mockApprovals)
            expect(sdk.client.fetch).toHaveBeenCalledWith("/store/approvals", {
                query: {
                    status: undefined,
                    type: undefined,
                    offset: 0,
                    limit: 100,
                    order: "-updated_at",
                },
                method: "GET",
                headers: { Authorization: "Bearer token" },
                next: { tags: ["approvals"] },
                credentials: "include",
                cache: "force-cache",
            })
        })

        it("should filter by status", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals({ status: "pending" })

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.status).toBe("pending")
        })

        it("should filter by type", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals({ type: "spending_limit" })

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.type).toBe("spending_limit")
        })

        it("should support custom pagination", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals({ offset: 50, limit: 25 })

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.offset).toBe(50)
            expect(fetchCall.query.limit).toBe(25)
        })

        it("should support custom order", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals({ order: "-created_at" })

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.order).toBe("-created_at")
        })

        it("should use force-cache strategy", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.cache).toBe("force-cache")
        })

        it("should include credentials", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approvals: [],
                })

            await listApprovals()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.credentials).toBe("include")
        })
    })

    describe("retrieveApproval", () => {
        it("should be defined", () => {
            expect(retrieveApproval).toBeDefined()
        })

        it("should be a function", () => {
            expect(typeof retrieveApproval).toBe("function")
        })

        it("should accept an approval ID parameter", () => {
            expect(retrieveApproval.length).toBe(1)
        })
    })

    describe("updateApproval", () => {
        it("should update approval status to APPROVED", async () => {
            const mockApproval = {
                id: "approval_123",
                status: ApprovalStatusType.APPROVED,
                cart_id: "cart_123",
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({
                    Authorization: "Bearer token",
                })
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("approvals-tag")
                    .mockResolvedValueOnce("carts-tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: mockApproval,
                })

            const result = await updateApproval(
                "approval_123",
                ApprovalStatusType.APPROVED
            )

            expect(result).toEqual(mockApproval)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/approvals/approval_123",
                {
                    method: "POST",
                    headers: { Authorization: "Bearer token" },
                    body: {
                        status: ApprovalStatusType.APPROVED,
                    },
                    credentials: "include",
                }
            )
        })

        it("should update approval status to REJECTED", async () => {
            const mockApproval = {
                id: "approval_123",
                status: ApprovalStatusType.REJECTED,
                cart_id: "cart_123",
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("approvals-tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: mockApproval,
                })

            const result = await updateApproval(
                "approval_123",
                ApprovalStatusType.REJECTED
            )

            expect(result.status).toBe(ApprovalStatusType.REJECTED)
        })

        it("should revalidate approvals cache tag", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("approvals-tag")
                    .mockResolvedValueOnce("carts-tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })

            await updateApproval("approval_123", ApprovalStatusType.APPROVED)

            expect(revalidateTag).toHaveBeenCalledWith("approvals-tag")
        })

        it("should revalidate carts cache tag", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("approvals-tag")
                    .mockResolvedValueOnce("carts-tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })

            await updateApproval("approval_123", ApprovalStatusType.APPROVED)

            expect(revalidateTag).toHaveBeenCalledWith("carts-tag")
        })

        it("should include credentials", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })

            await updateApproval("approval_123", ApprovalStatusType.APPROVED)

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.credentials).toBe("include")
        })
    })

    describe("startApprovalFlow", () => {
        it("should approve and redirect to payment when no pending admin approval", async () => {
            const mockCart = {
                id: "cart_123",
                items: [],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })
                ; (retrieveCart as jest.Mock).mockResolvedValue(mockCart)
                ; (getCartApprovalStatus as jest.Mock).mockReturnValue({
                    isPendingAdminApproval: false,
                })

            try {
                await startApprovalFlow("approval_123", "cart_123")
            } catch (error: any) {
                expect(error.message).toBe(
                    "NEXT_REDIRECT: /checkout?cartId=cart_123&step=payment"
                )
            }

            expect(updateApproval).toBeDefined()
            expect(retrieveCart).toHaveBeenCalledWith("cart_123")
            expect(redirect).toHaveBeenCalledWith(
                "/checkout?cartId=cart_123&step=payment"
            )
        })

        it("should approve but not redirect when admin approval is still pending", async () => {
            const mockCart = {
                id: "cart_123",
                items: [],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })
                ; (retrieveCart as jest.Mock).mockResolvedValue(mockCart)
                ; (getCartApprovalStatus as jest.Mock).mockReturnValue({
                    isPendingAdminApproval: true,
                })

            await startApprovalFlow("approval_123", "cart_123")

            expect(retrieveCart).toHaveBeenCalledWith("cart_123")
            expect(redirect).not.toHaveBeenCalled()
        })

        it("should call updateApproval with APPROVED status", async () => {
            const mockCart = {
                id: "cart_123",
                items: [],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123", status: "approved" },
                })
                ; (retrieveCart as jest.Mock).mockResolvedValue(mockCart)
                ; (getCartApprovalStatus as jest.Mock).mockReturnValue({
                    isPendingAdminApproval: true,
                })

            await startApprovalFlow("approval_123", "cart_123")

            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/approvals/approval_123",
                expect.objectContaining({
                    method: "POST",
                    body: {
                        status: ApprovalStatusType.APPROVED,
                    },
                })
            )
        })

        it("should check cart approval status after approval", async () => {
            const mockCart = {
                id: "cart_123",
                items: [],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_123" },
                })
                ; (retrieveCart as jest.Mock).mockResolvedValue(mockCart)
                ; (getCartApprovalStatus as jest.Mock).mockReturnValue({
                    isPendingAdminApproval: true,
                })

            await startApprovalFlow("approval_123", "cart_123")

            expect(getCartApprovalStatus).toHaveBeenCalledWith(mockCart)
        })

        it("should include cartId and step in redirect URL", async () => {
            const mockCart = {
                id: "cart_789",
                items: [],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("tag")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    approval: { id: "approval_456" },
                })
                ; (retrieveCart as jest.Mock).mockResolvedValue(mockCart)
                ; (getCartApprovalStatus as jest.Mock).mockReturnValue({
                    isPendingAdminApproval: false,
                })

            try {
                await startApprovalFlow("approval_456", "cart_789")
            } catch (error: any) {
                expect(error.message).toContain("cartId=cart_789")
                expect(error.message).toContain("step=payment")
            }
        })
    })
})
