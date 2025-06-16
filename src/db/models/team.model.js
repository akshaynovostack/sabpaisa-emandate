const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Team {
  static async create(data) {
    return prisma.team.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // Note: In production, this should be hashed
        role_id: data.role_id,
        created_date_time: new Date(),
        modified_date_time: new Date(),
      },
      include: {
        role: true,
      },
    });
  }

  static async findById(id) {
    return prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        role: true,
      },
    });
  }

  static async findByEmail(email) {
    return prisma.team.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  static async findAll({ page = 1, limit = 10, search }) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: {
          role: true,
        },
        orderBy: {
          created_date_time: 'desc',
        },
      }),
      prisma.team.count({ where }),
    ]);

    // Remove passwords from response
    const teamsWithoutPassword = teams.map(({ password, ...team }) => team);

    return {
      teams: teamsWithoutPassword,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, data) {
    const updatedTeam = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        ...data,
        modified_date_time: new Date(),
      },
      include: {
        role: true,
      },
    });

    // Remove password from response
    const { password, ...teamWithoutPassword } = updatedTeam;
    return teamWithoutPassword;
  }

  static async delete(id) {
    return prisma.team.delete({
      where: { id: Number(id) },
    });
  }

  static async updatePassword(id, password) {
    return prisma.team.update({
      where: { id: Number(id) },
      data: {
        password, // Note: In production, this should be hashed
        modified_date_time: new Date(),
      },
    });
  }
}

module.exports = Team; 