# Shift Request API - Demo Request Bodies

This document provides example request bodies for all shift request operations.

## Table of Contents
- [Create Operations](#create-operations)
- [Update Operations](#update-operations)
- [Approval Operations](#approval-operations)
- [Swap Response Operations](#swap-response-operations)

---

## Create Operations

### 1. Shift Swap Request

**Endpoint:** `POST /shift-requests`

```json
{
  "type": "shift_swap",
  "shiftAssignmentId": "shift_abc123",
  "reason": "Personal medical appointment",
  "targetEmploymentIds": ["emp_456", "emp_789"]
}
```

### 2. Leave Request

**Endpoint:** `POST /shift-requests`

```json
{
  "type": "leave_request",
  "startDate": "2026-03-18",
  "endDate": "2026-03-20",
  "leaveType": "sick",
  "reason": "Medical appointment and recovery"
}
```

### 3. Overtime Request

**Endpoint:** `POST /shift-requests`

```json
{
  "type": "overtime_request",
  "requestedDate": "2026-03-15",
  "startTime": "17:00",
  "endTime": "21:00",
  "overtimeHours": 4,
  "overtimeRate": 1.5,
  "reason": "Project deadline - client presentation"
}
```

### 4. Schedule Change Request

**Endpoint:** `POST /shift-requests`

```json
{
  "type": "schedule_change",
  "requestedDate": "2026-03-19",
  "startTime": "08:00",
  "endTime": "16:00",
  "reason": "Need to start earlier for childcare schedule"
}
```

### 5. Manual Attendance Entry

**Endpoint:** `POST /shift-requests`

```json
{
  "type": "manual_attendance",
  "attendanceDate": "2026-03-14",
  "clockInTime": "2026-03-14T09:00:00Z",
  "clockOutTime": "2026-03-14T17:30:00Z",
  "attendanceNotes": "System was down, unable to clock in via mobile app"
}
```

---

## Update Operations

### Update Shift Request

**Endpoint:** `PATCH /shift-requests/:id`

**Example 1: Update basic details**
```json
{
  "reason": "Updated reason with more details"
}
```

**Example 2: Update with status change**
```json
{
  "status": "approved",
  "approvalNotes": "Approved due to valid medical reason"
}
```

**Example 3: Update leave request dates**
```json
{
  "startDate": "2026-03-19",
  "endDate": "2026-03-21",
  "reason": "Extended medical leave required"
}
```

**Example 4: Update overtime hours**
```json
{
  "overtimeHours": 6,
  "reason": "Additional work required for project completion"
}
```

**Example 5: Update swap targets**
```json
{
  "targetEmploymentIds": ["emp_456", "emp_789", "emp_101"],
  "reason": "Expanded target list for better coverage"
}
```

---

## Approval Operations

### Approve Request

**Endpoint:** `POST /shift-requests/:id/approve`

**Example 1: Simple approval**
```json
{
  "approvalNotes": "Approved"
}
```

**Example 2: Approval with detailed notes**
```json
{
  "approvalNotes": "Approved due to valid medical reason. Please submit doctor's note within 48 hours."
}
```

**Example 3: Approval without notes**
```json
{}
```

### Reject Request

**Endpoint:** `POST /shift-requests/:id/reject`

**Example 1: Rejection with reason**
```json
{
  "approvalNotes": "Rejected - insufficient coverage available for this date"
}
```

**Example 2: Rejection with alternative suggestion**
```json
{
  "approvalNotes": "Rejected - please submit request at least 48 hours in advance. You may resubmit for a different date."
}
```

**Example 3: Rejection for policy violation**
```json
{
  "approvalNotes": "Rejected - exceeds maximum overtime hours allowed per week (company policy)"
}
```

---

## Swap Response Operations

### Respond to Swap Request

**Endpoint:** `POST /shift-requests/:id/respond-swap`

**Example 1: Accept swap**
```json
{
  "response": "approved",
  "responseNote": "I can take your shift on Monday"
}
```

**Example 2: Accept swap with conditions**
```json
{
  "response": "approved",
  "responseNote": "Happy to help! Please confirm the exact time with me before finalizing."
}
```

**Example 3: Reject swap**
```json
{
  "response": "rejected",
  "responseNote": "Sorry, I have a prior commitment on that day"
}
```

**Example 4: Reject swap with alternative**
```json
{
  "response": "rejected",
  "responseNote": "I can't do Monday, but I'm available on Tuesday if that helps"
}
```

---

## Cancel Operation

### Cancel Request

**Endpoint:** `POST /shift-requests/:id/cancel`

**Note:** This endpoint does not require a request body. It's a simple POST request.

```
POST /shift-requests/req_123/cancel
```

---

## Query Parameters for GET Operations

### Get All Shift Requests

**Endpoint:** `GET /shift-requests`

**Example queries:**

1. Filter by type and status:
```
GET /shift-requests?type=shift_swap&status=pending
```

2. Filter by date range:
```
GET /shift-requests?startDate=2026-03-01&endDate=2026-03-31
```

3. Filter with pagination:
```
GET /shift-requests?page=1&limit=20&sort=createdAt:desc
```

4. Search with filters:
```
GET /shift-requests?search=medical&priority=high&status=pending
```

5. Filter by business:
```
GET /shift-requests?businessId=bus_123&status=approved
```

### Get My Requests

**Endpoint:** `GET /shift-requests/my-requests`

**Example queries:**

1. My pending requests:
```
GET /shift-requests/my-requests?status=pending
```

2. My leave requests:
```
GET /shift-requests/my-requests?type=leave_request
```

3. My requests with search:
```
GET /shift-requests/my-requests?search=overtime&sort=createdAt:desc
```

### Get Pending Swaps

**Endpoint:** `GET /shift-requests/pending-swaps`

**Example queries:**

1. All pending swaps targeting me:
```
GET /shift-requests/pending-swaps
```

2. With pagination:
```
GET /shift-requests/pending-swaps?page=1&limit=10
```

3. With search:
```
GET /shift-requests/pending-swaps?search=Monday
```

### Get Business Requests

**Endpoint:** `GET /shift-requests/business/:businessId`

**Example queries:**

1. All requests for a business:
```
GET /shift-requests/business/bus_123
```

2. Filtered by status:
```
GET /shift-requests/business/bus_123?status=pending&priority=urgent
```

3. Filtered by employee:
```
GET /shift-requests/business/bus_123?employmentId=emp_456
```

---

## Enums Reference

### RequestType
- `shift_swap`
- `leave_request`
- `overtime_request`
- `schedule_change`
- `manual_attendance`

### RequestStatus
- `pending`
- `approved`
- `rejected`
- `cancelled`
- `expired`

### RequestPriority
- `low`
- `medium`
- `high`
- `urgent`

### LeaveType
- `sick`
- `vacation`
- `personal`
- `unpaid`
- `other`

---

## Notes

1. **Authentication:** All endpoints require JWT authentication via Bearer token
2. **Date Formats:** 
   - Dates: ISO 8601 format (YYYY-MM-DD)
   - DateTimes: ISO 8601 format with timezone (YYYY-MM-DDTHH:mm:ssZ)
   - Times: HH:mm format
3. **Required Fields:** Vary by request type (see validation rules in DTOs)
4. **Employment Context:** Most operations use the authenticated user's employment context
5. **Permissions:** Some operations require specific permissions (approve/reject typically require manager role)
