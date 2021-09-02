const { Sequelize } = require("sequelize")
module.exports = new Sequelize({
    storage: './db.sqlite',
    dialect: 'sqlite',
    logging: false
})