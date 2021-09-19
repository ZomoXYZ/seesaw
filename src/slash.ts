import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandInteraction, GuildMember, Interaction } from "discord.js";

const builder = {
    audio: (option: any): any => { //TODO make this not "any"
        option
            .setName('audio')
            .setDescription('a link to an audio file')
            .setRequired(false)
            
        return option;
    }
};

/* COMMANDS

/play [audio] [int:position]
  if audio is given
    add to either end of queue or the given position
  otherwise resume
/playnext <audio>
  add to begining of queue
/pause
/stop
  pause and end current song

/queue
  see queue
/remove <int:position>
/clear
  clear queue

/leave
  leave vc
*/

const commands = [

    //play ======
    new SlashCommandBuilder()
        .setName('roles')
        .setDescription('either resume or add a song to the queue')
        .addStringOption(builder.audio)
        .addIntegerOption((option) => {
            option
                .setName('position')
                .setDescription('where the file will be added (default end of queue)')
                .setRequired(false)
            
            return option;
        })
        .toJSON(),

    //playnext ======
    new SlashCommandBuilder()
        .setName('playnext')
        .setDescription('add a song up next')
        .addStringOption(builder.audio)
        .toJSON(),

    //pause ======
    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the music')
        .toJSON(),

    //stop ======
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop the music')
        .toJSON(),

    //queue ======
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('see the queue')
        .toJSON(),

    //remove ======
    new SlashCommandBuilder()
        .setName('remove')
        .setDescription('see the queue')
        .addIntegerOption((option) => {
            option
                .setName('position')
                .setDescription('which song to remove')
                .setRequired(true)
            
            return option;
        })
        .toJSON(),

    //clear ======
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('clear the queue')
        .toJSON(),


    //leave ======
    new SlashCommandBuilder()
        .setName('leave')
        .setDescription('leave the voice channel')
        .toJSON()

];

const commands_js: { [key: string]: (interaction: CommandInteraction) => void } = {
    play: (interaction: CommandInteraction) => {

        if (interaction.member instanceof GuildMember) {

            let vc = interaction.member.voice.channel;

            if (vc) {
                
                if (vc.joinable) {

                    interaction.reply({
                        content: `i'll join later :)`,
                        ephemeral: true
                    })

                    //TODO tell queue file to subscribe to a new voice channel

                } else
                    interaction.reply({
                        content: `voice channel **#${vc.name}** is not able to be joined`,
                        ephemeral: true
                    })

            } else
                interaction.reply({
                    content: `connect to a voice channel first`,
                    ephemeral: true
                })

        }

    }
}

export async function registerCommands(ClientId: string, GuildId: string, token: string) {

    const rest = new REST({ version: '9' }).setToken(token);

    try {

        await rest.put(
            Routes.applicationGuildCommands(ClientId, GuildId),
            { body: commands },
        );

    } catch (error) {
        console.error(error);
    }

}

export function handleInteraction(interaction: Interaction) {

    if (interaction.inGuild()) {

        /*if (interaction.isButton())
            handleButton(interaction as ButtonInteraction);

        else*/ if (interaction.isCommand())
            handleCommand(interaction as CommandInteraction);

        /*else if (interaction.isContextMenu())
            handleContextMenu(interaction as ContextMenuInteraction);

        else if (interaction.isMessageComponent())
            handleMessageComponent(interaction as MessageComponentInteraction);

        else if (interaction.isSelectMenu())
            handleSelect(interaction as SelectMenuInteraction);*/

    }

}

//on slash command
async function handleCommand(interaction: CommandInteraction) {

    if (interaction.inGuild()) {
        if (interaction.commandName in commands_js)
            commands_js[interaction.commandName](interaction);
        else
            interaction.reply({
                content: 'hi :3',
                ephemeral: false
            });
    }

}

