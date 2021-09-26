// general utils

import * as fs from 'fs';
import { validate } from 'jsonschema';

export type Settings = {
    api: {
        discordToken: string;
    }
    bot?: {
        maxFileDuration?: number
    }
};

export function fileExist(file: string): boolean {
    
    if (fs.existsSync(`./${file}`))
        return true;
    
    console.error(`Missing ${file}`);
    
    return false;

}

export function fileExistOrExit(file: string): void {
    
    let result = fileExist(file);

    if (!result)
        process.exit(1);

}


export function readFile(file: string): string|null {
    
    if (!fileExist(file))
        return null;

    return fs.readFileSync(file).toString();

}

export function readFileOrExit(file: string): string {
    
    let result = readFile(file);

    if (!result)
        process.exit(1);
    
    return result;

}


export function parseJSON<T extends {}>(string: string): T|null {
    
    try {
        return JSON.parse(string);
    } catch (e) {
        
        console.error(e);

        return null;

    }

}

export function parseJSONOrExit<T extends {}>(string: string): T {
    
    let result = parseJSON<T>(string);

    if (!result)
        process.exit(1);
    
    return result;

}


export function jsonSchema<T extends {}>(jsonfile: string, schemafile: string): T|null {

    let json = parseJSON<T>(readFile(jsonfile) || "null"),
        schema = parseJSON<T>(readFile(schemafile) || "null");
    
    if (json === null || schema === null)
        return null;

    if (validate(json, schema).errors.length > 0)
        return null;

    let jsonParse: T = json;
    
    return jsonParse;

}

export function jsonSchemaOrExit<T extends {}>(jsonfile: string, schemafile: string): T {
    
    let result = jsonSchema<T>(jsonfile, schemafile);

    if (!result)
        process.exit(1);
    
    return result;

}
