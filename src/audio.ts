// in charge of connecting to a discord voice channel and sending/processing audio
// is a class that will be instanciated with a voice channel
// all voice channel related commands will be here

// audioQueue stores the audio data and will take care of downloading audio, but discordAudio will actually play the file through discord

import { VoiceChannel } from "discord.js";
import audioQueue from "./queue";

export default class audio {

    private vc: VoiceChannel;
    private queue: audioQueue = new audioQueue();

    constructor(vc: VoiceChannel) {
        this.vc = vc;
    }

}