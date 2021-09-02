const { DataTypes, Model } = require('sequelize');

module.exports = class Usuarios extends Model {
    static init(sequelize) {
        return super.init({
            grupo: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            licence: {
                type: DataTypes.STRING
            },
            comprador: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'Licences',
            timestamps: true,
            sequelize
        });
    }
}