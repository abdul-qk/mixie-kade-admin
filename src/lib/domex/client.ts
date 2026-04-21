type DomexValidationError = {
  status?: number
  errors?: Record<string, string[]>
  title?: string
  type?: string
}

type DomexErrorShape = {
  errorCode?: number
  message?: string
  details?: string
}

export type DomexShipmentRequest = {
  trackingNo: string
  refNo?: string
  paymentMethod?: string
  exchange?: 'Yes' | 'No'
  isPaid?: 'Yes' | 'No'
  beforeDelivered?: string
  itemType: string
  customerCode: string
  senderName: string
  senderAddress: string
  senderContactNo: string
  receiverName: string
  receiverAddress: string
  receiverCity: string
  receiverContactNo1: string
  receiverContactNo2?: string
  packageDesc: string
  weight: number
  remark?: string
  createdUser: string
  keyValue?: number
  totalCharges: number
  noOfPcs: number
}

export type DomexStatusEvent = {
  statusDate: string
  trackingNo: string
  status: string
  statusCode: string
  remark: string
}

export type DomexWaybillDetails = {
  trackingNo: string
  refNo?: string
  paymentMethod?: string
  exchange?: string
  isPaid?: string
  itemType?: string
  weight?: number
  senderName?: string
  senderAddress?: string
  senderCity?: string
  senderContactNo?: string
  senderInfo?: string
  receiverName?: string
  receiverAddress?: string
  receiverCity?: string
  receiverContactNo?: string
  receiverInfo?: string
  info?: string
  createdDate?: string
  value?: number
  noOfPcs?: number
}

export class DomexApiError extends Error {
  status: number
  details?: string
  validation?: Record<string, string[]>

  constructor(params: {
    message: string
    status: number
    details?: string
    validation?: Record<string, string[]>
  }) {
    super(params.message)
    this.name = 'DomexApiError'
    this.status = params.status
    this.details = params.details
    this.validation = params.validation
  }
}

type DomexClientConfig = {
  apiKey: string
  baseUrl: string
}

const validateShipmentRequest = (payload: DomexShipmentRequest): void => {
  if (!payload.trackingNo || payload.trackingNo.length > 25) {
    throw new DomexApiError({ message: 'trackingNo must be present and <= 25 chars.', status: 400 })
  }
  if (!payload.itemType || payload.itemType.length > 4) {
    throw new DomexApiError({ message: 'itemType must be present and <= 4 chars.', status: 400 })
  }
  if (!payload.customerCode || payload.customerCode.length > 6) {
    throw new DomexApiError({ message: 'customerCode must be present and <= 6 chars.', status: 400 })
  }
  if (!payload.senderContactNo || payload.senderContactNo.length > 15) {
    throw new DomexApiError({ message: 'senderContactNo must be present and <= 15 chars.', status: 400 })
  }
  if (!(payload.weight > 0) || !(payload.totalCharges > 0) || !(payload.noOfPcs > 0)) {
    throw new DomexApiError({
      message: 'weight, totalCharges, and noOfPcs must be positive numbers.',
      status: 400,
    })
  }
  if (!Number.isInteger(payload.noOfPcs)) {
    throw new DomexApiError({ message: 'noOfPcs must be an integer.', status: 400 })
  }
}

const normalizeError = async (response: Response): Promise<DomexApiError> => {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = null
  }

  const validation = body as DomexValidationError
  if (validation && validation.errors) {
    return new DomexApiError({
      message: 'Domex validation error.',
      status: response.status,
      validation: validation.errors,
    })
  }

  const domexErr = body as DomexErrorShape
  return new DomexApiError({
    message: domexErr?.message || `Domex API request failed with status ${response.status}.`,
    status: response.status,
    details: domexErr?.details,
  })
}

const ensureCredentials = (config: DomexClientConfig): void => {
  if (!config.apiKey) {
    throw new DomexApiError({
      message: 'DOMEX_API_KEY is not configured.',
      status: 500,
    })
  }
}

const request = async <T>(path: string, init: RequestInit, config: DomexClientConfig): Promise<T> => {
  ensureCredentials(config)
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw await normalizeError(response)
  }

  const body = await response.json()
  return body as T
}

export const domexClient = {
  async createShipment(
    payload: DomexShipmentRequest,
    config: DomexClientConfig,
  ): Promise<{ errorCode?: number; message?: string }> {
    validateShipmentRequest(payload)
    return request('/setCustomerDataEntry', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, config)
  },

  async updateShipment(
    payload: DomexShipmentRequest,
    config: DomexClientConfig,
  ): Promise<{ errorCode?: number; message?: string }> {
    validateShipmentRequest(payload)
    return request('/updateCustomerDataEntry', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, config)
  },

  async getStatusDetails(params: {
    trackingNo: string
    customerCode: string
  }, config: DomexClientConfig): Promise<DomexStatusEvent[]> {
    const query = new URLSearchParams(params).toString()
    return request(`/getCustomerStatusDetails?${query}`, { method: 'GET' }, config)
  },

  async getWaybillDetails(params: {
    trackingNo: string
    customerCode: string
  }, config: DomexClientConfig): Promise<DomexWaybillDetails> {
    const query = new URLSearchParams(params).toString()
    return request(`/getCustomerWayBillDetails?${query}`, { method: 'GET' }, config)
  },
}
