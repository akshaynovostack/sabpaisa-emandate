const AccessControl = require('accesscontrol');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ac = new AccessControl();

// Will be populated from database
let roleIds = {};

const resources = {
  USERINFO: 'user',
  ROLE: 'role',
  TEAM: 'team',
  MANDATE: 'mandate',
  TRANSACTION: 'transaction',
  PERMISSION: 'permission',
  MERCHANT: 'merchant',
  DASHBOARD: 'dashboard',
};

// Function to initialize access control from database
async function initializeAccessControl() {
  try {
    // Get all roles with their permissions
    const rolesWithPermissions = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Set up roleIds from database
    for (const role of rolesWithPermissions) {
      roleIds[role.name.toUpperCase()] = role.id.toString();
    }


    // Set up grants for each role
    for (const role of rolesWithPermissions) {
      const roleGrant = ac.grant(role.id.toString());
      const isAdmin = role.name.toUpperCase() === 'ADMIN';
      
      // Default permissions for all roles
      Object.values(resources).forEach(resource => {
        // All roles can read their own data
        roleGrant.resource(resource).readOwn();
      });

      // Additional permissions based on role and assigned permissions
      if (isAdmin) {
        // Admin gets all permissions
        Object.values(resources).forEach(resource => {
          roleGrant.resource(resource)
            .createAny()
            .readAny()
            .updateAny()
            .deleteAny();
        });
      } else {
        // For non-admin roles, grant permissions based on their assigned permissions
        for (const { permission } of role.permissions) {
          
          if (permission.name.includes('Manage')) {
            // For manage permissions, grant CRUD operations on own resources
            Object.values(resources).forEach(resource => {
              roleGrant.resource(resource)
                .createOwn()
                .readOwn()
                .updateOwn()
                .deleteOwn();
            });
          } else if (permission.name.includes('View')) {
            // For view permissions, grant read access on own resources
            Object.values(resources).forEach(resource => {
              roleGrant.resource(resource).readOwn();
            });
          }
        }
      }
    }

  } catch (error) {
    throw error;
  }
}

// Export the configured access control
const roles = ac;

module.exports = {
  roles,
  resources,
  roleIds,
  initializeAccessControl
}; 