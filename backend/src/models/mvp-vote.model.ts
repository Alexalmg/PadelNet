import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MvpVoteAttributes {
  id: number;
  matchId: number;
  votedBy: number;
  mvpUserId: number;
  ratedTeamId: number;
  fairPlayScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MvpVoteCreationAttributes extends Optional<MvpVoteAttributes, 'id'> {}

export class MvpVote extends Model<MvpVoteAttributes, MvpVoteCreationAttributes> implements MvpVoteAttributes {
  declare id: number;
  declare matchId: number;
  declare votedBy: number;
  declare mvpUserId: number;
  declare ratedTeamId: number;
  declare fairPlayScore: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

MvpVote.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  votedBy: { type: DataTypes.INTEGER, allowNull: false },
  mvpUserId: { type: DataTypes.INTEGER, allowNull: false },
  ratedTeamId: { type: DataTypes.INTEGER, allowNull: false },
  fairPlayScore: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  tableName: 'mvp_votes',
  timestamps: true,
});
