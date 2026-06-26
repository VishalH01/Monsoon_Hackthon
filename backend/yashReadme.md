# Backend Workspace - ResQNest

This is the backend server / REST API of the ResQNest project, built using **Java 17**, **Spring Boot**, and **Spring Data JPA** with a MySQL database hosted on Aiven Cloud.

## Running the Application

### Prerequisites
- Java Development Kit (JDK) 17 or higher
- Maven (optional, wrapper is included)

### Setup & Run
From the `backend/ResQNest` directory:

1. **Configure Environment**: Database connection details are already configured in `src/main/resources/application.properties` to connect to the Aiven Cloud database instance.
2. **Build the Application**:
   ```bash
   ./mvnw clean compile
   ```
3. **Run the Server**:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend server will start and listen on port `8080`.

---

## API Documentation

All request and response payloads use JSON. Endpoint mappings are detailed below:

### 1. Volunteers API (`/api/v1/volunteers`)

Manages volunteer availability, contact info, skills, and status.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/volunteers` | Register a new volunteer | None |
| `GET` | `/api/v1/volunteers` | Retrieve all volunteers | `status` (String), `skill` (String) |
| `GET` | `/api/v1/volunteers/{id}` | Get volunteer by ID | None |
| `PUT` | `/api/v1/volunteers/{id}` | Update volunteer details | None |
| `PATCH` | `/api/v1/volunteers/{id}/status` | Update volunteer status | `status` (AVAILABLE, BUSY, UNAVAILABLE) |
| `DELETE` | `/api/v1/volunteers/{id}` | Delete volunteer | None |

#### Sample Request Body (Create Volunteer)
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+15555551234",
  "skills": "Medical, CPR",
  "status": "AVAILABLE",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "availabilityDetails": "Always Available"
}
```

---

### 2. Shelters API (`/api/v1/shelters`)

Manages capacity, current occupancy, and facilities at safety shelters.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/shelters` | Create a new safety shelter | None |
| `GET` | `/api/v1/shelters` | Retrieve all shelters | `status` (ACTIVE, FULL, INACTIVE), `name` (String) |
| `GET` | `/api/v1/shelters/{id}` | Get shelter by ID | None |
| `PUT` | `/api/v1/shelters/{id}` | Update shelter details | None |
| `PATCH` | `/api/v1/shelters/{id}/occupied` | Update shelter occupancy | `occupied` (Integer) |
| `DELETE` | `/api/v1/shelters/{id}` | Delete shelter | None |

*Note: Updating occupancy will automatically flag the shelter status as `FULL` if occupancy reaches total capacity.*

#### Sample Request Body (Create Shelter)
```json
{
  "name": "Central High Gym",
  "address": "123 School Rd",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "capacity": 100,
  "occupied": 0,
  "status": "ACTIVE",
  "contactPhone": "+15550001111",
  "amenities": "Cots, Water, Food"
}
```

---

### 3. Inventory API (`/api/v1/inventories`)

Tracks relief items and matches them to shelters.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/inventories` | Add an inventory item | None |
| `GET` | `/api/v1/inventories` | Retrieve all inventory items | `category` (String), `status` (String), `shelterId` (Long) |
| `GET` | `/api/v1/inventories/{id}` | Get item details by ID | None |
| `PUT` | `/api/v1/inventories/{id}` | Update inventory item details | None |
| `PATCH` | `/api/v1/inventories/{id}/quantity` | Update inventory item quantity | `quantity` (Integer) |
| `DELETE` | `/api/v1/inventories/{id}` | Delete inventory item | None |

*Note: Status updates automatically based on quantity:*
- `quantity == 0` &rarr; `OUT_OF_STOCK`
- `0 < quantity <= 10` &rarr; `LOW_STOCK`
- `quantity > 10` &rarr; `IN_STOCK`

#### Sample Request Body (Create Inventory Item)
```json
{
  "itemName": "Cots",
  "category": "Bedding",
  "quantity": 50,
  "unit": "Pieces",
  "shelterId": 1
}
```

---

### 4. Donations API (`/api/v1/donations`)

Manages and records both monetary and material item donations from donors.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/donations` | Record a new donation | None |
| `GET` | `/api/v1/donations` | Retrieve all donations | `donationType` (MONEY, ITEMS), `status` (PENDING, RECEIVED, DISTRIBUTED), `donorEmail` (String) |
| `GET` | `/api/v1/donations/{id}` | Get donation by ID | None |
| `PUT` | `/api/v1/donations/{id}` | Update donation details | None |
| `PATCH` | `/api/v1/donations/{id}/status` | Update donation status | `status` (PENDING, RECEIVED, DISTRIBUTED) |
| `DELETE` | `/api/v1/donations/{id}` | Delete donation record | None |

#### Sample Request Body (Monetary Donation)
```json
{
  "donorName": "Bob Miller",
  "donorEmail": "bob@example.com",
  "donationType": "MONEY",
  "amount": 250.0,
  "notes": "Relief support"
}
```

#### Sample Request Body (Item Donation)
```json
{
  "donorName": "Jane Doe",
  "donorEmail": "jane@example.com",
  "donationType": "ITEMS",
  "itemName": "Blankets",
  "quantity": 100,
  "unit": "Pieces",
  "notes": "Warm blankets for winter shelter"
}
```

---

### 5. Distributions API (`/api/v1/distributions`)

Tracks the allocation and dispatch of relief inventory items to camps or affected populations.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/distributions` | Record a new distribution | None |
| `GET` | `/api/v1/distributions` | Retrieve all distributions | `status` (PENDING, COMPLETED, CANCELLED), `inventoryId` (Long), `volunteerId` (Long) |
| `GET` | `/api/v1/distributions/{id}` | Get distribution by ID | None |
| `PUT` | `/api/v1/distributions/{id}` | Update distribution details | None |
| `PATCH` | `/api/v1/distributions/{id}/status` | Update distribution status | `status` (PENDING, COMPLETED, CANCELLED) |
| `DELETE` | `/api/v1/distributions/{id}` | Delete distribution record | None |

*Note: Completing a distribution (`COMPLETED`) will automatically deduct the quantity from the corresponding item in the inventory. Cancelling it (`CANCELLED`) will return the quantity back to stock if it was previously completed.*

#### Sample Request Body (Create Distribution)
```json
{
  "inventoryId": 1,
  "volunteerId": 1,
  "quantity": 10,
  "distributedTo": "Sector 4 Relief Camp",
  "status": "COMPLETED",
  "notes": "Emergency drinking water dispatch"
}
```

---

### 6. Missing Persons API (`/api/v1/missing-persons`)

Tracks and reports missing individuals in disaster areas to aid in search, recovery, and family reunions.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/missing-persons` | Report a new missing person | None |
| `GET` | `/api/v1/missing-persons` | Retrieve all missing persons | `status` (MISSING, FOUND, REUNITED), `name` (String), `location` (String) |
| `GET` | `/api/v1/missing-persons/{id}` | Get details of a missing person | None |
| `PUT` | `/api/v1/missing-persons/{id}` | Update missing person details | None |
| `PATCH` | `/api/v1/missing-persons/{id}/status` | Update missing person status | `status` (MISSING, FOUND, REUNITED) |
| `DELETE` | `/api/v1/missing-persons/{id}` | Delete missing person record | None |

#### Sample Request Body (Report Missing Person)
```json
{
  "fullName": "David Jones",
  "age": 45,
  "gender": "Male",
  "lastSeenLocation": "Bridge Street sector 3",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "description": "Blue jacket, grey trousers, scar on right arm",
  "contactName": "Sarah Jones",
  "contactPhone": "+15558889999",
  "status": "MISSING"
}
```

---

### 7. Reports API (`/api/v1/reports`)

Generates aggregated operation reports across the entire system.

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `GET` | `/api/v1/reports/summary` | Retrieve aggregated dashboard-ready statistics across all entities | None |

#### Sample Response Body (`GET /api/v1/reports/summary`)
```json
{
  "totalVolunteers": 12,
  "availableVolunteers": 8,
  "busyVolunteers": 3,
  "unavailableVolunteers": 1,
  "totalShelters": 5,
  "shelterTotalCapacity": 500,
  "shelterTotalOccupied": 320,
  "shelterAvailableBeds": 180,
  "activeShelters": 4,
  "fullShelters": 1,
  "inactiveShelters": 0,
  "totalInventoryItems": 15,
  "totalInventoryQuantity": 1250,
  "inStockInventoryItems": 10,
  "lowStockInventoryItems": 3,
  "outOfStockInventoryItems": 2,
  "totalDonations": 8,
  "totalDonatedAmount": 12500.5,
  "totalDonatedItemsQuantity": 450,
  "totalDistributions": 6,
  "completedDistributions": 4,
  "pendingDistributions": 2,
  "cancelledDistributions": 0,
  "totalMissingReports": 5,
  "missingPersons": 3,
  "foundPersons": 1,
  "reunitedPersons": 1
}
```

---

## Global Exception Handler

Common error responses are mapped to standard HTTP statuses with a clean JSON body:
- **`404 Not Found`**: Returned when checking for non-existent entities (e.g. invalid IDs).
- **`400 Bad Request`**: Returned on parameter format errors or if occupancy exceeds shelter capacity.
- **Validation Errors**: Request fields violating constraints (like invalid email formatting or negative numbers) return a `400` response containing a nested map of validation rules that failed.
