const API_BASE = "http://localhost:8080";

// Helper to retrieve auth headers
function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("resqnest_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

// Check response helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `API Error (${response.status}): `;
    try {
      const json = JSON.parse(text);
      errorMessage += json.message || text;
    } catch {
      errorMessage += text;
    }
    throw new Error(errorMessage);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  auth: {
    async login(payload: any) {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await handleResponse(res);
      if (typeof window !== "undefined" && data && data.token) {
        localStorage.setItem("resqnest_token", data.token);
        localStorage.setItem("resqnest_role", data.role);
        localStorage.setItem("resqnest_username", data.username);
        localStorage.setItem("resqnest_email", data.email);
      }
      return data;
    },

    async register(payload: any) {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("resqnest_token");
        localStorage.removeItem("resqnest_role");
        localStorage.removeItem("resqnest_username");
        localStorage.removeItem("resqnest_email");
      }
    },

    getCurrentUser() {
      if (typeof window !== "undefined") {
        return {
          token: localStorage.getItem("resqnest_token"),
          role: localStorage.getItem("resqnest_role"),
          username: localStorage.getItem("resqnest_username"),
          email: localStorage.getItem("resqnest_email"),
        };
      }
      return null;
    },
  },

  stats: {
    async fetchPublicStats() {
      const res = await fetch(`${API_BASE}/api/stats`);
      return handleResponse(res);
    },
  },

  sos: {
    async submitSOS(formData: FormData) {
      const res = await fetch(`${API_BASE}/api/v1/sos`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
      });
      return handleResponse(res);
    },

    async fetchAllSOS(status?: string) {
      const url = status ? `${API_BASE}/api/v1/sos?status=${status}` : `${API_BASE}/api/v1/sos`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async updateSOSStatus(id: number, status: string) {
      const res = await fetch(`${API_BASE}/api/v1/sos/${id}?status=${status}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async assignVolunteer(id: number, volunteerId: number) {
      const res = await fetch(`${API_BASE}/api/v1/sos/${id}/assign?volunteerId=${volunteerId}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async forceRecalculatePriorities() {
      const res = await fetch(`${API_BASE}/api/v1/priority`, {
        method: "POST",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  volunteers: {
    async fetchAll(status?: string, skill?: string) {
      let url = `${API_BASE}/api/v1/volunteers`;
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (skill) params.append("skill", skill);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async register(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/volunteers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateStatus(id: number, status: string) {
      const res = await fetch(`${API_BASE}/api/v1/volunteers/${id}/status?status=${status}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  shelters: {
    async fetchAll(status?: string, name?: string) {
      let url = `${API_BASE}/api/v1/shelters`;
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (name) params.append("name", name);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async fetchNearby(latitude: number, longitude: number) {
      const res = await fetch(
        `${API_BASE}/api/v1/shelters/nearby?latitude=${latitude}&longitude=${longitude}`,
        { headers: getHeaders() }
      );
      return handleResponse(res);
    },

    async create(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/shelters`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateOccupied(id: number, occupied: number) {
      const res = await fetch(`${API_BASE}/api/v1/shelters/${id}/occupied?occupied=${occupied}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async fetchResidents(id: number) {
      const res = await fetch(`${API_BASE}/api/v1/shelters/${id}/residents`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async addResident(shelterId: number, userId: number) {
      const res = await fetch(`${API_BASE}/api/v1/shelters/${shelterId}/residents/${userId}`, {
        method: "POST",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  inventories: {
    async fetchAll(category?: string, status?: string, shelterId?: number) {
      let url = `${API_BASE}/api/v1/inventories`;
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (shelterId) params.append("shelterId", shelterId.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async create(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/inventories`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateQuantity(id: number, quantity: number) {
      const res = await fetch(`${API_BASE}/api/v1/inventories/${id}/quantity?quantity=${quantity}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  donations: {
    async fetchAll(donationType?: string, status?: string, donorEmail?: string) {
      let url = `${API_BASE}/api/v1/donations`;
      const params = new URLSearchParams();
      if (donationType) params.append("donationType", donationType);
      if (status) params.append("status", status);
      if (donorEmail) params.append("donorEmail", donorEmail);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async create(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/donations`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateStatus(id: number, status: string) {
      const res = await fetch(`${API_BASE}/api/v1/donations/${id}/status?status=${status}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async createPaymentSession(donationId: number) {
      const res = await fetch(`${API_BASE}/api/v1/payments/create-session/${donationId}`, {
        method: "POST",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  distributions: {
    async fetchAll(status?: string, inventoryId?: number, volunteerId?: number) {
      let url = `${API_BASE}/api/v1/distributions`;
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (inventoryId) params.append("inventoryId", inventoryId.toString());
      if (volunteerId) params.append("volunteerId", volunteerId.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async create(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/distributions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateStatus(id: number, status: string) {
      const res = await fetch(`${API_BASE}/api/v1/distributions/${id}/status?status=${status}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  missingPersons: {
    async fetchAll(status?: string, name?: string, location?: string) {
      let url = `${API_BASE}/api/v1/missing-persons`;
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (name) params.append("name", name);
      if (location) params.append("location", location);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },

    async create(payload: any) {
      const res = await fetch(`${API_BASE}/api/v1/missing-persons`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateStatus(id: number, status: string) {
      const res = await fetch(`${API_BASE}/api/v1/missing-persons/${id}/status?status=${status}`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  reports: {
    async fetchSummary() {
      const res = await fetch(`${API_BASE}/api/v1/reports/summary`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  dashboard: {
    async fetchStats() {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  users: {
    async getProfile() {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async updateProfile(payload: any) {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async changePassword(payload: any) {
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async checkIn(safetyStatus: string) {
      const res = await fetch(`${API_BASE}/api/users/check-in`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ safetyStatus }),
      });
      return handleResponse(res);
    },
  },

  volunteerSOS: {
    async fetchMyMissions() {
      const res = await fetch(`${API_BASE}/api/volunteer/sos/my-missions`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async acceptMission(id: number) {
      const res = await fetch(`${API_BASE}/api/volunteer/sos/${id}/accept`, {
        method: "PUT",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },

    async completeMission(id: number) {
      const res = await fetch(`${API_BASE}/api/volunteer/sos/${id}/complete`, {
        method: "PUT",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
};
