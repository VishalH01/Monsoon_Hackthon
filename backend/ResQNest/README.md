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
- **URL**: `/api/auth/register`
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
- **URL**: `/api/auth/login`
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
- **URL**: `/api/users/profile`
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
- **URL**: `/api/users/profile`
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
- **URL**: `/api/users/change-password`
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
- **URL**: `/api/sos`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `latitude` (Double, Required) - GPS Latitude.
  - `longitude` (Double, Required) - GPS Longitude.
  - `description` (String, Optional) - Short detail about the situation.
  - `image` (File, Optional) - Image/photo file from camera or gallery.
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "description": "Flooding near the main road",
    "imageUrl": "/uploads/a3b1-4c6e-8f92-image.jpg",
    "status": "PENDING",
    "victimUsername": "john_doe", // "Guest" if submitted unauthenticated
    "volunteerUsername": null,
    "createdAt": "2026-06-26T12:00:00",
    "updatedAt": "2026-06-26T12:00:00"
  }
  ```

#### 📋 View All SOS Alerts (Admin)
- **URL**: `/api/admin/sos`
- **Method**: `GET`
- **Query Parameter**: `status` (Optional, values: `PENDING`, `ASSIGNED`, `ACTIVE`, `RESOLVED`)
- **Response**: `200 OK` (list of SOSResponse objects)

#### 🤝 Assign Volunteer to Mission (Admin)
- **URL**: `/api/admin/sos/{id}/assign`
- **Method**: `PUT`
- **Query Parameter**: `volunteerId` (Required, ID of the volunteer user)
- **Response**: `200 OK` (returns updated SOSResponse with status `ASSIGNED`)

#### 🤝 Update SOS Status Directly (Admin)
- **URL**: `/api/admin/sos/{id}/status`
- **Method**: `PUT`
- **Query Parameter**: `status` (Required, values: `PENDING`, `ASSIGNED`, `ACTIVE`, `RESOLVED`)
- **Response**: `200 OK` (returns updated SOSResponse)

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

### 4. Test Endpoints (Verifying Access Control)
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
