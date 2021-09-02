const Discord = require("discord.js"); 
const { Client, CommandInteraction, MessageEmbed } = require('discord.js');

const License = require("../../db/Models/LicenceTable")
const Servidores = require("../../db/Models/ServidoresTable")
const Pedidos = require("../../db/Models/PedidosTable")
const Produtos = require("../../db/Models/ProdutosTable")
module.exports = {
    name: 'admin',
    aliases: ['abc'], 
    categories : 'Utils', 
    description: 'Abrir o menu de admininstradores da loja',
    usage: '',
    options: [
        {
            name: "fazer",
            description: "Selecionar oque deseja fazer.",
            type: "STRING",
            required: true,
            choices: [
                {
                    name: 'Criar Servidor',
                    value: 'criarS',
                },
                {
                    name: 'Deletar Servidor',
                    value: 'deletarS',
                },
                {
                    name: 'Listar Pedidos Pendente',
                    value: 'LP',
                },
                {
                    name: 'Criar um produto',
                    value: 'criarP',
                },
                {
                    name: 'Deletar um produto',
                    value: 'deletarP',
                },
                
            ]
        }
    ],
    /** 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @param {String[]} args 
     */
    run: async(client, interaction, args) => {

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

        if(!findG || interaction.user.id !== findG.comprador) return interaction.editReply({
            embeds: [embedE]
        })
        
        let opcao = interaction.options.get("fazer").value
        const DM = await interaction.user.createDM()
        const embedS = new MessageEmbed()
        .setAuthor("Loja")
        .setDescription("Verifique sua dm.")
        .setColor("GREEN")
        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")

        interaction.editReply({
            embeds: [embedS]
        })
        switch(opcao) {
            case 'criarS':

function Solicitar() {
    const embed1 = new MessageEmbed()
    .setAuthor("Qual o nome do servidor? Maximo de 25 caracteres.")
    .setDescription("Iremos validar caso já existente.")
    .setColor("GREEN")

    DM.send({
        embeds: [embed1]
    })

    const c = DM.createMessageCollector({
        filter: (f) => f.author.id === interaction.user.id, max: 1
    })

    c.on("collect", async m => {
        const svName = m.content
        if(svName.length > 25) return m.reply("Exedeu o limite de caracteres!") && Solicitar()
        const findS = await Servidores.findOne({
            where: {
                nome: svName
            }
        })

        if(findS) return m.reply("Este servidor já existe!") && Solicitar()

        const embed2 = new MessageEmbed()
        .setAuthor("Qual é a descrição deste servidor?")
        .setDescription("Insira os detalhes do servidor, maximo de 50 caracteres.")
        .setColor("GREEN")
    
        DM.send({
            embeds: [embed2]
        })
    
        const c = DM.createMessageCollector({
            filter: (f) => f.author.id === interaction.user.id, max: 1
        })
    
        c.on("collect", async m => {
            const descricao = m.content

            if(descricao.length > 50) return m.reply("Exedeu o limite de caracteres!") && Solicitar()

            m.reply("Criado com sucesso!")

            await Servidores.create({
                grupo: interaction.guildId,
                nome: svName,
                descricao
            })
        })
    })
}
Solicitar()
                break;

                case 'deletarS': 
                
                const embed2 = new MessageEmbed()
                .setAuthor("Deletar Servidor")
                .setDescription("Escolha abaixo o servidor.")
                .setColor("GREEN")
                .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
        
                
                const embedErr = new MessageEmbed()
                .setAuthor("Deletar Servidor")
                .setDescription("Nenhum servidor foi encontrado para ser deletado.")
                .setColor("GREEN")
                .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
        
                const findS = await Servidores.findAll({
                    where: {
                        grupo: interaction.guildId
                    }
                })

                if(findS.length < 1) return DM.send({
                    embeds: [embedErr]
                })

                const select = new Discord.MessageSelectMenu()
                .setCustomId("deletar")
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder("Selecionar servidor.")

                findS.map(f => {
                    select.addOptions({
                        label: String(f.nome),
                        value: String(f.id),
                        description: f.descricao
                    })
                })

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
                            findValor.destroy()
                        interaction2.reply("Deletado com sucesso!")

                    }
                    })
                })
                break;
                case 'LP':
                        const EmbedD = new Discord.MessageEmbed()
                        .setTitle("Lista de pedidos pendentes.")
                        .setDescription(`Aqui irei exibir ___***ATÉ***___ 10 pedidos recentes.
                        ${(await Pedidos.findAll({
                            where: {
                                id: interaction.guildId,
                                pago: false
                            },
                            order: [["createdAt", "DESC"]],
                            limit: 10
                        })).length > 1 ? this.map(f => {
                            return `Nick: ${f.nick}
                                    Produto: ${f.produto}
                                    Quantia: ${f.quantia}
                                    Tipo: ${f.tipo}\n`
                        }) : "Nenhum para exibir"}`)
                        .setColor((await Pedidos.findAll({
                            where: {
                                id: interaction.guildId,
                                pago: false
                            },
                            order: [["createdAt", "DESC"]],
                            limit: 10
                        })).length > 1 ? "GREEN" : "RED")
                        DM.send({
                            embeds: [EmbedD]
                        })
                    break;
                    case 'criarP':

                        async function Solicitar2() {
                            const embed1 = new MessageEmbed()
                            .setAuthor("Qual o nome do Produto? Maximo de 25 caracteres.")
                            .setDescription("Iremos validar caso já existente.")
                            .setColor("GREEN")
                            const embedErr3 = new MessageEmbed()
                            .setAuthor("Criação de Produto")
                            .setDescription("Nenhum Servidor foi encontrado para criar um produto.")
                            .setColor("RED")
                            .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
                    
                            const findSE = await Servidores.findAll({
                                where: {
                                    grupo: interaction.guildId
                                }
                            })
            
                            if(findSE.length < 1) return DM.send({
                                embeds: [embedErr3]
                            })
            
                            const select = new Discord.MessageSelectMenu()
                            .setCustomId("deletar")
                            .setMaxValues(1)
                            .setMinValues(1)
                            .setPlaceholder("Selecionar servidor.")
            
                            findSE.map(f => {
                                select.addOptions({
                                    label: String(f.nome),
                                    value: String(f.id),
                                    description: f.descricao
                                })
                            })
                            const embed = new MessageEmbed()
                            .setAuthor("Criar um Produto")
                            .setDescription("Escolha abaixo o servidor para o produto ser criado.")
                            .setColor("GREEN")
                            .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
                    
                            DM.send({
                                embeds: [embed],
                                components: [new Discord.MessageActionRow().addComponents(select)]
                            }).then(f => {
                                f.createMessageComponentCollector({
                                    filter: (b) => b.user.id === interaction.user.id,
                                    max: 1
                                })
                                .on("collect", async interaction2 => {
            
                                    if(interaction2.isSelectMenu()) { 
                        interaction2.reply({
                            embeds: [embed1]
                        })
                            const c = DM.createMessageCollector({
                                filter: (f) => f.author.id === interaction.user.id, max: 1
                            })
                        
                            c.on("collect", async m => {
                                const svName = m.content
                                if(svName.length > 25) return m.reply("Exedeu o limite de caracteres!") && Solicitar()
                                const findS = await Produtos.findOne({
                                    where: {
                                        nome: svName
                                    }
                                })
                        
                                if(findS) return m.reply("Este Produto já existe!") && Solicitar()
                        
                                const embed2 = new MessageEmbed()
                                .setAuthor("Qual é a descrição deste Produto?")
                                .setDescription("Insira os detalhes do servidor, maximo de 35 caracteres.")
                                .setColor("GREEN")
                            
                                DM.send({
                                    embeds: [embed2]
                                })
                            
                                const c = DM.createMessageCollector({
                                    filter: (f) => f.author.id === interaction.user.id, max: 1
                                })
                            
                                c.on("collect", async m => {
                                    const descricao = m.content

                                    const embed2 = new MessageEmbed()
                                    .setAuthor("Qual é o tipo deste Produto?")
                                    .setDescription("Insira o tipo do produto, setado na config.yml do plugin para executar a ativação automatica até uma compra ser aprovada..")
                                    .setColor("GREEN")
                                
                                    DM.send({
                                        embeds: [embed2]
                                    })
                                
                                    const c = DM.createMessageCollector({
                                        filter: (f) => f.author.id === interaction.user.id, max: 1
                                    })
                                
                                    c.on("collect", async m => {
                                        const tipo = m.content
                        
                                    if(descricao.length > 50) return m.reply("Exedeu o limite de caracteres!") && Solicitar()
                                    const embed2 = new MessageEmbed()
                                    .setAuthor("Qual é a quantidade para ativação deste Produto? ( ex: caso for cash, coloque 50, para informar que é 50 de tal coisa )")
                                    .setDescription("Insira apenas numeros.")
                                    .setColor("GREEN")
                                
                                    DM.send({
                                        embeds: [embed2]
                                    })
                                
                                    const c = DM.createMessageCollector({
                                        filter: (f) => f.author.id === interaction.user.id, max: 1
                                    })
                                
                                    c.on("collect", async m => {
                                        const quantia = m.content
                                        if(isNaN(quantia)) return m.reply("Insira um numero!") && Solicitar2()
                                    const embed2 = new MessageEmbed()
                                    .setAuthor("Qual é é o preço deste Produto?")
                                    .setDescription("Insira o preço, sem R$, sem virgulas, por exemplo: 39.35\nO valor acima é 39 reais e 35 centavos.")
                                    .setColor("GREEN")
                                
                                    DM.send({
                                        embeds: [embed2]
                                    })
                                
                                    const c = DM.createMessageCollector({
                                        filter: (f) => f.author.id === interaction.user.id, max: 1
                                    })
                                
                                    c.on("collect", async m => {
                                        const valor = m.content
                                        if(isNaN(parseFloat(valor))) return m.reply("Insira um numero como 39.99!") && Solicitar2()
                                    m.reply("Criado com sucesso! Taxa do mercado pago pelo preço: " + (parseInt(quantia) / 4.99))
                        
                                    await Produtos.create({
                                        grupo: interaction.guildId,
                                        nome: svName,
                                        descricao,
                                        tipo: tipo,
                                        price: parseFloat(valor),
                                        quantia: parseInt(quantia),
                                        servidor: interaction2.values[0]
                                    })
                                })
                            })
                            })
                                })
                            })
                        }
                    })
                })
                        }
                        Solicitar2()
                                        break;                        
                                        case 'deletarP': 
                
                                        const embed3 = new MessageEmbed()
                                        .setAuthor("Deletar Produto")
                                        .setDescription("Escolha abaixo o Produto.")
                                        .setColor("GREEN")
                                        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
                                
                                        
                                        const embedErr2 = new MessageEmbed()
                                        .setAuthor("Deletar Produto")
                                        .setDescription("Nenhum Produto foi encontrado para ser deletado.")
                                        .setColor("RED")
                                        .setThumbnail("https://media.discordapp.net/attachments/878877410018336838/878877702868852736/874341434956865556.png")
                                
                                        let findSS = await Produtos.findAll({
                                            where: {
                                                grupo: interaction.guildId
                                            }
                                        })
                        
                                        if(findSS.length < 1) return DM.send({
                                            embeds: [embedErr2]
                                        })
                        
                                        const select2 = new Discord.MessageSelectMenu()
                                        .setCustomId("deletar")
                                        .setMaxValues(1)
                                        .setMinValues(1)
                                        .setPlaceholder("Selecionar Produto.")
                        
                                        findSS.map(f => {
                                            select2.addOptions({
                                                label: String(f.nome),
                                                value: String(f.id),
                                                description: f.descricao
                                            })
                                        })
                        
                                        DM.send({
                                            embeds: [embed3],
                                            components: [new Discord.MessageActionRow().addComponents(select2)]
                                        }).then(f => {
                                            f.createMessageComponentCollector({
                                                filter: (b) => b.user.id === interaction.user.id,
                                                max: 1
                                            })
                                            .on("collect", async interaction2 => {
                        
                                                if(interaction2.isSelectMenu()) { 
                        
                                                    const findValor = await Pedidos.findOne({
                                                        where: {
                                                            id: parseInt(interaction2.values[0])
                        
                                                        }
                                                    })
                                                    if(!findValor) return interaction2.reply("`[AntiBUG]` Não consegui encontrar!")
                                                    findValor.destroy()
                                                interaction2.reply("Deletado com sucesso!")
                        
                                            }
                                            })
                                        })
                                        break;
                                        
                                    }

}
}