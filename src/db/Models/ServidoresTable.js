const { DataTypes, Model } = require('sequelize');

module.exports = class Usuarios extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            grupo: {
                type: DataTypes.STRING
            },
            nome: {
                type: DataTypes.STRING
            },
            descricao: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'Servidores',
            timestamps: true,
            sequelize
        });
    }
}