import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchProposalAttributes {
  id: number;
  matchId: number;
  proposingTeamId: number;
  proposedBy: number;
  proposedDate: Date;
  location?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchProposalCreationAttributes extends Optional<MatchProposalAttributes, 'id' | 'status'> {}

export class MatchProposal extends Model<MatchProposalAttributes, MatchProposalCreationAttributes> implements MatchProposalAttributes {
  declare id: number;
  declare matchId: number;
  declare proposingTeamId: number;
  declare proposedBy: number;
  declare proposedDate: Date;
  declare location: string;
  declare message: string;
  declare status: 'pending' | 'accepted' | 'rejected' | 'countered';
  declare createdAt: Date;
  declare updatedAt: Date;
}

MatchProposal.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false },
  proposingTeamId: { type: DataTypes.INTEGER, allowNull: false },
  proposedBy: { type: DataTypes.INTEGER, allowNull: false },
  proposedDate: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING(255) },
  message: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
}, {
  sequelize,
  tableName: 'match_proposals',
  timestamps: true,
});
