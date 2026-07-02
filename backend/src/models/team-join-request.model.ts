import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TeamJoinRequestAttributes {
  id: number;
  teamId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamJoinRequestCreationAttributes extends Optional<TeamJoinRequestAttributes, 'id' | 'status'> {}

export class TeamJoinRequest extends Model<TeamJoinRequestAttributes, TeamJoinRequestCreationAttributes> implements TeamJoinRequestAttributes {
  declare id: number;
  declare teamId: number;
  declare userId: number;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare createdAt: Date;
  declare updatedAt: Date;
}

TeamJoinRequest.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
}, {
  sequelize,
  tableName: 'team_join_requests',
  timestamps: true,
});
