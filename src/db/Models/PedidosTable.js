const { DataTypes, Model } = require('sequelize');

module.exports = class Usuarios extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            paymentId: {
                type: DataTypes.STRING
            },
            link: {
                type: DataTypes.STRING
            },
            nick: {
                type: DataTypes.STRING
            },
            discord: {
                type: DataTypes.STRING
            },
            pago: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            setado: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            produto: {
                type: DataTypes.STRING
            },
            quantia: {
                type: DataTypes.STRING
            },
            tipo: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'Produtos',
            timestamps: true,
            sequelize
        });
    }
}