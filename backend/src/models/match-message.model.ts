import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchMessageAttributes {
  id: number;
  matchId: number;
  userId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchMessageCreationAttributes extends Optional<MatchMessageAttributes, 'id'> {}

export class MatchMessage extends Model<MatchMessageAttributes, MatchMessageCreationAttributes> implements MatchMessageAttributes {
  declare id: number;
  declare matchId: number;
  declare userId: number;
  declare content: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

MatchMessage.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  tableName: 'match_messages',
  timestamps: true,
});
