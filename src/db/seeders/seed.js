const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../utils/password');
const prisma = new PrismaClient();

async function main() {
  try {
    // First create the admin role
    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Administrator role with full access',
      },
    });

    // Create user role
    const userRole = await prisma.role.create({
      data: {
        name: 'User',
        description: 'Regular user role with limited access',
      },
    });

    // Create basic permissions
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          name: 'Manage Users',
          description: 'Can create, update, and delete users',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Teams',
          description: 'Can create, update, and delete teams',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'View Reports',
          description: 'Can view system reports and analytics',
        },
      }),
    ]);

    // Assign permissions to admin role
    await Promise.all(
      permissions.map(permission =>
        prisma.role_permission.create({
          data: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        })
      )
    );

    // Then create the admin team with hashed password
    const adminTeam = await prisma.team.create({
      data: {
        name: 'Sabpaisa Admin',
        email: 'admin@sabpaisa.com',
        password: await hashPassword('Admin@sabpaisa2025'),
        description: 'Administrator team for Sabpaisa',
        mobile: '9999999999',
        role_id: adminRole.id,
        is_active: true,
      },
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  }); 