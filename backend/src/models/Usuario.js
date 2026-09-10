import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Usuario interno del marketplace.
 * El campo id lo genera automáticamente la base de datos (autoincremental).
 */
export const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' },
        len: { args: [2, 60], msg: 'El nombre debe tener entre 2 y 60 caracteres' }
      }
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El apellido es obligatorio' },
        len: { args: [2, 60], msg: 'El apellido debe tener entre 2 y 60 caracteres' }
      }
    },
    documento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Ya existe un usuario con ese documento' },
      validate: {
        notEmpty: { msg: 'El documento es obligatorio' },
        is: {
          args: /^[A-Za-z0-9.\-]{6,20}$/,
          msg: 'El documento debe tener entre 6 y 20 caracteres (letras, números, punto o guion)'
        }
      }
    },
    legajo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Ya existe un usuario con ese legajo' },
      validate: {
        notEmpty: { msg: 'El legajo es obligatorio' },
        is: {
          args: /^[A-Za-z0-9\-]{2,20}$/,
          msg: 'El legajo debe tener entre 2 y 20 caracteres (letras, números o guion)'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Ya existe un usuario con ese email' },
      validate: {
        notEmpty: { msg: 'El email es obligatorio' },
        isEmail: { msg: 'El email no tiene un formato válido' }
      }
    },
    domicilio: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El domicilio es obligatorio' },
        len: { args: [5, 120], msg: 'El domicilio debe tener entre 5 y 120 caracteres' }
      }
    }
  },
  {
    tableName: 'usuarios',
    timestamps: true // agrega createdAt y updatedAt
  }
);
