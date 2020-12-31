import { dialogGroups, DialogGroup } from '@bfc/shared';

import { simpleGet } from './utilities';

// TODO not parallelizable

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uischemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uischema: any = null;

export async function getSchemaAsync() : Promise<any> {
    if (!schema) {
        return await simpleGet(schemaUrl)
        .then((text: string) => {
            schema = JSON.parse(text);
            return schema;
        });
    }
    return schema;
};

export async function getUiSchemaAsync() : Promise<any> {
    if (!uischema) {
        return await simpleGet(uischemaUrl)
        .then((text: string) => {
            uischema = JSON.parse(text);
            return uischema;
        });
    }
    return uischema;
};

let triggers: Set<string> = null;

export function isTrigger(kind: string) : boolean {
    if (!triggers) {
        triggers = new Set<string>();
        const groups = [DialogGroup.EVENTS, DialogGroup.DIALOG_EVENT_TYPES, DialogGroup.ADVANCED_EVENTS, DialogGroup.RECOGNIZER];
        groups.forEach((group) => {
            dialogGroups[group].types.forEach((type) => triggers.add(type));
        });
    }
    return triggers.has(kind);
}
