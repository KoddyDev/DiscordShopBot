const express = require("express")
const app = express()

const consola = require("consola")
const mp = require("mercadopago")
const Login = require("./src/db/DatabaseLogin")
const Pedidos = require("./src/db/Models/PedidosTable")
const Licences = require("./src/db/Models/LicenceTable")
const Ticket = require("./src/db/Models/TicketSystem.js")
const Notas = require("./src/db/Models/Nota")
const Servidores = require("./src/db/Models/ServidoresTable")
const Produtos = require("./src/db/Models/ProdutosTable")


let r1 = 0;
let r2 = 0;

mp.configure({
    // access_token: 'APP_USR-2857075268230175-031319-56f65415d5321702d5e41a328824d7c7-96167551'
    access_token: "TEST-2857075268230175-031319-4c66a624f2ee4d326b352a5d879cf611-96167551"
})

  app.post('/webhook', (req, res, next) => {
    if( req.query.id === undefined && req.query.topic === undefined ){
      // THIS IS THE TESTS THAT IS GOING TO DO MERCADOPAGO WHEN YOU SET THE ENPOINT FOR NOTIFICATIONS
      // JUST RETURN 200
      res.status(200).send({});
    }else{
      mp.ipn.manage(req).then( async function (ipnResponse) {

            const findP = await Pedidos.findOne({
                where: {
                    paymentId: ipnResponse.body.preference_id
                }
            })

            if(findP) {
                if(findP.pago === false && ipnResponse.body.status === "APPROVED" ) {
                    findP.update({
                        pago: true
                    })
                }
            }

          res.status(200).send({
            status: 'OK'
          });
        }).catch(err => {
        console.log('An error ocurr: ' + err);
        res.status(500).send({});
      });
    }
  });

app.get("/api/produtos/find", async (req, res) => {
    r2++
    console.log(r2)
    const licence = req.query.license
    
    if(!licence || !(await Licences.findOne({where: { licence }}))) return res.status(400).send({
      success : false,
      message: "None param of License or Invalid Licence."
    })
   
    const filter = req.query.filter
  
    if(!filter) return res.status(400).send({
      success : false,
      message: "No valid Param \"filter\". Types: [1 = Pago, 2 = Não Pago, 3 = ALL]"
    })
  
    if(isNaN(filter) && !filter >= 1 && filter !== 2 && filter !== 3) return res.status(400).send({
      success : false,
      message: "No valid. Types: [1 = Pago, 2 = Não Pago, 3 = ALL]"
    })
  
    let data;
    if(filter === 1) {
  
     data = await Pedidos.findAll({
          where: {
              pago: true
          }
      })
  
  } else if(filter === 2) {
  
      data = await Pedidos.findAll({
          where: {
              pago: false
          }
      })
  } if(filter === 3) {
  
      data = await Pedidos.findAll()
  }
  
  let array = []
  
  let map = data.map(f => {
      array.push({
          pago: f.dataValues.pago,
          setado: f.dataValues.setado,
          nick: f.dataValues.nick,
          produto: f.dataValues.produto,
          quantia: f.dataValues.quantia,
          tipo: f.dataValues.tipo
      })
  })
    
    return res.send({
      success: true, 
      message: "Valid Licence", 
  
      })
  })
  app.get("/api/produtos/edit", async (req, res) => {
    r2++

    console.log(req.body)
    const licence = req.query.license
    
    if(!licence || !(await Licences.findOne({where: { licence }}))) return res.status(400).send({
      success : false,
      message: "None param of License or Invalid Licence."
    })
   
    const nick = req.query.nick

    if(!nick || !(await Pedidos.findOne({where: { nick }}))) return res.status(400).send({
      success : false,
      message: "None param of nick or Invalid nick."
    })
    
    return res.send({
      success: true, 
      message: "Successfully edited.", 
  
      })
  })



app.listen(8000, () => 
{
  consola.success("API Iniciada. ")
  Login.authenticate().then(() => {
    Pedidos.init(Login).sync({force: false})
    Licences.init(Login).sync({force: false})
    Ticket.init(Login).sync({force: false})
    Notas.init(Login).sync({force: false})
    Servidores.init(Login).sync({force: false})
    Produtos.init(Login).sync({force: false})
    
    Pedidos.addHook('afterCreate', 'notifyUsers', (pedidos, options) => {
        console.log(pedidos.dataValues.discord)
     });
    consola.success("DB Iniciada.")

  })
})


  const Discord = require("discord.js")
const Figlet = require("figlet")
const moment = require("moment")

const cmds = require("./src/Handlers/Command")
const { options } = require("./src/db/Models/PedidosTable")

const client = new Discord.Client({
    intents: [
        "GUILDS", 
        "GUILD_BANS", 
        "GUILD_EMOJIS_AND_STICKERS", 
        "GUILD_MEMBERS", 
        "GUILD_INVITES", 
        "GUILD_PRESENCES", 
        "GUILD_MESSAGE_REACTIONS", 
        "GUILD_MESSAGES", 
        "GUILD_MESSAGE_TYPING",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS"
    ]
})
client.slashCommands = new Discord.Collection();

client.on("ready", async () => {

   let a = await Pedidos.create({
        discord: "OK"
    })



    
    Figlet.text("DiscordShop - BOT", (err, result) => {
    console.log(result)

    console.log(`
    O bot da DiscordShop foi inicializado com sucesso!
    
    Enviando mensagens ao canal de logs do bot.`)

    cmds(client)
})

const LG = client.channels.cache.get("878825693037883453")
if(LG?.isText()) {
    let d = new Date()
    


    let embedL = new Discord.MessageEmbed()
    .setAuthor(`Atualização do BOT`, client.user.displayAvatarURL())
    .addField("⌚ Iniciado ás", `${moment(d).format('DD [de] MMMM [de] YYYY[,] [às] HH[h] [e] M[m]')}`)
    .addField("💻 Versão", "1.0", true)
    .addField("<:djs:875065434892820510> Discord.js", Discord.version.toString(), true)

    .setColor("PURPLE")
    .setThumbnail(client.user.displayAvatarURL())

    LG.messages.fetch().then(r => {
        r.get("878837310257520700").edit({
            embeds: [embedL],
            content: null
        })
    })
}



})

client.on('interactionCreate', async (button) => {
    if(button.user.bot) return;
    if(button.isSelectMenu() && button.customId === "tickettt") {
        
    const configT = require("./configTicket.json")

        const { MessageEmbed } = require("discord.js")
        const moment = require("moment")
        for(let i = 0; i < configT.ticket.tipos.length; i++) {
            if(button.values[0] === configT.ticket.tipos[i].id) {
                let perm = [
                    {
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'],
                        id: button.user.id
                    },
                    {
                        deny: 'VIEW_CHANNEL',
                        id: button.guildId
                    }
                ]
                for(let i = 0; i < configT.ids.cargos.tickets.length; i++) {
                    perm.push(                {
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'],
                        id: configT.ids.cargos.tickets[i]
                    },)
                }
                await button.deferReply({ephemeral: true})
const findUser2 = await Ticket.findOne({where: {
    authorId: button.user.id,
    resolved: false
}})
                if(findUser2) return await button.editReply("Você já possue um ticket").catch((e) => {
                    console.log(e);
                  });
                  await button.editReply("O ticket foi criado com sucesso")
                const canal = await button.guild.channels.create(configT.ticket.tipos[i].canalName + `-${button.user.username}`, {
                    parent: configT.ids.categories.ticket,
                    type: 'text',
                    permissionOverwrites: perm
                  })
                  
                  var tipo1 = new Discord.MessageButton()
                  .setLabel("Fechar")
                  .setEmoji('859777462615539712')
                  .setCustomId('fechartickett')
                  .setStyle("DANGER")
                  const row = new Discord.MessageActionRow()
                  .addComponents(tipo1);
    const msg = await canal.send({ embeds: [new (require("discord.js")).MessageEmbed()
    .setAuthor("📫 Ticket")
    .setColor(configT.ticket.embed.cor)
    .setDescription(`
    Olá <@${button.user.id}>, conte-nos de que você precisa e em alguns instantes alguém da equipe entrará em contato com você.
    
    Clique no <a:naoo:859777462615539712> para fechar o ticket.`)], components: [row], content: "<@"+button.user.id+">"})
                  const newP = await Ticket.create({
                    authorId: button.user.id,
                    channelId: canal.id,
                    guildId: button.guild.id,
                    resolved: false,
                    closeMessageId: msg.id
                })
               
                  
    let tipos = ""
        for(let i = 0; i < configT.ticket.tipos.length; i++) {
            tipos += `${configT.ticket.tipos[i].emoji.fullName} - ${configT.ticket.tipos[i].nome}\n`
        }
     let valor = ""
    
     if(configT.ticket.embed.site !== "nenhum") {
        valor += "<:mineplaneta:855440184014012427> [Links]("+configT.ticket.embed.site+")\n"
    }
    if(configT.ticket.embed.instagram !== "nenhum") {
        valor += "<:ping:788215814385303592> [Status]("+configT.ticket.embed.instagram+")\n"
    }
    if(configT.ticket.embed.tutoriais !== "nenhum") {
        valor += "🌎 [Tutoriais]("+configT.ticket.embed.tutoriais+")\n"
    }
    
    let embed = new (require("discord.js")).MessageEmbed()
    .setAuthor("📫 Central de Atendimento")
    .setDescription(`
        Olá, seja bem-vindo a central de atendimento da ${configT.ticket.embed.hostName}.
        Para iniciar seu atendimento, reaja no ícone abaixo correspondente ao departamento. Seu atendimento será realizado por meio de um canal privado com a equipe.`)
    .addField("**Departamentos:**", `
    ${tipos}
    `, true)
    .addField("**Tickets:**", `
        📨 Abertos: ${await Ticket.findAndCountAll({where: {
            resolved: false
        }}).then(value => { return value.count } )}
        📫 Totais: ${await Ticket.findAndCountAll().then((value) => { return value.count })}
    
        ${valor}
        `, true)
    .addField(configT.ticket.embed.horario.title, configT.ticket.embed.horario.fim, true)
    
    .setColor(configT.ticket.embed.cor).setTimestamp()
    .setFooter("Desenvolvido por RedeTower")
        if(configT.ticket.embed.isActive) {
            if(configT.ticket.embed.isThumbnail) {
                embed.setThumbnail(configT.ticket.embed.image)
            } else {
                embed.setImage(configT.ticket.embed.image)
            }
        } 
            button.message.edit(embed)
            
        }
        }
                
                
    }
    if(button.isButton()) {

        if(button.customId === "fechartickett") {
            await button.deferReply({
                ephemeral: true
            })
            const findT = await Ticket.findOne({where: {
                 resolved: false,
                 closeMessageId: button.message.id
             }})
             if(findT) {
                 findT.update({
                     resolved: true
                 })
                 await button.channel.messages.fetch().then(msg22 => {
                     msg22.sort()
                     var logStream = fs.createWriteStream('./src/temp/ticket_'+ client.users.cache.get(findT.authorId).id+'.txt', {flags: 'w'});
                     for (let [key, value, embeds] of msg22) {
                       var hour = "",
                            minutes = "",
                           seconds = ""
                       const date = new Date(value.createdTimestamp);
                         if(date.getDay() <= 9) { day = "0"+date.getDay() } else { day = date.getDay() }
                         if(date.getMonth() <= 9) { month = "0"+date.getMonth() } else { month = date.getMonth() }
                         if(date.getHours() <= 9) { hour = "0"+date.getMonth() } else { your = date.getMonth() }
                         if(date.getMinutes() <= 9) { minutes = "0"+date.getMinutes() } else { minutes = date.getMinutes() }
                         
                         if(date.getSeconds() <= 9) { seconds = "0"+date.getSeconds() } else { seconds = date.getSeconds() }
                         let dateString = `${day}/${month}/${date.getFullYear()} ${hour}:${minutes}:${seconds}`;
             
             logStream.write(`${value.author.tag} - ${dateString}\nMensagem: ${value.content}\n`)
                     
                   }
                   logStream.end("FIM!");
                    })
                   
                    
                     button.editReply("Finalizando ticket em 5 segundos.").then(m2 => {
                       setTimeout(async () => {
                         const PedindoNota = new Discord.MessageEmbed()
                         .setAuthor("📫 Central de Atendimento")
                         .setDescription(`Olá <@${button.user.id}>, estamos entrando em contato com você para saber como foi o atendimento no seu ticket.\n
                         1º Etapa (1/2): Nota :star:
                         :white_small_square: Digite uma nota de 1 á 5.
                         :arrow_right_hook: Sendo 1 ruim e 5 ótimo.`)
                         .setFooter("Desenvolvido por KoddyDev")
                         .setColor(configT.ticket.embed.cor)
                         let dm = await client.users.cache.get(findT.authorId).createDM()
                         client.users.cache.get(findT.authorId).send(PedindoNota)
                         button.message.channel.delete()
                                                 let path = './src/temp/ticket_'+ client.users.cache.get(findT.authorId).id+'.txt'
                        await client.channels.cache.get(configT.ids.channels.logs).send("O ticket de " + client.users.cache.get(findT.authorId).id+ " foi fechado por " + button.user.tag,{
                          files: ['./src/temp/ticket_'+ client.users.cache.get(findT.authorId).id+'.txt']
                        })
                         let c1 =  dm.createMessageCollector(x => x.author.id == button.user.id, { time: 60000 * 20,max:1})
                         .on('collect', c => {
                             
                            const nota = c.content
                             if(isNaN(parseInt(nota)) || !isNaN(parseInt(nota)) && nota > 5 || isNaN(!parseInt(nota)) && nota < 1) return client.users.cache.get(findT.authorId).send("Cancelad!") && c1; 
                             
                             const PedindoComentario = new Discord.MessageEmbed()
                             .setTitle("📫 Central de Atendimento")
                             .setDescription(`
                             Sua nota para nosso atendimento foi **__${nota}__**, agora vamos para a última etapa.\n
 2º Etapa (2/2): Comentário :book:
 :white_small_square: Nessa parte gostaríamos de te escutar, nos diga quem te atendeu e como foi sua experiência no atendimento para que possamos cada vez mais aprimorar nossos serviços.`)
 .setColor(configT.ticket.embed.cor)
 
 button.user.send(PedindoComentario)
 let c2 =  dm.createMessageCollector(x => x.author.id == client.users.cache.get(findT.authorId).id, { time: 60000 * 20,max:1})
                             .on('collect', async c => {
                                 const comentario = c.content
                                 const findUser = await Nota .findOne({
                                     where: {
                                         authorId: client.users.cache.get(findT.authorId).id
                                     }
                                 })
                                     
                                 
                                 if(findUser) {
                                     findUser.update({
                                         nota,
                                         comentario
                                     }) 
                                                                 } else {
                                         await Notas.create({
                                             authorId: client.users.cache.get(findT.authorId).id,
                                             nota,
                                             comentario
                                         }) 
                                     }
                                  var total = 0
                                             const findA = await Notas.findAll()
                                             var valor = 0
                                             findA.map(f => {
                                                 valor += f.dataValues.nota
                                                 total++
                                             })
 
                                             findA.map(f => {
                                                 return `
                                                 Usuario: <@${client.users.cache.get(f.authorId).id}>
                                                 Comentário: ${f.comentario}
                                                 Nota: ${f.nota} :star: \`${moment(new Date()).format('DD [de] MMMM [de] YYYY[,] [às] H [horas] [e] M [minutos]')}\`
                                                 `
                                             })
                                             const notaDvidia = ( valor * 5 / findA.length)
                                     
 let embedAvaliacoes = new Discord.MessageEmbed()
 .setAuthor("📫 Avaliações de atendimento")
 .setDescription(`
 Estou listando abaixo uma média de 1 á 5 sobre o atendimento da hospedagem de acordo com a avaliação dos nossos clientes.
 
 > Média de atendimento: \`${notaDvidia.toFixed(2)}\` ⭐
 > Total de avaliações: \`${total}\` 🏅
 📖 **Últimos três comentários**:
 
 ${f2()}`)
 await client.channels.cache.get("867600749604110366").messages.fetch().then(msg223 => {
                     msg223.sort()
         msg223.first().edit(embedAvaliacoes)
 })
 
                                 let embedEditada = new Discord.MessageEmbed()
 
 .setAuthor("📫 Comentários de Atendimento")
 .setDescription(`
 Cliente: <@${client.users.cache.get(findT.authorId).id}>
 Comentário: ${comentario}
 Nota: ${nota} :star: \`${moment(new Date()).format('DD [de] MMMM [de] YYYY[,] [às] H [horas] [e] M [minutos]')}\``)
 .setFooter("Desenvolvido por KoddyDev")
                                 .setColor(configT.ticket.embed.cor)
     
 
         
     
                                 client.channels.cache.get("868282241145507880").send(embedEditada)
                                     client.users.cache.get(findT.authorId).send({ embed: new MessageEmbed()
                                     .setAuthor(" Central de atendimento")
                                     .setDescription(`
                                     Tudo certo <@${findT.authorId}>, registramos sua avaliação.
                                     
                                     :bookmark: Resumo da sua avaliação:
                                     
                                     Fechado por: <@${button.user.id}>
                                     Avaliado por: <@${findT.authorId}>
                                     Nota: ${nota} :star:
                                     
                                     Seu comentário:
                                     ${comentario} `).setColor(configT.ticket.embed.cor), files: ['./src/temp/ticket_'+ client.users.cache.get(findT.authorId).id+'.txt']})
                                 })
                     })
                 })
                     }, 5000)
                 
     
             } else {
                 return await button.editReply("Canal invalido D:")
             }
 
     }
     if(button.customId === "captcha") {
        await button.deferReply({
            ephemeral: true
        })
         button.editReply("Cargo atribuido com sucesso")
         if(!button.member.roles.cache.has(config.ids.roles.membro)) { button.member.roles.add(config.ids.roles.membro); }
         if(!button.member.roles.cache.has("824123742199873558")) { button.member.roles.add("824123742199873558") };
         if(!button.member.roles.cache.has("824126870895329292")) { button.member.roles.add("824126870895329292") };

     }
    }
if (button.isCommand()) {
    await button.deferReply({ephemeral: false}).catch((e) => {
      console.log(e);
    });
    const cmd = client.slashCommands.get(button.commandName);
    if (!cmd) return;
    
    const args = [];
    button.options.data.map((x) => {
      args.push({
        label: x.name,
        value: x.value
      });
    });
    if(cmd.needOwnerPermission) {
      if(button.user.id === "862860827584888853" || button.user.id === "273608088643436545") return cmd.run(client, button, args)
      return button.editReply("Apenas o Criador uVini__#7127 ou o Dev Plugin Soequedi#3055 pode utilizar este comando.")
    } else {
      cmd.run(client, button, args)
    }
    
}
})


 client.login("ODc4ODI0ODQ2MTAzMDQ0MTQ3.YSGzaw.GS4OHe8idbvWh_Lp0oVu29uWYbw")
