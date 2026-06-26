# ResQNest Backend API

Welcome to the backend server of **ResQNest**—a Spring Boot application designed for search & rescue, shelter, and volunteer management during disasters.

---

## 🚀 Tech Stack
- **Framework**: Spring Boot 3.x (with Java 17)
- **Security**: Spring Security & JWT (JSON Web Token)
- **Database**: Aiven Cloud MySQL (PostgreSQL/H2 options configured)
- **Build Tool**: Maven

---

## 📂 Code & Package Structure

The project follows a standard clean architecture layout under `com.example.demo`:
- `config/` - Custom configuration classes (CORS, Security filter chains, encoders).
- `controller/` - REST Controllers defining API endpoints.
- `dto/` - Request and Response Data Transfer Objects (DTOs) with validations.
- `entity/` - Hibernate/JPA entity models mapping to database tables.
- `exception/` - Custom exception definitions and global exception handlers.
- `repository/` - JPA Repositories for database operations.
- `security/` - JWT utilities, filters, and custom user detail services.
- `service/` - Interface declarations for core business logic.
  - `impl/` - Concrete implementation of service interfaces.
- `util/` - Constants and helper utilities.

---

## 🛢️ Database Configuration
The application is pre-configured to connect to a **hosted Aiven Cloud MySQL** instance over SSL.

Connection parameters are defined in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://resqnest-1-project-3685.l.aivencloud.com:27334/defaultdb?useSSL=true&requireSSL=true&verifyServerCertificate=false&serverTimezone=UTC
spring.datasource.username=avnadmin
spring.datasource.password=AVNS_TIuT5Rfl2IeptFMxNpB
```

> [!NOTE]
> If you need to switch to a zero-setup local database for testing, you can comment out the MySQL lines and uncomment the H2 configuration block in `application.properties`.

---

## 🔑 Authentication & Role-Based Authorization
We use **JWT-based stateless authentication**. The application supports five roles:
1. `ADMIN`
2. `VICTIM`
3. `VOLUNTEER`
4. `NGO`
5. `SHELTER_MANAGER`

You can restrict endpoint access using Spring's `@PreAuthorize` annotation (e.g., `@PreAuthorize("hasRole('ADMIN')")`).

---

## 📡 API Endpoints

### 1. Authentication Endpoints

#### 📝 Register a New User
- **URL**: `/auth/register` (also supports `/api/auth/register`)
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "VOLUNTEER"
  }
  ```
- **Response**: `200 OK` `"User registered successfully!"`

#### 🔑 Login User
- **URL**: `/auth/login` (also supports `/api/auth/login`)
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "john_doe", // Supports username OR email
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "VOLUNTEER"
  }
  ```

---

### 2. User Management Endpoints
Include the JWT token in your request headers: `Authorization: Bearer <your_jwt_token>`

#### 👤 Get Current User Profile
- **URL**: `/users/profile` (also supports `/api/users/profile`)
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "VOLUNTEER"
  }
  ```

#### ✏️ Update Profile Details
- **URL**: `/users/profile` (also supports `/api/users/profile`)
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "username": "john_doe_updated",
    "email": "john_new@example.com"
  }
  ```
- **Response**: `200 OK` (returns updated UserProfileResponse)

#### 🔒 Change Password
- **URL**: `/users/change-password` (also supports `/api/users/change-password`)
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "currentPassword": "securepassword",
    "newPassword": "newsecurepassword"
  }
  ```
- **Response**: `200 OK` `"Password changed successfully!"`

#### 👑 Admin User Management CRUD
Admin actions are secured under `/api/admin/users`:
- `GET /api/admin/users` - Retrieves a list of all users.
- `GET /api/admin/users/{id}` - Retrieves a specific user by ID.
- `PUT /api/admin/users/{id}` - Updates a user's details and role. Body:
  ```json
  {
    "username": "updated_username",
    "email": "updated_email@example.com",
    "role": "SHELTER_MANAGER"
  }
  ```
- `DELETE /api/admin/users/{id}` - Deletes a user by ID.

---

### 3. SOS Module Endpoints
Distress calls, volunteer assignments, and mission state flows.

#### 🚨 Raise One-Click SOS (Victim / Guest)
Submit an emergency distress call. Supports optional text description and optional photo attachment.
- **URL**: `/sos` (also supports `/api/sos` and `/api/v1/sos`)
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` or `application/json` (optional)
- **Form Parameters (for multipart/form-data)**:
  - `latitude` (Double, Required) - GPS Latitude.
  - `longitude` (Double, Required) - GPS Longitude.
  - `description` (String, Optional) - Short detail about the situation.
  - `image` (File, Optional) - Image/photo file from camera or gallery.
  - `age` (Integer, Optional, Default: 30) - Age of victim.
  - `severity` (Integer, Optional, Default: 1) - Severity level.
  - `hasChildren` (Boolean, Optional, Default: false) - Whether children are present.
  - `isMedicalEmergency` (Boolean, Optional, Default: false) - Medical emergency flag.
  - `isDisabled` (Boolean, Optional, Default: false) - Disabled flag.
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "description": "Flooding near the main road",
    "imageUrl": "/uploads/a3b1-4c6e-8f92-image.jpg",
    "status": "PENDING",
    "priority": "HIGH",
    "victimUsername": "john_doe", // "Guest" if submitted unauthenticated
    "volunteerUsername": null,
    "createdAt": "2026-06-26T12:00:00",
    "updatedAt": "2026-06-26T12:00:00"
  }
  ```

#### 📋 View All SOS Alerts (Admin / Volunteer / NGO)
- **URL**: `/sos` (also supports `/api/sos` and `/api/v1/sos`)
- **Method**: `GET`
- **Query Parameter**: `status` (Optional, values: `PENDING`, `ASSIGNED`, `ACTIVE`, `RESOLVED`)
- **Response**: `200 OK` (list of SOSResponse objects sorted dynamically by real-time waiting-time-adjusted priority scores)

#### 🤝 Update SOS Status Directly (Admin / NGO / Volunteer)
- **URL**: `/sos/{id}` (also supports `/api/sos/{id}` and `/api/v1/sos/{id}`)
- **Method**: `PUT`
- **Query Parameter or Request Body**: `status` (Required, values: `PENDING`, `ASSIGNED`, `ACTIVE`, `RESOLVED`)
- **Response**: `200 OK` (returns updated SOSResponse)

#### 🤝 Assign Volunteer to Mission (Admin / NGO)
- **URL**: `/sos/{id}/assign` (also supports `/api/sos/{id}/assign` and `/api/v1/sos/{id}/assign`)
- **Method**: `PUT`
- **Query Parameter or Request Body**: `volunteerId` (Required)
- **Response**: `200 OK` (returns updated SOSResponse with status `ASSIGNED`)

#### ⚡ Recalculate Dynamic Priority Scores (Admin Only)
Triggers dynamic recalculation of priority scores for all active calls based on waiting times and logs the transitions.
- **URL**: `/priority` (also supports `/api/priority` and `/api/v1/priority`)
- **Method**: `POST`
- **Response**: `200 OK` `"Dynamic priorities recalculated and logged successfully!"`

#### 🗺️ View My Assigned Missions (Volunteer)
- **URL**: `/api/volunteer/sos/my-missions`
- **Method**: `GET`
- **Response**: `200 OK` (returns a list of SOSResponse assigned to the volunteer)

#### 🛡️ Accept a Mission (Volunteer)
- **URL**: `/api/volunteer/sos/{id}/accept`
- **Method**: `PUT`
- **Response**: `200 OK` (returns updated SOSResponse with status `ACTIVE`)

#### ✅ Complete a Mission (Volunteer)
- **URL**: `/api/volunteer/sos/{id}/complete`
- **Method**: `PUT`
- **Response**: `200 OK` (returns updated SOSResponse with status `RESOLVED`)

---

### 4. Dashboard Endpoint
Provides aggregated statistics for Admins and NGOs to coordinate disaster response.

#### 📊 Get Dashboard Analytics
- **URL**: `/dashboard` (also supports `/api/dashboard`)
- **Method**: `GET`
- **Allowed Roles**: `ADMIN`, `NGO`
- **Response**: `200 OK`
  ```json
  {
    "activeSOSCount": 3,
    "resolvedSOSCount": 12,
    "volunteersOnline": 8,
    "sheltersAvailable": 2,
    "inventoryAlertsCount": 2,
    "shelterOccupancyRate": 40.0,
    "activeMissionsCount": 1,
    "criticalInventoryAlerts": [
      {
        "id": 1,
        "itemName": "Water Bottle Packs (24-pack)",
        "quantity": 30,
        "threshold": 100,
        "category": "Water",
        "unit": "Packs",
        "updatedAt": "2026-06-26T12:00:00"
      },
      {
        "id": 2,
        "itemName": "Trauma First Aid Kits",
        "quantity": 8,
        "threshold": 20,
        "category": "Medical",
        "unit": "Kits",
        "updatedAt": "2026-06-26T12:00:00"
      }
    ],
    "recentSOSAlerts": [
      {
        "id": 5,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "description": "Flooding near Civic Plaza",
        "imageUrl": null,
        "status": "PENDING",
        "victimUsername": "Guest",
        "volunteerUsername": null,
        "createdAt": "2026-06-26T12:45:00",
        "updatedAt": "2026-06-26T12:45:00"
      }
    ]
  }
  ```

---

### 5. WebSocket Real-time Updates Endpoint
Provides real-time updates to connected clients (Admins, NGOs, and Volunteers) via a raw WebSocket channel.

- **WebSocket URL**: `ws://localhost:8080/ws/live`
- **Method**: Connection Handshake (`GET` upgrade request)
- **Allowed Roles**: Public handshake permitted; payload-based message parsing is handled server-side.

#### 📡 Outgoing Event Payloads (Server-to-Client)
The server pushes JSON messages when events occur:

1. **`NEW_SOS`**: Emitted when a new emergency distress call is submitted.
   ```json
   {
     "type": "NEW_SOS",
     "data": {
       "id": 12,
       "latitude": 12.9716,
       "longitude": 77.5946,
       "description": "Rising floodwaters",
       "imageUrl": "/uploads/image.jpg",
       "status": "PENDING",
       "victimUsername": "victim_user",
       "volunteerUsername": null,
       "createdAt": "2026-06-26T13:10:00",
       "updatedAt": "2026-06-26T13:10:00"
     }
   }
   ```

2. **`VOLUNTEER_ACCEPTED`**: Emitted when a volunteer is assigned to or accepts a rescue mission.
   ```json
   {
     "type": "VOLUNTEER_ACCEPTED",
     "data": {
       "id": 12,
       "latitude": 12.9716,
       "longitude": 77.5946,
       "description": "Rising floodwaters",
       "imageUrl": "/uploads/image.jpg",
       "status": "ACTIVE",
       "victimUsername": "victim_user",
       "volunteerUsername": "volunteer_bob",
       "createdAt": "2026-06-26T13:10:00",
       "updatedAt": "2026-06-26T13:12:00"
     }
   }
   ```

3. **`RELIEF_DELIVERED`**: Emitted when a volunteer successfully completes/resolves a rescue mission.
   ```json
   {
     "type": "RELIEF_DELIVERED",
     "data": {
       "id": 12,
       "latitude": 12.9716,
       "longitude": 77.5946,
       "description": "Rising floodwaters",
       "imageUrl": "/uploads/image.jpg",
       "status": "RESOLVED",
       "victimUsername": "victim_user",
       "volunteerUsername": "volunteer_bob",
       "createdAt": "2026-06-26T13:10:00",
       "updatedAt": "2026-06-26T13:15:00"
     }
   }
   ```

4. **`DASHBOARD_UPDATE`**: Emitted immediately following any of the events above. Contains the fully updated metrics matching the `/api/dashboard` REST response.
   ```json
   {
     "type": "DASHBOARD_UPDATE",
     "data": {
       "activeSOSCount": 2,
       "resolvedSOSCount": 13,
       "volunteersOnline": 8,
       "sheltersAvailable": 2,
       "inventoryAlertsCount": 2,
       "shelterOccupancyRate": 40.0,
       "activeMissionsCount": 1,
       "criticalInventoryAlerts": [...],
       "recentSOSAlerts": [...]
     }
   }
   ```

#### 📡 Incoming Event Payloads (Client-to-Server)
Clients (specifically Volunteers) can push coordinates in real-time. The server will update the volunteer coordinates in the database and broadcast a `VOLUNTEER_LOCATION` message to all active WebSocket sessions.

- **`VOLUNTEER_LOCATION`** (Client-to-Server structure):
  ```json
  {
    "type": "VOLUNTEER_LOCATION",
    "data": {
      "volunteerId": 3,
      "latitude": 12.9725,
      "longitude": 77.5940
    }
  }
  ```
- **Broadcast event** (Server-to-Client broadcast structure):
  ```json
  {
    "type": "VOLUNTEER_LOCATION",
    "data": {
      "volunteerId": 3,
      "latitude": 12.9725,
      "longitude": 77.5940,
      "name": "Alice Smith"
    }
  }
  ```

---

### 6. QR Code Verification Module
Provides secure, time-sensitive QR code generation and verification to confirm relief deliveries.

#### 🎫 Generate Verification QR Code
Generates a time-sensitive verification token (valid for 15 minutes) and returns a scan-ready Base64-encoded PNG image.
- **URL**: `/qr/generate` or `/qr/generate/{sosId}` (also supports `/api/v1/qr/generate/{sosId}`)
- **Method**: `POST`
- **Allowed Roles**: `VICTIM` (must own the SOS alert), `ADMIN`
- **Parameters**: `sosId` can be provided as a Path Variable, a Query Parameter (`?sosId=...`), or in the JSON Request Body:
  ```json
  {
    "sosId": 12
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "sosId": 12,
    "token": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
    "expiresAt": "2026-06-26T13:40:00",
    "qrCodeImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
  ```

#### 🎫 Verify QR and Resolve Alert
Verifies the scanned QR token. If the token is valid, has not expired, and the verifying user is the assigned volunteer (or admin), the SOS alert is marked as `RESOLVED`, the token is cleared, and WebSocket update events are broadcast.
- **URL**: `/qr/verify` (also supports `/api/v1/qr/verify`)
- **Method**: `POST`
- **Allowed Roles**: `VOLUNTEER` (must be assigned to the SOS alert), `ADMIN`
- **Request Body**:
  ```json
  {
    "sosId": 12,
    "token": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Relief successfully verified and delivered! Mission completed.",
    "resolvedSosId": 12,
    "resolvedAt": "2026-06-26T13:30:00"
  }
  ```

---

### 7. Test Endpoints (Verifying Access Control)
Include the JWT token in your request headers: `Authorization: Bearer <your_jwt_token>`

| Endpoint | Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/test/all` | `GET` | *Public* | Anyone can access (no token needed) |
| `/api/test/user` | `GET` | `ADMIN`, `VICTIM`, `VOLUNTEER`, `NGO`, `SHELTER_MANAGER` | Any logged-in user |
| `/api/test/admin` | `GET` | `ADMIN` | Restricted to administrators |
| `/api/test/victim` | `GET` | `VICTIM` | Restricted to victims |
| `/api/test/volunteer` | `GET` | `VOLUNTEER` | Restricted to volunteers |
| `/api/test/ngo` | `GET` | `NGO` | Restricted to NGO agents |
| `/api/test/shelter-manager` | `GET` | `SHELTER_MANAGER` | Restricted to shelter managers |

---

### 8. Stripe Payment Integration Module
Provides secure, Stripe-hosted Checkout sessions for monetary donations, with automated database updates upon payment completion.

#### 💳 Create Stripe Checkout Session
Generates a Stripe Checkout Session URL for a pending monetary donation.
- **URL**: `/api/v1/payments/create-session/{donationId}`
- **Method**: `POST`
- **Allowed Roles**: *Public* (or any role matching donation access)
- **Response**: `200 OK`
  ```json
  {
    "sessionId": "cs_test_a1b2c3...",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_a1b2c3...",
    "status": "unpaid",
    "donationId": 5,
    "amount": 150.0
  }
  ```

#### 💳 Direct Redirect Success Verification (Backup Callback)
Validates the status of a Stripe session on redirect and marks the donation as `RECEIVED`.
- **URL**: `/api/v1/payments/success`
- **Method**: `GET`
- **Query Parameters**:
  - `session_id` (String, Required) - The Stripe checkout session ID.
  - `donation_id` (Long, Required) - The ID of the corresponding donation.
- **Response**: `200 OK` `"Thank you! Your monetary relief donation has been verified and successfully processed."`

#### 💳 Stripe Webhook Endpoint (Production Standard)
Asynchronously processes Stripe events (specifically `checkout.session.completed`) to update donation status to `RECEIVED`.
- **URL**: `/api/v1/payments/webhook`
- **Method**: `POST`
- **Request Header**: `Stripe-Signature` (Required)
- **Response**: `200 OK` `"Webhook processed successfully."`

---

## 🛠️ How to Build and Run the App

1. Make sure you are in the `ResQNest` directory:
   ```bash
   cd backend/ResQNest
   ```
2. Build the project using Maven:
   ```bash
   ./mvnw clean install
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
