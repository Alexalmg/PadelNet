import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PaymentAttributes {
  id: number;
  teamId: number;
  seasonId: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'amount'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: number;
  declare teamId: number;
  declare seasonId: number;
  declare amount: number;
  declare status: 'pending' | 'paid' | 'overdue';
  declare paidAt: Date;
  declare notes: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Payment.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  seasonId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  paidAt: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
}, {
  sequelize,
  tableName: 'payments',
  timestamps: true,
});
