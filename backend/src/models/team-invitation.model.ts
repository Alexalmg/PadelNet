import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TeamInvitationAttributes {
  id: number;
  teamId: number;
  invitedUserId: number;
  invitedBy: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamInvitationCreationAttributes extends Optional<TeamInvitationAttributes, 'id' | 'status'> {}

export class TeamInvitation extends Model<TeamInvitationAttributes, TeamInvitationCreationAttributes> implements TeamInvitationAttributes {
  declare id: number;
  declare teamId: number;
  declare invitedUserId: number;
  declare invitedBy: number;
  declare status: 'pending' | 'accepted' | 'declined';
  declare createdAt: Date;
  declare updatedAt: Date;
}

TeamInvitation.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  invitedUserId: { type: DataTypes.INTEGER, allowNull: false },
  invitedBy: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), defaultValue: 'pending' },
}, {
  sequelize,
  tableName: 'team_invitations',
  timestamps: true,
});
