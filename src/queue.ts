// in charge of managing the queue, and stores related data to each song
//  i.e. who requested it, how it was requested (file/link/etc), song duration, metadata found
// this is also where youtube-dl will be called as needed

import { GuildMember } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { getDir } from './utils';
const youtubedl = require('youtube-dl-exec');

type audio = {
    requester: GuildMember,
    request: {
        time: Date,
        hidden: boolean,
        link: string
    },
    meta?: {
        song?: string,
        album?: string,
        artist?: string,
        duration?: number
    },
    localFile?: string
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

interface ytdlDataGeneral {
    id: string,
    title: string,
    url: string,
    ext: string,
    alt_title: string,
    display_id: string,
    uploader: string,
    license: string,
    creator: string,
    release_date: string,
    timestamp: number,
    upload_date: string,
    uploader_id: string,
    channel: string,
    channel_id: string,
    location: string,
    duration: number,
    view_count: number,
    like_count: number,
    dislike_count: number,
    repost_count: number,
    average_rating: number,
    comment_count: number,
    age_limit: number,
    is_live: boolean,
    start_time: number,
    end_time: number,
    format: string,
    format_id: string,
    format_note: string,
    width: number,
    height: number,
    resolution: string,
    tbr: number,
    abr: number,
    acodec: string,
    asr: number,
    vbr: number,
    fps: number,
    vcodec: string,
    container: string,
    filesize: number,
    filesize_approx: number,
    protocol: string,
    extractor: string,
    extractor_key: string,
    epoch: number,
    autonumber: number,
    playlist: string,
    playlist_index: number,
    playlist_id: string,
    playlist_title: string,
    playlist_uploader: string,
    playlist_uploader_id: string
};

interface ytdlDataChapter extends ytdlDataGeneral {
    chapter: string,
    chapter_number: number,
    chapter_id: string
};

interface ytdlDataEpisode extends ytdlDataGeneral {
    series: string,
    season: string,
    season_number: number,
    season_id: string,
    episode: string,
    episode_number: number,
    episode_id: string
};

interface ytdlDataSong extends ytdlDataGeneral {
    track: string,
    track_number: number,
    track_id: string,
    artist: string,
    genre: string,
    album: string,
    album_type: string,
    album_artist: string,
    disc_number: number,
    release_year: number
};

type ytdlDataAny = ytdlDataChapter & ytdlDataEpisode & ytdlDataSong;

type ytdlData = {
    type: 'other',
    data: ytdlDataAny
}|{
    type: 'chapter',
    data: ytdlDataChapter
}|{
    type: 'episode',
    data: ytdlDataEpisode
}|{
    type: 'song',
    data: ytdlDataSong
};

export default class audioQueue {

    private queue: audio[] = [];
    private current: number = 0;
    //private files: null = null; // array of data associated with youtube-dl, "mapped" by their position in this.queue (an array)

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

    public at(index: number): audio|null {
        if (this.validIndex(index))
            return this.queue[this.current+index];
        return null;
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

    private attachFile(index: number, filename: string) {
        if (this.validIndex(index))
            this.queue[this.current+index].localFile = filename;
    }

    //youtube-dl
    private async _ytdlInfo(link: string) {
        link = link.trim();

        let data: ytdlDataAny = await youtubedl(link, {
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            referer: 'https://github.com/ZomoXYZ/seesaw',//TODO settings file
            dumpSingleJson: true
        });

        let info: ytdlData;

        //verify all values exist
        if (data.chapter && data.chapter_number && data.chapter_id)
                info = {
                    type: 'chapter',
                    data: data
                };
        
        else if (data.series && data.season
            && data.season_number && data.season_id
            && data.episode && data.episode_number && data.episode_id)
                info = {
                    type: 'episode',
                    data: data
                };
        
        else if (data.track && data.track_number && data.track_id
            && data.artist && data.genre && data.album
            && data.album_type && data.album_artist
            && data.disc_number && data.release_year)
                info = {
                    type: 'song',
                    data: data
                };
        
        else
                info = {
                    type: 'other',
                    data: data
                };
            

        return info;

    }

    private async _genFilename() {
        let dir = getDir("tmpDownload");
        
        let fname: string;

        do {

            fname = '';
            for (let i = 0; i < 20; i++)
                fname += String.fromCharCode(Math.round(Math.random()*25)+65);

        } while (fs.existsSync(path.join(dir, fname+'.mp3')));

        return fname;
        
    }

    public _ytdlDown(link: string): [Promise<any>,string] {
        link = link.trim();

        let filename = this._genFilename();

        return [
            youtubedl(link, {
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                referer: 'https://github.com/ZomoXYZ/seesaw',//TODO settings file
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: '0',
                output: `${filename}.%(ext)s`
            }),
            filename+'.mp3'
        ];
        
    }

    public async ytdlInfo(index: number): Promise<ytdlData|null> {
        if (this.validIndex(index)) {
            let info = this.at(index);
            if (info)
                return await this._ytdlInfo(info.request.link);
        }

        return null;
    }

    public async ytdlDown(index: number): Promise<audio|null> {
        if (this.validIndex(index)) {
            let info = this.at(index);

            if (info) {
                let dlinfo = this._ytdlDown(info.request.link);

                this.attachFile(index, dlinfo[1]);

                return this.at(index);
            }

            return null;

        }

        return null;
    }
    
}