import { QueryInterface } from 'sequelize';

const userRoles = [
    {
        role_name: 'superadmin',
        description: 'Super Administrator with full access',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        role_name: 'admin',
        description: 'Administrator with limited access',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        role_name: 'manager',
        description: 'Manager with department access',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        role_name: 'user',
        description: 'Regular user with basic access',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('user_roles', userRoles, {});
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('user_roles', {
        role_name: userRoles.map(role => role.role_name),
    }, {});
};