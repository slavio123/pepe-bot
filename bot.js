const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const prefix = '$';
const guildModel = require('./models/guild');
const ticketModel = require('./models/ticket');
const fetch = require('discord-fetch-all');
const ticket = require('./models/ticket');
const createTicket = require('./cmds/createTicket')
const mongoose = require('mongoose');
const fs = require('fs');
const urlMongo = `mongodb+srv://Turki:dDeDNnF99WyNkkeo@cluster0.mqux4.mongodb.net/Turki?retryWrites=true&w=majority`;//Mongodb
client.on('ready', () => {
console.log(`Online`);
});

mongoose.connect(urlMongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
}).then(console.log(`Pepe is Ready`));

client.on('message', async message => {
    if(message.content.startsWith(prefix + 'tr-set')) {
        let tr_message = message.content.split(' ');
        message.delete();
        const msg = await message.channel.send({ embed: {
            title: tr_message[1],
            color: "#00DE18",
            description: "React with 📧 to create a ticket."
        }}
    );
    msg.react('📧');
    }
});

client.on('messageReactionAdd', async(reaction, user) => {
    const { message } = reaction;
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();   
    if(user.bot) return;
     var GuildSettings = await guildModel.findOne({
        guildID: message.guild.id
    });

    if (!GuildSettings) {
        GuildSettings = new guildModel({
            guildID: message.guild.id,
        });

        await GuildSettings.save();
    }

    const TicketSettings = await ticketModel.findOne({
        guildID: message.guild.id,
        userID: user.id
    });

    if (reaction.emoji.name == '📧') {
        if (TicketSettings) {
            const channel = message.guild
                .channels.cache.get(TicketSettings.ticketID);
            if (!channel) {
                await TicketSettings.deleteOne();
                createTicket(message, user, GuildSettings);
            }
        }else {
            createTicket(message, user, GuildSettings);
        }
        reaction.users.remove(user)
        

    } else if (message.id == (TicketSettings ? TicketSettings.msgID : null)) {
        if (reaction.emoji.name == '🔒') {
            if (!TicketSettings.ticketStatus) {
                message.channel.send({ embed: {
                        color: "#00DE18",
                        description: `Ticket closed by ${user}`
                    }
                });
                reaction.users.remove(user)

               

                const msg = await message.channel.send({ embed: {
                        color: "RED",
                        description: "📰 Ticket Transcript \n🔓 Reopen Ticket \n⛔ Close Ticket"
                    }}
                );

                await msg.react('📰');
                await msg.react('🔓');
                await msg.react('⛔');

                TicketSettings.msgPannelID = msg.id;
                TicketSettings.ticketStatus = true;

                await TicketSettings.save();
            }
        }
    } else if (message.id == (TicketSettings ? TicketSettings.msgPannelID : null)) {
        if (reaction.emoji.name == '📰') {
            const msgsArray = await fetch.messages(message.channel, {
                reverseArray: true
            });
            reaction.users.remove(user)
            const content = msgsArray.map(m => `${m.author.tag} - ${m.embeds.length ? m.embeds[0].description : m.content}`);

            fs.writeFileSync('transcript.txt', content.join('\n'));

            message.channel.send(new Discord.MessageAttachment('transcript.txt', 'transcript.txt'));
        } else if (reaction.emoji.name == '🔓') {
            message.channel.updateOverwrite(
                client.users.cache.get(TicketSettings.userID), {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true
                }
            );
            const msg = await message.channel
                .messages.fetch(TicketSettings.msgPannelID);

            msg.delete();

            TicketSettings.msgPannelID = null;
            TicketSettings.ticketStatus = false;

            await TicketSettings.save();

            message.channel.send({ embed: {
                    color: "#00DE18",
                    description: `Ticket opened by ${user}`
                }
            });
        } else if (reaction.emoji.name == '⛔') {
            message.channel.delete();
            await TicketSettings.deleteOne();
        }
    
}
})

client.on("message" , mecodes => {
if (mecodes.content.startsWith(prefix + "rename")) {
    var nwame = mecodes.content.split(" ").slice(1);
    if (!mecodes.channel.name.startsWith(`ticket-`))
      return mecodes.channel.send(
        `**THIS IS NOT TICKET**`
      );
    mecodes.channel.setName("ticket" + " " + nwame);
  }
});

client.on('message', async message => {
if(message.content.startsWith(prefix + 'role')) {
if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(`>>> \`\`\`You Don't have the permission : \`\`\` \n\n **\`MANAGE_ROLES\`**`);
var user = message.mentions.members.first();
if(!user) return message.channel.send(`**Usage: ${prefix}role \`<@user> <role>\`**`);
var role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name.startsWith (message.content.split(" ").slice(2).join(" ")))
if(!role) return message.channel.send(`**Can't found this role**`);
if(user.roles.cache.get(role.id)){
user.roles.remove(role).then(() =>{
return message.channel.send(`✅ - **Successfully Removed Role From ${user.user.username}, \`-${role.name}\`**`);    
})
} else {
user.roles.add(role).then(() =>{
return message.channel.send(`✅ - **Successfully Added Role To ${user.user.username}, \`+${role.name}\`**`);    
})
}
}
});

 client.on("message",message => {
 var prefix = '$';//البريفكس 
  var Me = message.content.split(" ").slice(1).join(" ");
if(message.content.startsWith(prefix + "sug") || message.content.startsWith(prefix + "sug")) {  
message.delete()
if(message.guild.id !== "751562235415101523")return;
  if (!Me)
  return message.channel.send(
    new Discord.MessageEmbed()
      .setColor("#00DE18")
      .setTitle("Some thing went wrong..")
      .setDescription("Please Type Your Suggetion")
  )
  let Membed = new Discord.MessageEmbed()
  .setColor("#00DE18")
.setDescription(`**Suggest :**\n\`\`\`${Me}\`\`\``)
.addField(`**From :**`,`<@${message.author.id}>`)
.setThumbnail(`https://cdn.discordapp.com/icons/751562235415101523/a_5a094e44f5fc614002f3ac557287855b.gif?size=1024`)
.addField(`**User id :**`,`\`\`\`${message.author.id}
\`\`\``)
 .setFooter(`Requested By ${message.author.username}`, message.author.avatarURL());
client.channels.cache.get('753356499862159451').send(Membed).then(async message => {
        await message.react("✅");
      await message.react("❌");
})}});


 
 client.on("message", message => {
  var args = message.content.split(" ");
  var command = args[0];
  var num = args[1];
  var tax = 5.29; 
  if (command == prefix + "tax") {
    let nume = new Discord.MessageEmbed()
      .setColor('RED')
      .setDescription(command + " <number>");
    if (!num) {
      return message.channel.send(nume);
    }
    var numerr = Math.floor(num);
    if (numerr < 0 || numerr == NaN || !numerr) {
      return message.reply("**The value must be correct.**");
    }
    var taxval = Math.floor(numerr * (tax / 100));
    var amount = Math.floor(numerr - taxval);
    var amountfinal = Math.floor(numerr + taxval);
    let taxemb = new Discord.MessageEmbed()
      .setTitle("Pepe Tax")
      .setColor('#00DE18')
      .setThumbnail(`https://cdn.discordapp.com/icons/751562235415101523/a_5a094e44f5fc614002f3ac557287855b.gif?size=1024`)
      .setDescription(`Principal amount: **${numerr}**\nTax: **${tax}%**\nTax amount: **${taxval}**\nAmount with tax: **${amount}**\nAmount to be paid: **${amountfinal}**`)
      .setTimestamp()
      .setFooter(`Requested By ${message.author.username}`, message.author.avatarURL());
    message.channel.send(taxemb);
  }
});

client.on("message", async message =>{
  if(message.author.bot) return
  let args = message.content.split(" ");
let lineee = "https://images-ext-2.discordapp.net/external/XbeGBiIB_PGrlxQHIjhydP0Ntph7IJRgoKogFoBDQzk/https/images-ext-2.discordapp.net/external/_0reThWOiOMr3fHAQ4JcQAl4pllDsqFXSRwEW06hAZI/https/media.discordapp.net/attachments/751431174097862737/756179227967225917/unknown.png"
  if(args[0] == "خط") {
    message.delete({timeout:100})
    message.channel.send({files: [lineee]})
  }
  if(message.channel.id == message.guild.channels.cache.find(c => c.id == "753356499862159451")){
message.channel.send({files: [lineee]})  } 
})

client.on('message', message => {
  const {MessageEmbed} = require('discord.js')
  if(message.content.toLowerCase().startsWith("$avatar") || message.content.toLowerCase().startsWith("$ava") || message.content.toLowerCase().startsWith("avatar") || message.content.toLowerCase().startsWith("$a")){
   var user = message.mentions.users.first() || message.author
   if(!user)return('**❌ Eror**')
 let abdel = new MessageEmbed()
 .setTitle('Pepe Avatar')
 .setURL(user.displayAvatarURL({size:2048,dynamic: true}))
 .setColor('#00DE18')
 .setImage(user.avatarURL({size:512,dynamic: true}))
 .setFooter(`Requested By ${message.author.tag}`,message.author.displayAvatarURL({dynamic: true}))
 .setAuthor(user.tag,user.displayAvatarURL({dynamic: true}))
message.channel.send(abdel).then(m => { console.log('Successfully Avatar Sent To The Requester ✅')
 }).catch(() => {
 return console.log('❌ Something Went Wrong')
 })
}
})






 client.on("message", (message) => {
            if (message.channel.type === "dm") {
        if (message.author.id === client.user.id) return;
        let yumz = new Discord.MessageEmbed()
                    .setTimestamp()
                    .setTitle("Message To The Bot")
                    .addField(`Sent By :`, `<@${message.author.id}>`)
                    .setColor("#00DE18")
                    .setThumbnail(`https://cdn.discordapp.com/icons/751562235415101523/a_5a094e44f5fc614002f3ac557287855b.gif?size=1024`)
                  .setFooter(`Pepe Bot`,`https://cdn.discordapp.com/icons/751562235415101523/a_5a094e44f5fc614002f3ac557287855b.gif?size=1024`)
                    .addField(`Message: `, `\n\n\`\`\`${message.content}\`\`\``)
                client.channels.cache.get("752369906011472003").send(yumz)
            }
});

client.login('NzY0OTI0MDg3NDk5NjIwMzYy.X4NVEg.bOb5EOtORWEISKFSMM9FLZrb8D8');
