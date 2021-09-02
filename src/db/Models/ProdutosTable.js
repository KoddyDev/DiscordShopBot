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
            price: {
                type: DataTypes.FLOAT
            },
            descricao: {
                type: DataTypes.STRING
            },
            servidor: {
                type: DataTypes.STRING
            }
            
        }, {
            tableName: 'Produtoss',
            timestamps: true,
            sequelize
        });
    }
}