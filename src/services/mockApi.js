// Mock API service for archived CTF
// Uses static data from database export

import challengesData from "../data/challenges.json";
import configData from "../data/config.json";
import filesData from "../data/files.json";
import flagsData from "../data/flags.json";
import solvesData from "../data/solves.json";
import teamsData from "../data/teams.json";
import usersData from "../data/users.json";

class MockAPI {
  constructor() {
    this.challenges = challengesData.results;
    this.users = usersData.results;
    this.teams = teamsData.results;
    this.solves = solvesData.results;
    this.flags = flagsData.results;
    this.files = filesData.results;
    this.config = this.processConfig(configData.results);

    // Build lookup maps
    this.challengeMap = new Map(this.challenges.map((c) => [c.id, c]));
    this.userMap = new Map(this.users.map((u) => [u.id, u]));
    this.teamMap = new Map(this.teams.map((t) => [t.id, t]));

    // Enrich data with scores and solves
    this.enrichData();
  }

  processConfig(configArray) {
    const config = {};
    configArray.forEach((item) => {
      config[item.key] = item.value;
    });
    return config;
  }

  enrichData() {
    // Calculate team scores
    this.teams.forEach((team) => {
      const teamSolves = this.solves.filter((s) => s.team_id === team.id);
      const uniqueChallenges = new Set(teamSolves.map((s) => s.challenge_id));

      team.score = 0;
      uniqueChallenges.forEach((challengeId) => {
        const challenge = this.challengeMap.get(challengeId);
        if (challenge) {
          team.score += challenge.value || 0;
        }
      });

      team.solves_count = uniqueChallenges.size;
    });

    // Calculate user scores
    this.users.forEach((user) => {
      const userSolves = this.solves.filter((s) => s.user_id === user.id);
      const uniqueChallenges = new Set(userSolves.map((s) => s.challenge_id));

      user.score = 0;
      uniqueChallenges.forEach((challengeId) => {
        const challenge = this.challengeMap.get(challengeId);
        if (challenge) {
          user.score += challenge.value || 0;
        }
      });

      user.solves_count = uniqueChallenges.size;
    });

    // Add solve counts to challenges
    this.challenges.forEach((challenge) => {
      const challengeSolves = this.solves.filter(
        (s) => s.challenge_id === challenge.id
      );
      const uniqueTeams = new Set(challengeSolves.map((s) => s.team_id));
      challenge.solves = uniqueTeams.size;
      challenge.solved_by_me = false;
    });

    // Attach files to challenges
    this.challenges.forEach((challenge) => {
      challenge.files = this.files
        .filter((f) => f.challenge_id === challenge.id)
        .map((f) => `/files/${f.location}`);
    });
  }

  // Simulate async API calls
  async request(endpoint, options = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { success: true };
  }

  async getChallenges() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      data: this.challenges.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        value: c.value,
        solves: c.solves,
        solved_by_me: false,
        category: c.category,
        tags: [],
        state: "visible", // Force all challenges to be visible in archive mode
        requirements: null, // Remove all requirements in archive mode
      })),
    };
  }

  async getChallenge(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const challenge = this.challengeMap.get(parseInt(id));
    if (!challenge) {
      return { success: false, error: "Challenge not found" };
    }

    return {
      success: true,
      data: {
        ...challenge,
        solved_by_me: false,
        solves: challenge.solves,
        files: challenge.files || [],
        state: "visible", // Force visible in archive mode
        requirements: null, // Remove requirements in archive mode
      },
    };
  }

  async submitFlag(challengeId, submission) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if flag is correct (for display purposes)
    const flag = this.flags.find(
      (f) => f.challenge_id === parseInt(challengeId)
    );
    const isCorrect =
      flag &&
      (flag.content === submission ||
        (flag.data === "case_insensitive" &&
          flag.content.toLowerCase() === submission.toLowerCase()));

    return {
      success: true,
      data: {
        status: "archived",
        message: isCorrect
          ? `✓ Correct! This challenge was solved by ${
              this.solves.filter(
                (s) => s.challenge_id === parseInt(challengeId)
              ).length
            } teams during the CTF.`
          : "✗ This is an archived CTF. Flag submission is disabled, but this flag appears to be incorrect.",
      },
    };
  }

  async getScoreboard() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const sortedTeams = [...this.teams]
      .filter((t) => !t.hidden)
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({
        pos: index + 1,
        account_id: team.id,
        name: team.name,
        score: team.score,
      }));

    return {
      success: true,
      data: sortedTeams,
    };
  }

  async getUsers() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      data: this.users
        .filter((u) => !u.hidden)
        .map((u) => ({
          id: u.id,
          name: u.name,
          score: u.score,
          team_id: u.team_id,
        })),
    };
  }

  async getUser(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const user = this.userMap.get(parseInt(id));
    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        score: user.score,
        team_id: user.team_id,
        website: user.website,
        affiliation: user.affiliation,
        country: user.country,
      },
    };
  }

  async getUserSolves(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const userSolves = this.solves
      .filter((s) => s.user_id === parseInt(id))
      .map((s) => {
        const challenge = this.challengeMap.get(s.challenge_id);
        return {
          challenge_id: s.challenge_id,
          challenge: challenge
            ? {
                id: challenge.id,
                name: challenge.name,
                value: challenge.value,
                category: challenge.category,
              }
            : null,
          date: null,
        };
      })
      .filter((s) => s.challenge !== null);

    return {
      success: true,
      data: userSolves,
    };
  }

  async getUserAwards(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      data: [],
    };
  }

  async getTeams() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      data: this.teams
        .filter((t) => !t.hidden)
        .map((t) => ({
          id: t.id,
          name: t.name,
          score: t.score,
        })),
    };
  }

  async getTeam(id) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const team = this.teamMap.get(parseInt(id));
    if (!team) {
      return { success: false, error: "Team not found" };
    }

    const members = this.users
      .filter((u) => u.team_id === team.id)
      .map((u) => ({
        id: u.id,
        name: u.name,
        score: u.score,
      }));

    return {
      success: true,
      data: {
        id: team.id,
        name: team.name,
        score: team.score,
        captain_id: team.captain_id,
        members: members,
        affiliation: team.affiliation,
        country: team.country,
        website: team.website,
      },
    };
  }

  async getCurrentUser() {
    return {
      success: false,
      error: "Archive mode",
    };
  }

  async checkAuth() {
    return null;
  }

  async login() {
    throw new Error("This is an archived CTF. Login is disabled.");
  }

  async register() {
    throw new Error("This is an archived CTF. Registration is disabled.");
  }

  async logout() {
    return { success: true };
  }

  async getConfig() {
    return {
      success: true,
      data: {
        ctf_name: this.config.ctf_name || "Cybermaze",
        user_mode: this.config.user_mode || "teams",
      },
    };
  }

  // Stubs for other methods
  async createTeam() {
    throw new Error("This is an archived CTF. Team creation is disabled.");
  }

  async joinTeam() {
    throw new Error("This is an archived CTF. Joining teams is disabled.");
  }

  async leaveTeam() {
    throw new Error("This is an archived CTF. Team operations are disabled.");
  }

  async updateProfile() {
    throw new Error("This is an archived CTF. Profile updates are disabled.");
  }

  async getNotifications() {
    return { success: true, data: [] };
  }
}

export default new MockAPI();
