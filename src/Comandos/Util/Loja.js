const Discord = require("discord.js"); 
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

const License = require("../../db/Models/LicenceTable")
const Servidores = require("../../db/Models/ServidoresTable")
const Pedidos = require("../../db/Models/PedidosTable")
const Produtos = require("../../db/Models/ProdutosTable")
module.exports = {
    name: 'loja',
    aliases: ['abc'], 
    categories : 'Utils', 
    description: 'Abrir o menu da loja',
    usage: '',
     /** 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @param {String[]} args 
     */
      run: async(client, interaction, args) => {

        const DM = await interaction.user.createDM()
        const embedS = new MessageEmbed()
        .setAuthor("Loja")
        .setDescription("Verifique sua dm.")
        .setColor("GREEN")
        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")

        interaction.editReply({
            embeds: [embedS]
        })
        let findG = await License.findOne({
            where: {
                grupo: interaction.guildId
            }
        })

        const embedE = new MessageEmbed()
        .setAuthor("Erro", "https://cdn.discordapp.com/emojis/692930586901348353.gif")
        .setDescription("Este servidor não possue a permissão para isto!")
        .setColor("RED")
        .setImage("https://media.discordapp.net/attachments/866817398908911689/878873517880401951/stage-en-error-1020.png?width=885&height=589")
        .setURL("https://discord.gg/5CpapGDwq5")
        .setFooter("Desenvolvido por uVini__#7127")

        if(!findG) return interaction.editReply({
            embeds: [embedE]
        })

        const embedErr = new MessageEmbed()
        .setAuthor("🤔 | Servidores")
        .setDescription("Nenhum servidor foi encontrado para você realizar uma compra 😢.")
        .setColor("RED")
        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
        .setURL("https://discord.gg/5CpapGDwq5")
        .setFooter("Desenvolvido por uVini__#7127")

        const findS = await Servidores.findAll({
            where: {
                grupo: interaction.guildId
            }
        })

        if(findS.length < 1) return DM.send({
            embeds: [embedErr]
        })

        const embedErr2 = new MessageEmbed()
        .setAuthor("🤔 | Produtos")
        .setDescription("Nenhum produto foi encontrado para você realizar uma compra 😢.")
        .setColor("RED")
        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
        .setURL("https://discord.gg/5CpapGDwq5")
        .setFooter("Desenvolvido por uVini__#7127")

        const findP = await Produtos.findAll({
            where: {
                grupo: interaction.guildId
            }
        })

        if(findP.length < 1) return DM.send({
            embeds: [embedErr2]
        })
        const select = new Discord.MessageSelectMenu()
        .setCustomId("deletar")
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder("Selecionar servidor.")

        findP.map(f => {
            select.addOptions({
                label: String(f.nome),
                value: String(f.id),
                description: f.descricao
            })
        })


        const embed2 = new MessageEmbed()
        .setTitle("🙋 | Compras")
        .setDescription(`Olá ${interaction.user}, escolha um servidor abaixo para continuar!`)
        .setURL("https://discord.gg/5CpapGDwq5")
        .setFooter("Desenvolvido por uVini__#7127")

        DM.send({
            embeds: [embed2],
            components: [new Discord.MessageActionRow().addComponents(select)]
        }).then(f => {
            f.createMessageComponentCollector({
                filter: (b) => b.user.id === interaction.user.id,
                max: 1
            })
            .on("collect", async interaction2 => {

                if(interaction2.isSelectMenu()) { 

                    const findValor = await Servidores.findOne({
                        where: {
                            id: parseInt(interaction2.values[0])

                        }
                    })
                    if(!findValor) return interaction2.reply("`[AntiBUG]` Não consegui encontrar!")

                    const embed3 = new MessageEmbed()
                    .setTitle("🙋 | Compras")
                    .setDescription(`Olá ${interaction.user}, escolha um produto abaixo para continuar!`)
                    .setURL("https://discord.gg/5CpapGDwq5")
                    .setFooter("Desenvolvido por uVini__#7127")
            
                    const select2 = new Discord.MessageSelectMenu()
                    .setCustomId("deletar")
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder("Selecionar servidor.")

                    const findP = await Produtos.findAll({
                        where: {
                            grupo: interaction.guildId,
                            servidor: parseInt(interaction2.values[0])
                        }
                    })
                    
                    findP.map(f => {
                        select2.addOptions({
                            label: String(f.nome),
                            value: String(f.id),
                            description: `Preço: R$${f.price}, ${f.descricao}`
                        })
                    })
                    await interaction2.deferReply()
                    await interaction2.deleteReply()
                    DM.send({
                        embeds: [embed3],
                        components: [new Discord.MessageActionRow().addComponents(select2)]
                    }).then(f => {
                        f.createMessageComponentCollector({
                            filter: (b) => b.user.id === interaction.user.id,
                            max: 1
                        })
                        .on("collect", async interaction3 => {
                            if(interaction3.isSelectMenu()) {
                            const findP1 = await Produtos.findOne({
                                where: {
                                    id: interaction3.values[0]
                                }
                            })
                            await interaction3.deferReply()
                            await interaction3.deleteReply()

                            const embed2 = new MessageEmbed()
                            .setAuthor("Nick")
                            .setDescription("Insira o seu nick para poder receber o produto in-game ao se authenticar. Maximo 12 caracteres")
                            .setColor("GREEN")
                        
                            DM.send({
                                embeds: [embed2]
                            })
                        
                            const c = DM.createMessageCollector({
                                filter: (f) => f.author.id === interaction.user.id, max: 1
                            })
                        
                            c.on("collect", async m => {
    const mercadopago = require('mercadopago')
    mercadopago.configure({
      access_token: 'TEST-2857075268230175-031319-4c66a624f2ee4d326b352a5d879cf611-96167551'
  })
        let preference = {
            items: [
              {
                title: findP1.nome,
                unit_price: findP1.price,
                quantity: 1,
                picture_url: `${interaction.guild.iconURL()}`
              }
            ]
          };
          
          mercadopago.preferences.create(preference)
          .then(async function(response){
            
                await Pedidos.create({
                    nick: m.content,
                    link: response.body.init_point,
                    paymentId: response.body.id,
                    discord: interaction.user.id,
                    pago: false,
                    setado: false,
                    produto: findP1.nome,
                    quantia: findP1.quantia,
                    tipo: findP1.tipo
                })
               
               DM.send("Agora só falta você Pagar!")
               DM.send({
                   content: response.body.init_point
               })
               
          }).catch(function(error){
            console.log(error);
    })
})

     
                            
                        }
                        })
                    })


                }
            })
        })

      }
    }