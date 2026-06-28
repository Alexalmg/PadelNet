import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CaptainRequestAttributes {
  id: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  reviewedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CaptainRequestCreationAttributes extends Optional<CaptainRequestAttributes, 'id' | 'status' | 'message' | 'reviewedBy'> {}

export class CaptainRequest extends Model<CaptainRequestAttributes, CaptainRequestCreationAttributes> implements CaptainRequestAttributes {
  declare id: number;
  declare userId: number;
  declare status: 'pending' | 'approved' | 'rejected';
  declare message?: string;
  declare reviewedBy?: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

CaptainRequest.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  message: { type: DataTypes.TEXT, allowNull: true },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  sequelize,
  tableName: 'captain_requests',
  timestamps: true,
});
