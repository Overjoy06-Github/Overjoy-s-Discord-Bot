const dotenv = require("dotenv").config()
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const bot = new Discord.Client({disableEveryone: true});
const prefix = botconfig.prefix

/** Helpful functions*/
const getRole = (role, guild) => guild.roles.cache.find(r => r.name === role);
const getChannel = (channel, guild) => guild.channels.cache.find(c => c.name === channel);

/** Main commands*/
let commands = {

 "ping": (msg) => {
   msg.reply("Pong!")
 },
  
  "profile": (msg, args) => {
    let user
    let member
    if (!args || args.length == 0) {
      user = msg.author
      member = msg.member
    } else if (Discord.MessageMentions.USERS_PATTERN.test(args[0])) {
      member = msg.mentions.members.first()
      user = member.user
    } else { 
      return msg.reply("mention someone or none")
    }
    
    let displayName = member.nickname || user.username
    let roles = ""
    
    member.roles.cache.filter(role => role.name !== "@everyone").each((role) => {
      roles += role.toString() + "\n"
    })
        
    let embed = new Discord.MessageEmbed()
      .setTitle(`${displayName}'s Profile`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`${member} [${displayName}]`)
      .addField("Roles", roles.trim() == "" ? "No roles" : roles)
      .setColor(0xccff00)
    
    getChannel(msg.channel.name, msg.guild).send(embed)
    
  },
    
  "nickname": (msg) => {
   
  },
  "kick": (msg) => { 
    if (msg.member.hasPermission(Discord.Permissions.FLAGS.KICK_MEMBERS)) {
       msg.reply("Ok senpai")  
    } else {
      msg.reply("Have no permissions !@#@$!")
    }
  },
  
   "mute": (msg) => {
    // r!mute 1w1d2m3s
  },
  
}


/** Discord events */


bot.on("ready", async () => {
 console.log(`${bot.user.username} is online!`);
});


bot.on("message", msg => {
 if(msg.author.bot) return;
 if(msg.channel.type == "dm") return;

 if (msg.content.startsWith(prefix)) {
   let cmdData = msg.content.substring(prefix.length).replace(/\s+/g, " ").split(" ")
   let cmdName = cmdData[0]
   if (commands[cmdName]) {
     commands[cmdName](msg, cmdData.splice(1))
   } 
 }
});


// Welcome and Bye Logs
bot.on('guildMemberAdd', member => {
   getChannel("greetings-and-farewell", member.guild).send('**' + member.user.username + "**, has joined the server!");
});

bot.on('guildMemberRemove', member => {
    getChannel("greetings-and-farewell", member.guild).send("**" + member.user.username + "**, has left the server!");
});  

// Deleted Logs
bot.on("messageDelete", async message => {
  let loggingEmbed = new Discord.MessageEmbed()
    .setTitle("A New Deleted Message!")
    .setColor("0x00ff00")
    .setThumbnail(message.author.displayAvatarURL())
    .setDescription(`**Message : ** ${message.content}`) 
    .addField("Deleted By : ", message.author.tag, true) // remove those true s if u want
    .addField("Deleted In : ", message.channel, true) 
    .setFooter(`Deleted At : ${message.createdAt}`); 
  
  getChannel("deleted-logs", message.guild).send(loggingEmbed);
  
});

// Edited logs
bot.on("messageUpdate", async (oldMsg, newMsg) => {
  if (newMsg.author.id === bot.user.id) return

  let loggingEmbed = new Discord.MessageEmbed()
    .setTitle("A New Editted Message!")
    .setColor("0x00ff00")
    .setThumbnail(newMsg.author.displayAvatarURL())
    .setDescription(`
      **Before : **${oldMsg.content}
      **After : **${newMsg.content}
    `) 
    .addField("Author : ", newMsg.author.tag, true) // remove those true s if u want
    .addField("Channel : ", newMsg.channel, true) 
    .setFooter(`Editted At : ${newMsg.createdAt}`); 

  getChannel("edited-logs", newMsg.guild).send(loggingEmbed);
  
});    // lol   

bot.login(process.env.BOT_TOKEN);
