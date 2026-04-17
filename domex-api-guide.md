# Domex Global API — Order Tracking Integration Guide

> **Purpose:** Cursor context document for implementing Domex order tracking. Contains all endpoints, field contracts, request/response shapes, validation rules, and error handling needed for a complete integration.

---

## Authentication

Every request **must** include this header:

```
x-api-key: TdkxQz3rLfpkyrZV4zzbsXR68kvJJ1o
```

No other auth mechanism is used. Apply this header globally (e.g. via an Axios instance or a fetch wrapper).

---

## Base URL

```
https://www.connectmesecure.com/api/CustomerInwards
```

---

## Endpoints Overview

| #   | Operation                   | Method | Path                         |
| --- | --------------------------- | ------ | ---------------------------- |
| 1   | Create shipment record      | POST   | `/setCustomerDataEntry`      |
| 2   | Update shipment record      | PUT    | `/updateCustomerDataEntry`   |
| 3   | Delete shipment record      | DELETE | `/DeleteCustomerDataEntry`   |
| 4   | Get waybill details         | GET    | `/getCustomerWayBillDetails` |
| 5   | Get status/tracking history | GET    | `/getCustomerStatusDetails`  |

---

## 1. Create Shipment — `POST /setCustomerDataEntry`

### Request Body (JSON)

```json
{
  "trackingNo": "TR001",
  "refNo": "123",
  "paymentMethod": "Cash",
  "exchange": "No",
  "isPaid": "Yes",
  "beforeDelivered": "2025-04-02T03:59:43.198Z",
  "itemType": "Gift",
  "customerCode": "C001",
  "senderName": "John Doe",
  "senderAddress": "Colombo",
  "senderContactNo": "0771234567",
  "receiverName": "Richard Roe",
  "receiverAddress": "Kandy",
  "receiverCity": "Kandy",
  "receiverContactNo1": "0771234568",
  "receiverContactNo2": "0771234569",
  "packageDesc": "Fragile",
  "weight": 2,
  "remark": "Good",
  "createdUser": "John Doe",
  "keyValue": 0,
  "totalCharges": 1000,
  "noOfPcs": 3
}
```

### Field Reference

| Field                | Type     | Required | Max Length / Rule       |
| -------------------- | -------- | -------- | ----------------------- |
| `trackingNo`         | string   | ✅       | 25 chars                |
| `refNo`              | string   | ❌       | —                       |
| `paymentMethod`      | string   | ❌       | e.g. `"Cash"`, `"Card"` |
| `exchange`           | string   | ❌       | `"Yes"` / `"No"`        |
| `isPaid`             | string   | ❌       | `"Yes"` / `"No"`        |
| `beforeDelivered`    | datetime | ❌       | ISO 8601                |
| `itemType`           | string   | ✅       | **4 chars**             |
| `customerCode`       | string   | ✅       | **6 chars**             |
| `senderName`         | string   | ✅       | 250 chars               |
| `senderAddress`      | string   | ✅       | 250 chars               |
| `senderContactNo`    | string   | ✅       | **15 chars**            |
| `receiverName`       | string   | ✅       | 350 chars               |
| `receiverAddress`    | string   | ✅       | 350 chars               |
| `receiverCity`       | string   | ✅       | 250 chars               |
| `receiverContactNo1` | string   | ✅       | 250 chars               |
| `receiverContactNo2` | string   | ❌       | 250 chars               |
| `packageDesc`        | string   | ✅       | 250 chars               |
| `weight`             | decimal  | ✅       | `> 0`                   |
| `remark`             | string   | ❌       | 250 chars               |
| `createdUser`        | string   | ✅       | 250 chars               |
| `keyValue`           | long     | ❌       | —                       |
| `totalCharges`       | decimal  | ✅       | `> 0`                   |
| `noOfPcs`            | int      | ✅       | `> 0`                   |

### Responses

```json
// 200 Success
{ "errorCode": 200, "message": "The request was successful." }

// 400 Duplicate tracking number
{ "errorCode": 218, "message": "A record with the same TrackingNo already exists." }

// 400 Validation error (example)
{ "status": 400, "errors": { "ItemType": ["Item type cannot exceed 4 characters."] } }

// 500 Server error
{ "errorCode": 500, "message": "An internal server error occurred." }
```

---

## 2. Update Shipment — `PUT /updateCustomerDataEntry`

Same request body shape and field rules as **Create** above, with one difference:

- `noOfPcs` rule is `> 0` (positive integer, not strictly `> 0` decimal)
- `totalCharges` rule is "valid decimal value" (must be `> 0`)

### Responses

```json
// 200 Success
{ "errorCode": 200, "message": "Customer inward record updated successfully." }

// 400 Validation error
{ "status": 400, "errors": { "ItemType": ["Item type cannot exceed 4 characters."] } }

// 500 Server error
{ "errorCode": 500, "message": "An internal server error occurred." }
```

---

## 3. Delete Shipment — `DELETE /DeleteCustomerDataEntry`

### Query Parameters

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `customerCode` | string | ✅       |
| `trackingNo`   | string | ✅       |

### Example

```
DELETE /DeleteCustomerDataEntry?customerCode=C001&trackingNo=TR001
```

### Responses

```json
// 200 Success
{ "errorCode": 200, "message": "Record deleted successfully." }

// 400 Missing field
{ "status": 400, "errors": { "customerCode": ["The customerCode field is required."] } }

// 404 Not found
{ "errorCode": 404, "message": "Record not found with the specified customerCode and trackingNo." }

// 500 Server error
{ "errorCode": 500, "message": "An internal server error occurred.", "details": "..." }
```

---

## 4. Get Waybill Details — `GET /getCustomerWayBillDetails`

### Query Parameters

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `customerCode` | string | ✅       |
| `trackingNo`   | string | ✅       |

### Example

```
GET /getCustomerWayBillDetails?customerCode=C001&trackingNo=TR001
```

### Success Response Shape

```json
{
  "trackingNo": "TR001",
  "refNo": "123",
  "paymentMethod": "Cash",
  "exchange": "No",
  "isPaid": "Yes",
  "itemType": "Parcel",
  "weight": 2,
  "senderName": "John Doe",
  "senderAddress": "Colombo",
  "senderCity": " ",
  "senderContactNo": "0771234567",
  "senderInfo": "",
  "receiverName": "Richard Roe",
  "receiverAddress": "Kandy",
  "receiverCity": "Kandy",
  "receiverContactNo": "0771234568,0771234569",
  "receiverInfo": "",
  "info": "Good",
  "createdDate": "2025-04-01",
  "value": 1000,
  "noOfPcs": 1
}
```

> **Note:** `receiverContactNo` is a **comma-separated string** combining both contact numbers from the create/update calls.

### Response Field Reference

| Field               | Type    | Notes                            |
| ------------------- | ------- | -------------------------------- |
| `trackingNo`        | string  | —                                |
| `refNo`             | string  | —                                |
| `paymentMethod`     | string  | —                                |
| `exchange`          | string  | `"Yes"` / `"No"`                 |
| `isPaid`            | string  | `"Yes"` / `"No"`                 |
| `itemType`          | string  | —                                |
| `weight`            | decimal | —                                |
| `senderName`        | string  | —                                |
| `senderAddress`     | string  | —                                |
| `senderCity`        | string  | May be empty                     |
| `senderContactNo`   | string  | —                                |
| `senderInfo`        | string  | May be empty                     |
| `receiverName`      | string  | —                                |
| `receiverAddress`   | string  | —                                |
| `receiverCity`      | string  | —                                |
| `receiverContactNo` | string  | Comma-separated if two numbers   |
| `receiverInfo`      | string  | May be empty                     |
| `info`              | string  | Maps to `remark` on create       |
| `createdDate`       | string  | `YYYY-MM-DD`                     |
| `value`             | decimal | Maps to `totalCharges` on create |
| `noOfPcs`           | int     | —                                |

### Error Responses

```json
// 404
{ "errorCode": 404, "message": "Customer details not found." }

// 400 Missing customerCode
{ "status": 400, "errors": { "customerCode": ["The customerCode field is required."] } }

// 400 Missing trackingNo
{ "status": 400, "errors": { "trackingNo": ["The trackingNo field is required."] } }
```

---

## 5. Get Status / Tracking History — `GET /getCustomerStatusDetails`

### Query Parameters

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `trackingNo`   | string | ✅       |
| `customerCode` | string | ✅       |

### Example

```
GET /getCustomerStatusDetails?trackingNo=TR001&customerCode=C001
```

### Success Response Shape

Returns an **array** of status event objects, ordered chronologically:

```json
[
  {
    "statusDate": "2025-04-01T09:34:12.7",
    "trackingNo": "TR001",
    "status": "Waiting To Pickup By Customer location",
    "statusCode": "CI",
    "remark": "Good"
  },
  {
    "statusDate": "2025-04-01T10:00:21.443",
    "trackingNo": "TR001",
    "status": "Record Updated By Customer By Customer location",
    "statusCode": "CIU",
    "remark": ""
  }
]
```

### Status Codes Reference

| Code  | Description                            |
| ----- | -------------------------------------- |
| `CI`  | Waiting To Pickup By Customer location |
| `CIU` | Record Updated By Customer             |
| `CD`  | Inward Deleted By Customer             |

> These are the codes documented so far. The API may return additional codes not listed here.

### Response Field Reference

| Field        | Type   | Notes                                   |
| ------------ | ------ | --------------------------------------- |
| `statusDate` | string | ISO 8601 datetime                       |
| `trackingNo` | string | —                                       |
| `status`     | string | Human-readable status label             |
| `statusCode` | string | Machine-readable code (see table above) |
| `remark`     | string | May be empty string                     |

### Error Responses

```json
// 404
{ "errorCode": 404, "message": "No status details found for the given tracking number and customer code." }

// 400 Missing trackingNo
{ "status": 400, "errors": { "trackingNo": ["The trackingNo field is required."] } }

// 400 Missing customerCode
{ "status": 400, "errors": { "customerCode": ["The customerCode field is required."] } }

// 500
{ "errorCode": 500, "message": "An internal server error occurred.", "details": "..." }
```

---

## Implementation Notes for Cursor

### Recommended API Client Setup

```typescript
// domex-client.ts
const DOMEX_BASE = 'https://www.connectmesecure.com/api/CustomerInwards'
const DOMEX_API_KEY = 'cgU70rMwYDvX9dYjdJfwH8XR68kvJJ1o'

const domexHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': DOMEX_API_KEY,
}
```

### Error Handling Strategy

The API returns two different error shapes — handle both:

```typescript
// Shape A: Domex error object
type DomexError = { errorCode: number; message: string; details?: string }

// Shape B: ASP.NET validation error
type ValidationError = {
  type: string
  title: string
  status: 400
  errors: Record<string, string[]>
  traceId: string
}
```

- Check `response.status` first for HTTP-level errors
- Then check `response.errorCode` for Domex-specific errors (e.g. `218` = duplicate tracking number)
- `400` responses can be either shape — check for `errors` key to distinguish

### Tracking Flow for Order Tracking UI

For a typical "track my order" feature, use endpoints in this sequence:

1. **`GET /getCustomerStatusDetails`** — fetch the full event history (use this for the timeline/steps UI)
2. **`GET /getCustomerWayBillDetails`** — fetch shipment details (sender, receiver, package info)

Both require `customerCode` + `trackingNo`. You'll need to either ask the customer to input both, or store `customerCode` as a known constant if it's a single-tenant integration.

### Key Field Constraints to Enforce on Frontend

- `trackingNo` → max 25 chars
- `itemType` → **max 4 chars** (tight limit — validate carefully)
- `customerCode` → **max 6 chars** (tight limit)
- `senderContactNo` → max 15 chars
- `weight`, `totalCharges` → must be `> 0` (use number input, not text)
- `noOfPcs` → positive integer only
- `beforeDelivered` → must be valid ISO 8601 if provided

### cURL Reference — Quick Test Commands

```bash
# Create
curl -X POST 'https://www.connectmesecure.com/api/CustomerInwards/setCustomerDataEntry' \
  -H 'x-api-key: TdkxQz3rLfpkyrZV4zzbsXR68kvJJ1o' \
  -H 'Content-Type: application/json' \
  -d '{"trackingNo":"TR001","itemType":"Gift","customerCode":"C001","senderName":"John Doe","senderAddress":"Colombo","senderContactNo":"0771234567","receiverName":"Richard Roe","receiverAddress":"Kandy","receiverCity":"Kandy","receiverContactNo1":"0771234568","packageDesc":"Fragile","weight":2,"createdUser":"John Doe","totalCharges":1000,"noOfPcs":3}'

# Get waybill
curl -X GET 'https://www.connectmesecure.com/api/CustomerInwards/getCustomerWayBillDetails?customerCode=C001&trackingNo=TR001' \
  -H 'x-api-key: TdkxQz3rLfpkyrZV4zzbsXR68kvJJ1o'

# Get status history
curl -X GET 'https://www.connectmesecure.com/api/CustomerInwards/getCustomerStatusDetails?trackingNo=TR001&customerCode=C001' \
  -H 'x-api-key: TdkxQz3rLfpkyrZV4zzbsXR68kvJJ1o'

# Delete
curl -X DELETE 'https://www.connectmesecure.com/api/CustomerInwards/DeleteCustomerDataEntry?customerCode=C001&trackingNo=TR001' \
  -H 'x-api-key: TdkxQz3rLfpkyrZV4zzbsXR68kvJJ1o'
```

---

## Universal Error Code Reference

| HTTP Status | Error Code | Meaning                                   |
| ----------- | ---------- | ----------------------------------------- |
| 200         | 200        | Success                                   |
| 400         | 218        | Duplicate `trackingNo` (Create only)      |
| 400         | 400        | Validation error (missing/invalid fields) |
| 404         | 404        | Record not found                          |
| 500         | 500        | Internal server error                     |
