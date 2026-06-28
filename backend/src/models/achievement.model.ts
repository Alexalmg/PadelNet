import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AchievementAttributes {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AchievementCreationAttributes extends Optional<AchievementAttributes, 'id'> {}

export class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
  declare id: number;
  declare slug: string;
  declare name: string;
  declare description: string;
  declare icon: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Achievement.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  slug: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING(50) },
}, {
  sequelize,
  tableName: 'achievements',
  timestamps: true,
});
