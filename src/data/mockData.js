// Mock data from CTFd database export
// This creates a static archive of the CTF final state

import challengesData from "./challenges.json";
import configData from "./config.json";
import filesData from "./files.json";
import flagsData from "./flags.json";
import solvesData from "./solves.json";
import teamsData from "./teams.json";
import usersData from "./users.json";

// Process and enrich the data
class MockDataService {
  constructor() {
    this.challenges = challengesData.results;
    this.users = usersData.results;
    this.teams = teamsData.results;
    this.solves = solvesData.results;
    this.flags = flagsData.results;
    this.files = filesData.results;
    this.config = this.processConfig(configData.results);

    // Build lookup maps for performance
    this.challengeMap = new Map(this.challenges.map((c) => [c.id, c]));
    this.userMap = new Map(this.users.map((u) => [u.id, u]));
    this.teamMap = new Map(this.teams.map((t) => [t.id, t]));

    // Calculate scores and solves
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
    // Calculate team scores and solve counts
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
      challenge.solved_by_me = false; // Archive mode - no current user
    });

    // Attach files to challenges
    this.challenges.forEach((challenge) => {
      challenge.files = this.files
        .filter((f) => f.challenge_id === challenge.id)
        .map((f) => `/files/${f.location}`);
    });
  }

  // API-compatible methods
  getChallenges() {
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
        state: c.state,
      })),
    };
  }

  getChallenge(id) {
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
      },
    };
  }

  getScoreboard() {
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

  getUsers() {
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

  getUser(id) {
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

  getUserSolves(id) {
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
          date: null, // No timestamp in export
        };
      })
      .filter((s) => s.challenge !== null);

    return {
      success: true,
      data: userSolves,
    };
  }

  getTeams() {
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

  getTeam(id) {
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

  // Archive mode - no authentication
  getCurrentUser() {
    return {
      success: false,
      error: "Archive mode - authentication disabled",
    };
  }

  checkAuth() {
    return null;
  }

  // Disabled operations for archive mode
  submitFlag() {
    return {
      success: false,
      data: {
        status: "incorrect",
        message: "This is an archived CTF. Flag submission is disabled.",
      },
    };
  }

  login() {
    throw new Error("This is an archived CTF. Login is disabled.");
  }

  register() {
    throw new Error("This is an archived CTF. Registration is disabled.");
  }

  logout() {
    return { success: true };
  }

  // Config
  getConfig() {
    return {
      success: true,
      data: {
        ctf_name: this.config.ctf_name || "Cybermaze",
        user_mode: this.config.user_mode || "teams",
      },
    };
  }
}

export default new MockDataService();
