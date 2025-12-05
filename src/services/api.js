import { config } from "../config";
import mockApi from "./mockApi";

class CTFdAPI {
  constructor() {
    this.baseURL = config.apiBaseUrl;
    this.csrfToken = null;
    this.archiveMode = config.archiveMode || false;
  }

  // Delegate to mock API if in archive mode
  _delegateIfArchive(method, ...args) {
    if (this.archiveMode && mockApi[method]) {
      return mockApi[method](...args);
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Get nonce from window.init for API requests
    const nonce = window.init?.csrfNonce || this.csrfToken;
    if (nonce) {
      headers["CSRF-Token"] = nonce;
      headers["X-CSRF-Token"] = nonce; // Try both header formats
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Not JSON - likely an HTML error page
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(`API returned non-JSON response (${response.status})`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Challenges
  async getChallenges() {
    const mock = this._delegateIfArchive("getChallenges");
    if (mock) return mock;
    return this.request("/challenges");
  }

  async getChallenge(id) {
    const mock = this._delegateIfArchive("getChallenge", id);
    if (mock) return mock;
    return this.request(`/challenges/${id}`);
  }

  async getChallengeSolves(id) {
    const mock = this._delegateIfArchive("getChallengeSolves", id);
    if (mock) return mock;
    return this.request(`/challenges/${id}/solves`);
  }

  async submitFlag(challengeId, submission) {
    const mock = this._delegateIfArchive("submitFlag", challengeId, submission);
    if (mock) return mock;

    const nonce = window.init?.csrfNonce;
    return this.request(`/challenges/attempt`, {
      method: "POST",
      body: JSON.stringify({
        challenge_id: challengeId,
        submission: submission,
        nonce: nonce,
      }),
    });
  }

  // Scoreboard
  async getScoreboard() {
    const mock = this._delegateIfArchive("getScoreboard");
    if (mock) return mock;
    return this.request("/scoreboard");
  }

  // Users
  async getUsers() {
    const mock = this._delegateIfArchive("getUsers");
    if (mock) return mock;
    return this.request("/users");
  }

  // Teams
  async getTeams() {
    const mock = this._delegateIfArchive("getTeams");
    if (mock) return mock;
    return this.request("/teams");
  }

  async getTeam(id) {
    const mock = this._delegateIfArchive("getTeam", id);
    if (mock) return mock;
    return this.request(`/teams/${id}`);
  }

  async createTeam(data) {
    // CTFd uses form submission for creating teams
    const nonce = await this.getNonce();

    try {
      const formData = new URLSearchParams();
      formData.append("name", data.name);
      formData.append("password", data.password);
      formData.append("nonce", nonce);

      const response = await fetch("/teams/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      // Check if successful
      if (response.ok || response.redirected) {
        return { success: true };
      }

      // Try to get error message
      const text = await response.text();
      const errorMatch = text.match(
        /class="alert[^"]*alert-danger[^"]*"[^>]*>([^<]+)/i
      );

      if (errorMatch && errorMatch[1]) {
        throw new Error(errorMatch[1].trim());
      }

      throw new Error("Failed to create team. Please try again.");
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to create team. Please try again.");
    }
  }

  async joinTeam(teamName, password) {
    // CTFd join team endpoint - uses team name, not ID
    const nonce = await this.getNonce();

    try {
      const formData = new URLSearchParams();
      formData.append("name", teamName);
      formData.append("password", password);
      formData.append("nonce", nonce);

      const response = await fetch("/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      // Check if successful
      if (response.ok || response.redirected) {
        return { success: true };
      }

      // Try to get error message
      const text = await response.text();
      const errorMatch = text.match(
        /class="alert[^"]*alert-danger[^"]*"[^>]*>([^<]+)/i
      );

      if (errorMatch && errorMatch[1]) {
        throw new Error(errorMatch[1].trim());
      }

      throw new Error(
        "Failed to join team. Please check the team name and password."
      );
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error(
        "Failed to join team. Please check the team name and password."
      );
    }
  }

  async setTeamCaptain(teamId, memberId) {
    const nonce = await this.getNonce();
    return this.request(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify({
        captain_id: memberId,
        nonce: nonce,
      }),
    });
  }

  async leaveTeam(teamId) {
    // CTFd uses a web form endpoint, not API
    // We'll submit the form via fetch and handle the response
    const nonce = await this.getNonce();

    try {
      const formData = new URLSearchParams();
      formData.append("nonce", nonce);

      const response = await fetch("/teams/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      // Check if successful (redirect or 200)
      if (response.ok || response.redirected) {
        return { success: true };
      }

      // If not successful, try to get error message
      const text = await response.text();

      // Try to extract error from HTML
      const errorMatch =
        text.match(/class="alert[^"]*alert-danger[^"]*"[^>]*>([^<]+)/i) ||
        text.match(/error[^>]*>([^<]+)/i);

      if (errorMatch && errorMatch[1]) {
        const errorMsg = errorMatch[1].trim();
        throw new Error(errorMsg);
      }

      throw new Error(
        "Failed to leave team. The team may have already participated in the event."
      );
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error(
        "Failed to leave team. The team may have already participated in the event."
      );
    }
  }

  // User
  async getCurrentUser() {
    const mock = this._delegateIfArchive("getCurrentUser");
    if (mock) return mock;
    return this.request("/users/me");
  }

  async getUser(id) {
    const mock = this._delegateIfArchive("getUser", id);
    if (mock) return mock;
    return this.request(`/users/${id}`);
  }

  async getUserSolves(id) {
    const mock = this._delegateIfArchive("getUserSolves", id);
    if (mock) return mock;
    return this.request(`/users/${id}/solves`);
  }

  async getUserAwards(id) {
    const mock = this._delegateIfArchive("getUserAwards", id);
    if (mock) return mock;
    return this.request(`/users/${id}/awards`);
  }

  // Tokens
  async getTokens() {
    return this.request("/tokens");
  }

  async generateToken(data) {
    const nonce = await this.getNonce();
    return this.request("/tokens", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        nonce: nonce,
      }),
    });
  }

  async deleteToken(id) {
    const nonce = await this.getNonce();
    return this.request(`/tokens/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ nonce: nonce }),
    });
  }

  async getNonce() {
    // Try to get fresh nonce from session
    try {
      const response = await fetch("/", {
        method: "GET",
        credentials: "include",
      });
      const html = await response.text();

      // Extract nonce from the HTML response
      const nonceMatch = html.match(/csrfNonce:\s*"([^"]+)"/);
      if (nonceMatch && nonceMatch[1]) {
        return nonceMatch[1];
      }
    } catch (error) {
      console.error("Failed to fetch fresh nonce:", error);
    }

    // Fallback to window.init nonce
    return window.init?.csrfNonce || null;
  }

  async login(name, password) {
    const mock = this._delegateIfArchive("login", name, password);
    if (mock) return mock;

    try {
      // Get fresh nonce
      const nonce = await this.getNonce();

      // CTFd expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("password", password);
      if (nonce) {
        formData.append("nonce", nonce);
      }

      await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      // Wait for session to be established
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if login was successful by trying to get current user
      try {
        const userResponse = await this.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          return { success: true, data: userResponse.data };
        }
      } catch (error) {
        throw new Error("Your username or password is incorrect");
      }

      throw new Error("Your username or password is incorrect");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(name, email, password, registrationCode) {
    const mock = this._delegateIfArchive(
      "register",
      name,
      email,
      password,
      registrationCode
    );
    if (mock) return mock;

    try {
      // Get fresh nonce
      const nonce = await this.getNonce();

      // CTFd expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (registrationCode) {
        formData.append("registration_code", registrationCode);
      }
      if (nonce) {
        formData.append("nonce", nonce);
      }

      await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      // Wait for session to be established
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if registration was successful by trying to get current user
      try {
        const userResponse = await this.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          return { success: true, data: userResponse.data };
        }
      } catch (error) {
        throw new Error("Registration failed. Please check your information.");
      }

      throw new Error("Registration failed. Please check your information.");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async logout() {
    // CTFd logout is a GET request, not POST
    try {
      await fetch("/logout", {
        method: "GET",
        credentials: "include",
      });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Check if user is authenticated
  async checkAuth() {
    const mock = this._delegateIfArchive("checkAuth");
    if (mock !== null && mock !== undefined) return mock;

    try {
      const response = await this.getCurrentUser();
      if (response.success && response.data) {
        // Check if user is admin by trying to access admin endpoint
        const isAdmin = await this.checkIsAdmin();
        return { ...response.data, isAdmin };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Check if current user has admin access
  async checkIsAdmin() {
    try {
      // Try to access an admin-only endpoint
      const response = await fetch("/admin/statistics", {
        method: "GET",
        credentials: "include",
        redirect: "manual", // Don't follow redirects
      });
      // If we get 200, user is admin
      // If we get 302 (redirect to login), user is not admin
      // If we get 403, user is not admin
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // User Profile Management
  async updateProfile(data) {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getUserSolves() {
    return this.request("/users/me/solves");
  }

  async getUserAwards() {
    return this.request("/users/me/awards");
  }

  async getUserFails() {
    return this.request("/users/me/fails");
  }

  // Config
  async getConfig() {
    return this.request("/configs");
  }

  setCSRFToken(token) {
    this.csrfToken = token;
  }

  // Whale Plugin - Container Management
  async getWhaleContainer(challengeId) {
    return this.request(
      `/plugins/ctfd-whale/container?challenge_id=${challengeId}`
    );
  }

  async createWhaleContainer(challengeId) {
    return this.request(
      `/plugins/ctfd-whale/container?challenge_id=${challengeId}`,
      {
        method: "POST",
      }
    );
  }

  async deleteWhaleContainer() {
    return this.request("/plugins/ctfd-whale/container", {
      method: "DELETE",
    });
  }

  async renewWhaleContainer(challengeId) {
    return this.request(
      `/plugins/ctfd-whale/container?challenge_id=${challengeId}`,
      {
        method: "PATCH",
      }
    );
  }

  // Notifications
  async getNotifications(sinceId = 0) {
    try {
      const url = `${this.baseURL}/notifications?since_id=${sinceId}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return { success: true, data: [] };
      }

      const data = await response.json();

      // CTFd API returns { success: true, data: [...] }
      if (data.success && Array.isArray(data.data)) {
        return data;
      }

      // If data is directly an array
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error("[API] Failed to fetch notifications:", error);
      return { success: true, data: [] }; // Return empty array on error
    }
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
  }
}

export default new CTFdAPI();
