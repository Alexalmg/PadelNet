import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum UserRole {
  PLAYER = 'player',
  CAPTAIN = 'captain',
  ADMIN = 'admin',
}

export enum PadelLevel {
  INICIACION = 'iniciacion',
  INTERMEDIO = 'intermedio',
  AVANZADO   = 'avanzado',
  COMPETICION = 'competicion',
}

export enum PreferredSide {
  DRIVE  = 'drive',
  REVES  = 'reves',
  AMBOS  = 'ambos',
}

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isProfileComplete: boolean;
  username?: string;
  profilePhotoUrl?: string;
  bio?: string;
  padelLevel?: PadelLevel;
  preferredSide?: PreferredSide;
  yearsPlaying?: number;
  preferredCourt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phone' | 'role' | 'isActive' | 'isProfileComplete' | 'username' | 'profilePhotoUrl' | 'bio' | 'padelLevel' | 'preferredSide' | 'yearsPlaying' | 'preferredCourt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare phone?: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare isProfileComplete: boolean;
  declare username?: string;
  declare profilePhotoUrl?: string;
  declare bio?: string;
  declare padelLevel?: PadelLevel;
  declare preferredSide?: PreferredSide;
  declare yearsPlaying?: number;
  declare preferredCourt?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  role: { type: DataTypes.STRING(20), defaultValue: UserRole.PLAYER },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isProfileComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
  username: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  profilePhotoUrl: { type: DataTypes.TEXT, allowNull: true },
  bio: { type: DataTypes.STRING(500), allowNull: true },
  padelLevel: { type: DataTypes.STRING(20), allowNull: true },
  preferredSide: { type: DataTypes.STRING(10), allowNull: true },
  yearsPlaying: { type: DataTypes.INTEGER, allowNull: true },
  preferredCourt: { type: DataTypes.STRING(20), allowNull: true },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
});
