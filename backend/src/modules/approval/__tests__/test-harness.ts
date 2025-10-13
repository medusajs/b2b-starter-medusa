/**
 * Test Harness for Approval Module
 * Provides mock manager/repository for unit tests
 */

export function createMockApprovalRepository() {
  return {
    listApprovalRules_: jest.fn(),
    listAndCountApprovals_: jest.fn(),
    createApprovalHistories_: jest.fn(),
    retrieveApproval_: jest.fn(),
    listApprovalSettingses_: jest.fn(),
    createApprovals_: jest.fn(),
    updateApprovals_: jest.fn(),
  };
}

export function injectMocksIntoService(service: any, mocks: any) {
  Object.keys(mocks).forEach((key) => {
    service[key] = mocks[key];
  });
}
