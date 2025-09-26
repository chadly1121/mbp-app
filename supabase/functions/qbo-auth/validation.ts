// Input validation schemas for QBO Auth function

export interface ConnectRequest {
  companyId: string;
}

export interface CallbackRequest {
  code: string;
  state: string;
  realmId: string;
}

export const validateConnectRequest = (data: any): ConnectRequest => {
  if (!data?.companyId || typeof data.companyId !== 'string') {
    throw new Error('Invalid or missing companyId');
  }
  
  // Validate companyId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.companyId)) {
    throw new Error('CompanyId must be a valid UUID');
  }
  
  return { companyId: data.companyId };
};

export const validateCallbackRequest = (data: any): CallbackRequest => {
  const { code, state, realmId } = data;
  
  if (!code || typeof code !== 'string' || code.length === 0) {
    throw new Error('Invalid or missing code parameter');
  }
  
  if (!state || typeof state !== 'string' || state.length === 0) {
    throw new Error('Invalid or missing state parameter');
  }
  
  if (!realmId || typeof realmId !== 'string' || realmId.length === 0) {
    throw new Error('Invalid or missing realmId parameter');
  }
  
  // Validate state format (userId:companyId both UUIDs)
  const stateParts = state.split(':');
  if (stateParts.length !== 2) {
    throw new Error('Invalid state parameter format');
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(stateParts[0]) || !uuidRegex.test(stateParts[1])) {
    throw new Error('State parameter must contain valid UUIDs');
  }
  
  return { code, state, realmId };
};