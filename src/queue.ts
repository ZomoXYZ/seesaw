// in charge of managing the queue, and stores related data to each song
//  i.e. who requested it, how it was requested (file/link/etc), song duration, metadata found
// this is also where youtube-dl will be called as needed

import { GuildMember } from "discord.js";

type availableApis = "apple"|"soundcloud"|"spotify"|"youtube"; //APIs that will be supported to be able to convert links to metadata (song/album/artist)

type audio = {
    requester: GuildMember,
    request: {
        time: Date,
        hidden: true //difference
    }|{
        time: Date,
        hidden: false, //difference
        link: string,
        source: availableApis|"file"|"link" //file: cdn.discord link, link: any other link that is able to be resolved safely as a file
    },
    meta?: {
        song?: string,
        album?: string,
        artist?: string,
        duration?: number
    },
    localFile?: {//TODO this will be required of all `audio` when youtube-dl is implemented
        isloaded: boolean,
        file: string
    }
};

/* queue index input

index   file 
 6       song10
 5       song9
 4       song8
 3       song7
 2       song6
 1       song5
 0       song4
-1       song3
-2       song2
-3       song1
-4       song0

*/

export default class audioQueue {

    private queue: audio[] = [];
    private current: number = 0;
    private files: null = null; // array of data associated with youtube-dl, "mapped" by their position in this.queue (an array)

    private validIndex = (index: number) => index >= -this.current && index < this.queue.length - this.current;

    //this.current controls
    public next() {
        if (this.current < this.queue.length - 1)
            this.current++;
    }

    public back() {
        if (this.current > 0)
            this.current--;
    }

    /**
     * @param index index to move to, negative numbers go into the history, 0 is the current song
     */
    public seek(index: number) {
        if (this.validIndex(index))
            this.current+= index;
    }

    //this.queue controls
    public now(): audio {
        return this.queue[this.current];
    }

    public getQueue(): audio[] {
        return this.queue.slice(this.current);
    }

    public getHistory(): audio[] {
        return this.queue.slice(0, this.current);
    }

    public addQueue(audio: audio, index?: number) {
        if (index !== undefined && this.validIndex(index))
            this.queue.splice(this.current+index, 0, audio);
        else
            this.queue.push(audio);
    }

    public removeQueue(index: number) {
        if (this.validIndex(index))
            this.queue.splice(this.current+index, 1);
    }

}