const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Role {
  static async create(data) {
    return prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        created_date_time: new Date(),
        modified_date_time: new Date(),
      },
    });
  }

  static async findById(id) {
    return prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            team: true,
          },
        },
      },
    });
  }

  static async findByName(name) {
    return prisma.role.findFirst({
      where: { name },
    });
  }

  static async findAll({ page = 1, limit = 10, search }) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: {
          created_date_time: 'desc',
        },
        include: {
          _count: {
            select: {
              team: true,
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      roles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, data) {
    return prisma.role.update({
      where: { id: Number(id) },
      data: {
        ...data,
        modified_date_time: new Date(),
      },
      include: {
        _count: {
          select: {
            team: true,
          },
        },
      },
    });
  }

  static async delete(id) {
    return prisma.role.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = Role; 