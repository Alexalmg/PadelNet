import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAchievementAttributes {
  id: number;
  userId: number;
  achievementId: number;
  awardedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserAchievementCreationAttributes extends Optional<UserAchievementAttributes, 'id' | 'awardedAt'> {}

export class UserAchievement extends Model<UserAchievementAttributes, UserAchievementCreationAttributes> implements UserAchievementAttributes {
  declare id: number;
  declare userId: number;
  declare achievementId: number;
  declare awardedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserAchievement.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  achievementId: { type: DataTypes.INTEGER, allowNull: false },
  awardedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'user_achievements',
  timestamps: true,
});
