const { PrismaClient } = require('@prisma/client');
const Team = require('./team.model');
const prisma = new PrismaClient();

class Auth {
  static async register(data) {
    // Check if team member already exists
    const existingTeam = await Team.findByEmail(data.email);
    if (existingTeam) {
      throw new Error('Email already registered');
    }

    // Create new team member
    const team = await Team.create(data);

    // Remove password from response
    const { password, ...teamWithoutPassword } = team;

    return teamWithoutPassword;
  }

  static async login(email, password) {
    // Find team member by email
    const team = await Team.findByEmail(email);
    if (!team) {
      throw new Error('Invalid email or password');
    }

    // Verify password (in production, use proper password comparison)
    if (team.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Remove password from response
    const { password: _, ...teamWithoutPassword } = team;

    return teamWithoutPassword;
  }

  static async forgotPassword(email) {
    // Check if team member exists
    const team = await Team.findByEmail(email);
    if (!team) {
      throw new Error('No team member found with this email');
    }

    return team;
  }

  static async resetPassword(id, password) {
    // Update team member's password
    await Team.updatePassword(id, password);
    return true;
  }

  static async verifyToken(token) {
    // In a real application, you would verify the JWT token here
    // For now, we'll just return a mock implementation
    try {
      // Mock token verification
      const decoded = {
        id: 1,
        roleId: 1,
      };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = Auth; 