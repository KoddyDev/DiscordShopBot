const { DataTypes, Model } = require('sequelize');

module.exports = class Ticket extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            authorId: { type: DataTypes.TEXT },
            nota: { type: DataTypes.INTEGER },
            comentario: { type: DataTypes.STRING }
        }, {
            tableName: 'Notas',
            timestamps: true,
            sequelize
        });
    }
}