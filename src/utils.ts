import * as fs from 'fs';
import { validate } from 'jsonschema';

export function fileExist(file: string, orExit?: true): boolean {
    
    if (fs.existsSync(`./${file}`))
        return true;
    
    console.error(`Missing ${file}`);

    if (orExit)
        process.exit(1);
    
    return false;

}

export function readFile(file: string, orExit?: true): string|null {
    
    if (!fileExist(file, orExit))
        return null;

    return fs.readFileSync(file).toString();

}

export function parseJSON(string: string, orExit?: true): {}|null {
    
    try {
        return JSON.parse(string);
    } catch (e) {
        
        console.error(e);

        if (orExit)
            process.exit(1);

        return null;

    }

}

export function jsonSchema(jsonfile: string, schemafile: string, orExit?: true): {}|null {

    let json = readFile(jsonfile, orExit),
        schema = readFile(schemafile, orExit);
    
    if (json === null || schema === null)
        return null;

    if (validate(json, schema).errors.length > 0)
        return null;
    
    return json;

}
