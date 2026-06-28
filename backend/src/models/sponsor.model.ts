import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SponsorAttributes {
  id: number;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  slot?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SponsorCreationAttributes extends Optional<SponsorAttributes, 'id' | 'isActive'> {}

export class Sponsor extends Model<SponsorAttributes, SponsorCreationAttributes> implements SponsorAttributes {
  declare id: number;
  declare name: string;
  declare logoUrl: string;
  declare websiteUrl: string;
  declare isActive: boolean;
  declare slot: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Sponsor.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  logoUrl: { type: DataTypes.TEXT },
  websiteUrl: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  slot: { type: DataTypes.STRING(50) },
}, {
  sequelize,
  tableName: 'sponsors',
  timestamps: true,
});
