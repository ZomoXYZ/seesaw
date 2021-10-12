// in charge of slash commands (and all related data)
// ANY AND ALL DISCORD USER INTERACTION WILL EXIST EITHER WITHIN OR AS A CHILD OF THIS FILE

import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types';
import { CommandInteraction, GuildMember, Interaction, VoiceChannel } from "discord.js";
import audioQueue from "./queue";

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

const Queues: Map<string, audioQueue> = new Map();

async function joinVC(vc: VoiceChannel, interaction: CommandInteraction) {
    if (vc.joinable && vc instanceof VoiceChannel) {

        await interaction.deferReply({
            ephemeral: true
        });

        let queue = new audioQueue(vc);
        Queues.set(vc.id, queue);

        interaction.editReply({
            content: `i'll join later :)`
        });

        return queue;

    } else
        interaction.reply({
            content: `voice channel **#${vc.name}** is not able to be joined`,
            ephemeral: true
        });

    return null;
}

const commands = [

    //play ======
    new SlashCommandBuilder()
        .setName('play')
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
    play: async (interaction: CommandInteraction) => {

        if (interaction.member instanceof GuildMember) {

            let vc = interaction.member.voice.channel;

            if (vc && vc instanceof VoiceChannel) {
                
                let queue = await joinVC(vc, interaction);

                if (queue)  {
                    queue.addQueue({
                        requester: interaction.member,
                        request: {
                            time: new Date(interaction.createdTimestamp),
                            hidden: false,
                            link: 'https://www.youtube.com/watch?v=WSeNSzJ2-Jw'
                        },
                        status: "none"
                    });
                }

            } else
                interaction.reply({
                    content: `connect to a voice channel first`,
                    ephemeral: true
                });

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

