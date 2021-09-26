// in charge of managing the queue, and stores related data to each song
//  i.e. who requested it, how it was requested (file/link/etc), song duration, metadata found
// this is also where youtube-dl will be called as needed

import { GuildMember } from "discord.js";

type availableApis = "apple"|"soundcloud"|"spotify"|"youtube"; //APIs that will be supported to be able to convert links to metadata (song/album/artist)

type audio = {
    requester: GuildMember,
    request: {
        time: Date,
        link: string,
        source: availableApis|"file"|"link" //file: cdn.discord link, link: any other link that is able to be resolved safely as a file
    },
    meta?: {
        song?: string,
        album?: string,
        artist?: string,
        duration?: number
    }
}
export default class audioQueue {

    private queue: audio[] = [];

    constructor() {
    }

}