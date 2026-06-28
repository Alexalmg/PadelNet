import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AnnouncementAttributes {
  id: number;
  title: string;
  content: string;
  authorId?: number;
  type: 'manual' | 'system';
  isPinned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnnouncementCreationAttributes extends Optional<AnnouncementAttributes, 'id' | 'type' | 'isPinned'> {}

export class Announcement extends Model<AnnouncementAttributes, AnnouncementCreationAttributes> implements AnnouncementAttributes {
  declare id: number;
  declare title: string;
  declare content: string;
  declare authorId: number;
  declare type: 'manual' | 'system';
  declare isPinned: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Announcement.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  authorId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.STRING(20), defaultValue: 'manual' },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  tableName: 'announcements',
  timestamps: true,
});
