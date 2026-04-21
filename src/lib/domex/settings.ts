import type { Payload } from 'payload'

export const DEFAULT_DOMEX_BASE_URL = 'https://www.connectmesecure.com/api/CustomerInwards'
const DEFAULT_DOMEX_SENDER_CONTACT_NO = '0000000000'

type DomexSettingsDoc = {
  defaultCustomerCode?: string | null
  apiKey?: string | null
  baseUrl?: string | null
  senderContactNo?: string | null
}

export type ResolvedDomexSettings = {
  defaultCustomerCode: string
  apiKey: string
  baseUrl: string
  senderContactNo: string
}

const normalize = (value: string | null | undefined): string => value?.trim() || ''

const readDomexSettingsGlobal = async (payload: Payload): Promise<DomexSettingsDoc | null> => {
  try {
    const result = await payload.findGlobal({
      slug: 'domex-settings',
      depth: 0,
    })
    return result as DomexSettingsDoc
  } catch {
    return null
  }
}

export const resolveDomexSettings = async (payload: Payload): Promise<ResolvedDomexSettings> => {
  const globalSettings = await readDomexSettingsGlobal(payload)

  return {
    defaultCustomerCode:
      normalize(globalSettings?.defaultCustomerCode) || normalize(process.env.DOMEX_CUSTOMER_CODE),
    apiKey: normalize(globalSettings?.apiKey) || normalize(process.env.DOMEX_API_KEY),
    baseUrl:
      normalize(globalSettings?.baseUrl) || normalize(process.env.DOMEX_BASE_URL) || DEFAULT_DOMEX_BASE_URL,
    senderContactNo:
      normalize(globalSettings?.senderContactNo) ||
      normalize(process.env.DOMEX_SENDER_CONTACT_NO) ||
      DEFAULT_DOMEX_SENDER_CONTACT_NO,
  }
}
