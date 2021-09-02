const Discord = require("discord.js"); 
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

const License = require("../../db/Models/LicenceTable")

module.exports = {
    name: 'ac',
    aliases: ['abc'], 
    categories : 'Utils', 
    description: 'Abrir o menu do criador da loja',
    usage: '',
    options: [
        {
            name: "guild",
            description: "Selecione um servidor",
            type: "STRING",
            required: true,
        },
        {
            name: "user",
            description: "Selecione o id do comprador",
            type: "STRING",
            required: true,
        }
    ],
    needOwnerPermission: true,
    /** 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @param {String[]} args 
     */
    run: async(client, interaction, args) => {

        const embedS = new MessageEmbed()
        .setAuthor("Sucesso")
        .setDescription("Agora este servidor poderá utilizar os meus serviços!\nEnviei a chave para a configuração em sua DM.")
        .setColor("GREEN")
        .setImage("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")

        const embedE = new MessageEmbed()
        .setAuthor("Erro", "https://cdn.discordapp.com/emojis/692930586901348353.gif")
        .setDescription("Este servidor já está cadastrado no sistema!")
        .setColor("RED")
        .setImage("https://media.discordapp.net/attachments/866817398908911689/878873517880401951/stage-en-error-1020.png?width=885&height=589")

        const findG = await License.findOne({
            where: {
                grupo: interaction.guildId
            }
        })

        if(findG) return interaction.editReply({
            embeds: [embedE]
        })
        function generateHexString(length) {
            var ret = "";
            while (ret.length < length) {
              ret += Math.random().toString(16).substring(2);
            }
            return ret.substring(0,length);
          }
          
         let a = await License.create({
            grupo: interaction.guildId,
            licence: generateHexString(15),
            comprador: interaction.options.get("user").value
        })

        interaction.editReply({
            embeds: [embedS]
        })

        interaction.user.send({
            content: a.licence
        })

    }
}