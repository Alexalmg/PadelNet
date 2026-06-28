import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LineupAttributes {
  id: number;
  matchId: number;
  teamId: number;
  pairNumber: number;
  player1Id: number;
  player2Id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LineupCreationAttributes extends Optional<LineupAttributes, 'id'> {}

export class Lineup extends Model<LineupAttributes, LineupCreationAttributes> implements LineupAttributes {
  declare id: number;
  declare matchId: number;
  declare teamId: number;
  declare pairNumber: number;
  declare player1Id: number;
  declare player2Id: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Lineup.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  pairNumber: { type: DataTypes.INTEGER, allowNull: false },
  player1Id: { type: DataTypes.INTEGER, allowNull: false },
  player2Id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  tableName: 'lineups',
  timestamps: true,
});
