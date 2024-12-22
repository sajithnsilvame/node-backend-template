import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';

export class UserLoginSession extends Model {
  public id!: number;
  public userId!: number;
  public token!: string;
  public isValid!: boolean;
  public lastUsedAt!: Date;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserLoginSession.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'user_login_sessions',
});

// Establish relationship with User model
UserLoginSession.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserLoginSession, { foreignKey: 'userId' });

export default UserLoginSession;