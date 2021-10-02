// in charge of connecting to a discord voice channel and sending/processing audio
// is a class that will be instanciated with a voice channel
// all voice channel related commands will be here

// audioQueue stores the audio data and will take care of downloading audio, but discordAudio will actually play the file through discord

import { AudioPlayer, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import * as path from 'path';
import { getDir } from './utils';

export default class audiodriver {

    private vc: VoiceChannel;
    public ready: boolean = false;

    private connection = () => getVoiceConnection(this.vc.guild.id);
    private player: AudioPlayer = createAudioPlayer();

    constructor(vc: VoiceChannel) {
        this.vc = vc;
    }

    //connection controls
    public join() {
        let connection = joinVoiceChannel({
            channelId: this.vc.id,
            guildId: this.vc.guild.id,
            adapterCreator: this.vc.guild.voiceAdapterCreator
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            this.ready = true;
            connection.subscribe(this.player);
        });
        connection.on(VoiceConnectionStatus.Destroyed, () => { this.ready = false; });
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
            }
        });

    }

    public leave() {
        this.connection()?.destroy();
    }

    //audio controls
    public load(filename: string) {
        this.player.play(createAudioResource(path.join(getDir('tmpDownload'), filename)));
    }

    public stop() {
        this.player.stop();
    }

    public pause() {
        this.player.pause();
    }

    public unpause() {
        this.player.unpause()
    }

    public seek() {
    }

    //link between downloaded files and vc

}