const dotenv = require("dotenv").config();
const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const bot = new Discord.Client({ disableEveryone: true });
const prefix = botconfig.prefix;

/** Helpful functions*/
const getRole = (role, guild) => guild.roles.cache.find(r => r.name === role);
const getChannel = (channel, guild) =>
  guild.channels.cache.find(c => c.name === channel);

/** Main commands*/
let cmds = {};

cmds.ping = msg => {
  msg.reply("Pong!");
};

cmds.profile = (msg, args) => {
  let user;
  let member;
  if (!args || args.length == 0) {
    user = msg.author;
    member = msg.member;
  } else if (Discord.MessageMentions.USERS_PATTERN.test(args[0])) {
    member = msg.mentions.members.first();
    user = member.user;
  } else {
    return msg.reply("mention someone or none");
  }

  let displayName = member.nickname || user.username;
  let roles = "";

  member.roles.cache
    .filter(role => role.name !== "@everyone")
    .each(role => {
      roles += role.toString() + "\n";
    });

  let embed = new Discord.MessageEmbed()
    .setTitle(`${displayName}'s Profile`)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`${member} [${displayName}]`)
    .addField("Roles", roles.trim() == "" ? "No roles" : roles)
    .setColor(0xccff00);

  getChannel(msg.channel.name, msg.guild).send(embed);
};

cmds.help = msg => {
  let embed = new Discord.MessageEmbed()
    .setTitle("Help :speech_balloon:")
    .setDescription("Commands : \n\n`r!help` - Shows This Embed Message\n`r!profile <player_name>` - Shows The Roles of The Person and Shows Their Profile Picture\n\n**Mod Commands**\n\n`r!kick <player_name>` - Kicks Person\n`r!ban <player_name>` - Bans Person\n`r!nickname <player_name> <nickname>` - Changes The Person's Nickname.")
    .setColor(0x00ff00);
  
  getChannel(msg.channel.name, msg.guild).send(embed);
};

cmds.nickname = (msg, args) => {
  console.log(args);

  if (Discord.MessageMentions.USERS_PATTERN.test(args[0])) {
    if (msg.member.hasPermission(Discord.Permissions.FLAGS.CHANGE_NICKNAME)) {
      let member = msg.mentions.members.first();
      let nick = args.splice(1).join(" ")
      member
        .setNickname(nick)
        .then(mem => {
          msg.reply(`Changed their nickname to ${nick}`)
        })
        .catch(err => {
          msg.reply("I Can't change nicknames\nReason: `" + err.message + "`");
        });
    } else {
      msg.reply("u have no perms wat a joke");
    }
  } else {
    let nick = args.splice(0).join(" ")
    msg.member
      .setNickname(nick)
      .then(mem => {
        msg.reply(`Changed your nickname to ${nick}`);
      })
      .catch(err => {
        msg.reply("I Can't change nicknames\nReason: `" + err.message + "`");
      });
  }
};

//uff

cmds.kick = msg => {
  if (msg.member.hasPermission(Discord.Permissions.FLAGS.KICK_MEMBERS)) {
    msg.reply("Ok senpai");
  } else {
    msg.reply("Have no permissions !@#@$!");
  }
};

cmds.mute = (msg, args) => {
  if (msg.member.hasPermission(Discord.Permissions.FLAGS.MUTE_MEMBERS)) {
    msg.reply("OKE")
  } else {
    msg.reply("NOOOOOOOOOOO")
  }
};

cmds.ban = (message, args) => {
  if (!message.guild) return;

  const user = message.mentions.users.first();
  if (user) {
    const member = message.guild.member(user);
    if (member) {
      member
        .ban({
          reason: "The admins decided to ban the member"
        })
        .then(() => {
          message.reply(`Successfully banned : ${user.tag}`);
        })
        .catch(err => {
          message.reply(
            "I was unable to ban the member\nReason : `Missing Permissions`"
          );
          console.error(err);
        });
    } else {
      message.reply(
        "Unable to ban the member\nReason : `That user isn't in this guild!`"
      );
    }
  } else {
    message.reply(
      "Unable to ban the member\nReason : `You didn't mention the user to kick!`"
    );
  }
};

/** Discord events */

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setPresence({activity: {name: "Prefix : r!help"}, status: "online"})
});

bot.on("message", msg => {
  if (msg.author.bot) return;
  if (msg.channel.type == "dm") return;

  if (msg.content.startsWith(prefix)) {
    let cmdData = msg.content
      .substring(prefix.length)
      .replace(/\s+/g, " ")
      .split(" ");
    let cmdName = cmdData[0];
    if (cmds[cmdName]) {
      cmds[cmdName](msg, cmdData.splice(1));
    }
  }
});

// Welcome and Bye Logs
bot.on("guildMemberAdd", member => {
  getChannel("greetings-and-farewell", member.guild).send(
    "**" + member.user.username + "**, has joined the server!"
  );
});

bot.on("guildMemberRemove", member => {
  let roles = ""
  member.roles.cache
    .filter(role => role.name !== "@everyone")
    .each(role => {
      roles += role.toString() + "\n";
  let embed = new Discord.MessageEmbed()
    .setTitle("Goodbye," + member.use.username + "!")
    .setDescription(member.user.username + ", has left the server\nRoles : " + roles.trim())
    .setColor(0x00ff00);
  getChannel("greetings-and-farewell", member.guild).send(embed)
  }
});

// Deleted Logs
bot.on("messageDelete", async message => {
  if (message.author.bot) return;
  let channel = getChannel("deleted-logs", message.guild);
  if (channel) {
    let loggingEmbed = new Discord.MessageEmbed()
      .setTitle("A New Deleted Message!")
      .setColor("0x00ff00")
      .setThumbnail(message.author.displayAvatarURL())
      .setDescription(`**Message : ** ${message.content}`)
      .addField("Deleted By : ", message.author.tag, true) // remove those true s if u want
      .addField("Deleted In : ", message.channel, true)
      .setFooter(`Deleted At : ${message.createdAt}`);
    channel.send(loggingEmbed);
  }
});

// Edited logs
bot.on("messageUpdate", async (oldMsg, newMsg) => {
  if (newMsg.author.bot) return;
  let channel = getChannel("edited-logs", newMsg.guild);
  if (channel) {
    let loggingEmbed = new Discord.MessageEmbed()
      .setTitle("A New Editted Message!")
      .setColor("0x00ff00")
      .setThumbnail(newMsg.author.displayAvatarURL())
      .setDescription(
        `
        **Before : **${oldMsg.content}
        **After : **${newMsg.content}
      `
      )
      .addField("Author : ", newMsg.author.tag, true)
      .addField("Channel : ", newMsg.channel, true)
      .setFooter(`Editted At : ${newMsg.createdAt}`);

    channel.send(loggingEmbed);
  }
});

bot.login(process.env.BOT_TOKEN);
