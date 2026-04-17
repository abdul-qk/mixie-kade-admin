# Domex Tracking Runbook

## Environment Setup

Set these environment variables before using Domex tracking:

- `DOMEX_API_KEY`: API key from Domex
- `DOMEX_BASE_URL`: defaults to `https://www.connectmesecure.com/api/CustomerInwards`
- `DOMEX_SENDER_CONTACT_NO`: sender phone used in shipment payload

## Admin Manual Workflow

1. Open an order in admin.
2. Fill `trackingNo` and `domexCustomerCode`.
3. Verify delivery fields exist: `customerName`, `customerPhone`, `deliveryAddress`, `deliveryCity`.
4. Click `Dispatch to Domex`.
5. Confirm `shipmentStatusLabel` / `shipmentStatusCode` are populated.
6. Use `Sync Tracking` whenever the customer asks for a fresh status.

## Failure Handling

- **Duplicate trackingNo (`218`)**: change `trackingNo`, retry dispatch.
- **Validation errors**: correct mapped order fields and retry.
- **500/network issues**: retry `Sync Tracking`; check `shipmentSyncMeta.lastError` and `retryCount`.
- **Missing tracking fields**: dispatch is blocked until `trackingNo` + `domexCustomerCode` are provided.

## Customer Manual Workflow

- Logged-in and guest customers view tracking in order details when tracking exists.
- Customers can click `Refresh Tracking` to pull latest Domex events.
- No extra customer input is required for normal account/guest order views.

## Test Matrix

- **Dispatch success**: admin dispatches order and sees status + events saved.
- **Sync success**: admin sync updates timeline and latest status.
- **Duplicate tracking**: Domex returns `218` and error is surfaced.
- **Validation failure**: missing/invalid required fields return actionable error.
- **Guest visibility**: tokenized guest order page shows tracking section.
- **Status/amount regression**: account + orders list uses valid order status and `amount`.
