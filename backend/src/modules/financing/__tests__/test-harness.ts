/**
 * Test Harness for Financing Module
 * Provides mock manager/repository for unit tests
 */

export function createMockFinancingRepository() {
  return {
    listFinancingApplications_: jest.fn(),
    retrieveFinancingApplication_: jest.fn(),
    createFinancingApplications_: jest.fn(),
    updateFinancingApplications_: jest.fn(),
  };
}

export function injectMocksIntoService(service: any, mocks: any) {
  Object.keys(mocks).forEach((key) => {
    service[key] = mocks[key];
  });
}
