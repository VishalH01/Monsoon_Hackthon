# ResQNest Backend API Testing Guide

This guide contains complete, copy-pasteable endpoints, parameters, and payloads to test all core modules of **ResQNest** on your local running server (`http://localhost:8080`).

For endpoints that require authentication, add the following header to your request:  
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication & Public Endpoints (No Auth Header Needed)

### 📝 User Registration
* **Method**: `POST`
* **URL**: `/auth/register` (also supports `/api/auth/register`)
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "victim_test",
  "email": "victim_test@example.com",
  "password": "password123",
  "role": "VICTIM",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "location": "Sector 5, Flood Area",
  "acceptTerms": true
}
```
*(Available roles: `ADMIN`, `VICTIM`, `VOLUNTEER`, `NGO`, `SHELTER_MANAGER`)*

### 🔑 User Login
* **Method**: `POST`
* **URL**: `/auth/login` (also supports `/api/auth/login`)
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "victim_test",
  "password": "password123"
}
```
*(Returns a JSON response containing the `"token"`. Copy this token for subsequent authenticated endpoints)*

### 📊 Landing Page Stats
* **Method**: `GET`
* **URL**: `/api/stats` (also supports `/stats`)
* **Headers**: None
* **Test Value / Response**: Returns live statistics (`avgResponse`, `livesImpacted`, `countries`, `volunteers`).

---

## 2. User Profile & Check-In Endpoints (JWT Token Required)

### 👤 Get Current User Profile
* **Method**: `GET`
* **URL**: `/users/profile` (also supports `/api/users/profile`)
* **Headers**: `Authorization: Bearer <token>`
* **Test Value / Response**: Returns the logged-in user's profile and notification settings.

### ✏️ Update User Profile
* **Method**: `PUT`
* **URL**: `/users/profile` (also supports `/api/users/profile`)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "victim_test",
  "email": "victim_test@example.com",
  "fullName": "John Doe Junior",
  "phone": "+1234567899",
  "location": "Sector 5, Flood Area - Shelter A",
  "emailAlerts": false,
  "smsAlerts": true,
  "pushNotifications": true
}
```

### 🔒 Change Password
* **Method**: `PUT`
* **URL**: `/users/change-password` (also supports `/api/users/change-password`)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### 📌 Victim Check-In
* **Method**: `POST`
* **URL**: `/users/check-in` (also supports `/api/users/check-in`)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "safetyStatus": "SAFE"
}
```
*(Status values: `SAFE`, `AFFECTED`, `UNSAFE`)*

---

## 3. SOS Distress Call Endpoints (JWT Token Required)

### 🚨 Raise SOS (JSON Payload)
* **Method**: `POST`
* **URL**: `/sos` (also supports `/api/sos` and `/api/v1/sos`)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "description": "Trapped on terrace due to rising water level.",
  "location": "Hebbal Flyover, Block C",
  "disasterType": "Flood",
  "peopleAffected": 4,
  "age": 72,
  "severity": 5,
  "hasChildren": true,
  "isMedicalEmergency": true,
  "isDisabled": false
}
```

### 🚨 Raise SOS (Multipart Form-Data - Supporting Image Upload)
* **Method**: `POST`
* **URL**: `/sos` (also supports `/api/sos` and `/api/v1/sos`)
* **Headers**: `Authorization: Bearer <token>`
* **Content-Type**: `multipart/form-data`
* **Form Parameters**:
  * `latitude`: `12.9716` (Double, Required)
  * `longitude`: `77.5946` (Double, Required)
  * `description`: `Visual of flooding` (String, Optional)
  * `location`: `Hebbal Flyover, Block C` (String, Optional)
  * `disasterType`: `Flood` (String, Optional)
  * `peopleAffected`: `4` (Integer, Optional)
  * `age`: `72` (Integer, Optional)
  * `severity`: `5` (Integer, Optional)
  * `hasChildren`: `true` (Boolean, Optional)
  * `isMedicalEmergency`: `true` (Boolean, Optional)
  * `isDisabled`: `false` (Boolean, Optional)
  * `image`: (File attachment, Optional)

### 📋 List SOS Distress Alerts (Sorted by Priority)
* **Method**: `GET`
* **URL**: `/sos` (also supports `/api/sos` and `/api/v1/sos`)
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters (Optional)**:
  * `status`: `PENDING` *(Filter options: `PENDING`, `ASSIGNED`, `ACTIVE`, `RESOLVED`)*

### 🤝 Assign Volunteer to SOS Alert
* **Method**: `PUT`
* **URL**: `/sos/{id}/assign` (Replace `{id}` with the target SOS ID)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "volunteerId": 2
}
```

### 📋 Update SOS Status
* **Method**: `PUT`
* **URL**: `/sos/{id}` (Replace `{id}` with the target SOS ID)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "status": "ACTIVE"
}
```

### ⚡ Force Priority Recalculation (Admin Only)
* **Method**: `POST`
* **URL**: `/priority` (also supports `/api/priority` and `/api/v1/priority`)
* **Headers**: `Authorization: Bearer <token>`

---

## 4. Shelter Management Endpoints (JWT Token Required)

### 🏠 Create New Shelter
* **Method**: `POST`
* **URL**: `/api/v1/shelters`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "name": "Shelter Delta (Central High School)",
  "address": "456 Central Avenue",
  "latitude": 12.9650,
  "longitude": 77.5850,
  "capacity": 200,
  "occupied": 0,
  "status": "ACTIVE",
  "contactPhone": "+15550199",
  "amenities": "Food, Medical Kits, Water"
}
```

### 📋 List All Shelters
* **Method**: `GET`
* **URL**: `/api/v1/shelters`
* **Headers**: `Authorization: Bearer <token>`

### 📍 Query Nearby Shelters (Sorted by Distance)
* **Method**: `GET`
* **URL**: `/api/v1/shelters/nearby`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `latitude`: `12.9700`
  * `longitude`: `77.5900`
*(Returns shelters sorted by Haversine distance, including computed distance and occupancy rate)*

### 👥 Assign Resident to Shelter
* **Method**: `POST`
* **URL**: `/api/v1/shelters/{id}/residents/{userId}` (Replace `{id}` with Shelter ID, `{userId}` with Victim User ID)
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters (Optional)**:
  * `room`: `Room-3A`
  * `specialNeeds`: `Requires wheelchair access`

### 👥 List Shelter Residents
* **Method**: `GET`
* **URL**: `/api/v1/shelters/{id}/residents` (Replace `{id}` with Shelter ID)
* **Headers**: `Authorization: Bearer <token>`

---

## 5. Stripe Payments & Donations Endpoints (JWT Token Required)

### 🎁 Record New Donation
* **Method**: `POST`
* **URL**: `/api/v1/donations`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "donorName": "Marcus Aurelius",
  "donorType": "Individual",
  "donorEmail": "marcus@rome.com",
  "donationType": "MONEY",
  "amount": 250.00,
  "notes": "Emergency shelter relief fund contribution"
}
```

### 💳 Generate Stripe Checkout Session
* **Method**: `POST`
* **URL**: `/api/v1/payments/create-session/{donationId}` (Replace `{donationId}` with the ID returned above)
* **Headers**: `Authorization: Bearer <token>`
* **Test Value / Response**: Returns a Stripe-hosted `"checkoutUrl"`. Copy and open it in a browser to test the live credit card interface.

### 💳 Direct Redirect Success Verification (Backup Flow)
* **Method**: `GET`
* **URL**: `/api/v1/payments/success`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `session_id`: `cs_test_a1vQY2fSZ3YUFQ...` (Stripe Session ID)
  * `donation_id`: `1` (Donation ID)

### 💳 Stripe Webhook Listener (Production Flow)
* **Method**: `POST`
* **URL**: `/api/v1/payments/webhook`
* **Headers**: `Stripe-Signature: t=1782462498,v1=mock_signature`
* **Request Body**: Raw JSON payload forwarded by Stripe.

---

## 6. Dashboard & Operational Reports (JWT Token Required)

### 📊 Coordinator Dashboard Metrics
* **Method**: `GET`
* **URL**: `/dashboard` (also supports `/api/dashboard`)
* **Headers**: `Authorization: Bearer <token>`

### 📈 Operations Summary Report (Admin Only)
* **Method**: `GET`
* **URL**: `/api/v1/reports/summary`
* **Headers**: `Authorization: Bearer <token>`

### 🗃️ Missing Persons Dashboard Stats
* **Method**: `GET`
* **URL**: `/api/v1/missing-persons/stats`
* **Headers**: `Authorization: Bearer <token>`

### 📦 Relief Distribution Dashboard Stats
* **Method**: `GET`
* **URL**: `/api/v1/distributions/stats`
* **Headers**: `Authorization: Bearer <token>`

---

## 7. QR Verification Endpoints (JWT Token Required)

### 🎫 Generate Verification QR Code
* **Method**: `POST`
* **URL**: `/qr/generate`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "sosId": 3
}
```
*(Returns a time-sensitive verification token and scan-ready Base64-encoded PNG image)*

### 🎫 Verify QR and Complete Rescue Mission
* **Method**: `POST`
* **URL**: `/qr/verify` (also supports `/api/v1/qr/verify`)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "sosId": 3,
  "token": "94ffa68a-3620-4be6-a852-9666c84a9f1b"
}
```
*(Replace `token` with the value returned from the generator. Resolves the SOS alert upon successful verification)*
