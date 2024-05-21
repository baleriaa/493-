const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false
  },
  admin: { type: DataTypes.BOOLEAN, defaultValue: false }
})

exports.User = User
exports.UserClientFields = [
  'id',
  'name',
  'email',
  'admin'
]

