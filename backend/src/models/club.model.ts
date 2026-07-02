import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ClubAttributes {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClubCreationAttributes extends Optional<ClubAttributes, 'id' | 'phone' | 'isActive'> {}

export class Club extends Model<ClubAttributes, ClubCreationAttributes> implements ClubAttributes {
  declare id: number;
  declare name: string;
  declare address: string;
  declare latitude: number;
  declare longitude: number;
  declare phone?: string;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Club.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  address: { type: DataTypes.STRING(500), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'clubs',
  timestamps: true,
});
