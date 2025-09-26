import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { validateConnectRequest, validateCallbackRequest } from './validation.ts';

Deno.test('validateConnectRequest - valid UUID', () => {
  const validRequest = { companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
  const result = validateConnectRequest(validRequest);
  assertEquals(result.companyId, validRequest.companyId);
});

Deno.test('validateConnectRequest - invalid UUID format', () => {
  const invalidRequest = { companyId: 'not-a-uuid' };
  assertThrows(
    () => validateConnectRequest(invalidRequest),
    Error,
    'CompanyId must be a valid UUID'
  );
});

Deno.test('validateConnectRequest - missing companyId', () => {
  const invalidRequest = {};
  assertThrows(
    () => validateConnectRequest(invalidRequest),
    Error,
    'Invalid or missing companyId'
  );
});

Deno.test('validateCallbackRequest - valid parameters', () => {
  const validRequest = {
    code: 'test-code',
    state: 'f47ac10b-58cc-4372-a567-0e02b2c3d479:f47ac10b-58cc-4372-a567-0e02b2c3d480',
    realmId: 'test-realm'
  };
  const result = validateCallbackRequest(validRequest);
  assertEquals(result.code, validRequest.code);
  assertEquals(result.state, validRequest.state);
  assertEquals(result.realmId, validRequest.realmId);
});

Deno.test('validateCallbackRequest - invalid state format', () => {
  const invalidRequest = {
    code: 'test-code',
    state: 'invalid-state',
    realmId: 'test-realm'
  };
  assertThrows(
    () => validateCallbackRequest(invalidRequest),
    Error,
    'Invalid state parameter format'
  );
});

Deno.test('validateCallbackRequest - missing parameters', () => {
  const invalidRequest = {};
  assertThrows(
    () => validateCallbackRequest(invalidRequest),
    Error,
    'Invalid or missing code parameter'
  );
});