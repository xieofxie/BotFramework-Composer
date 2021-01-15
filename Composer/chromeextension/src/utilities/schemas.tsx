import { dialogGroups, DialogGroup } from '@bfc/shared';

import { simpleGet } from './utilities';
import { getLocal, setLocal } from './storage';

const schemaUrlKey = 'schemaUrlKey';
const uiSchemaUrlKey = 'uiSchemaUrlKey';
const schemaKey = 'schemaKey';
const uiSchemaKey = 'uiSchemaKey';

// TODO not parallelizable

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uiSchemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uiSchema: any = null;

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
    if (!uiSchema) {
        return await simpleGet(uiSchemaUrl)
        .then((text: string) => {
            uiSchema = JSON.parse(text);
            return uiSchema;
        });
    }
    return uiSchema;
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

export async function getSchemaUrlAsync() : Promise<string> {
    const url = await getLocal(schemaUrlKey);
    if (!url) {
        await setLocal(schemaUrlKey, schemaUrl);
        return schemaUrl;
    }
    return url;
}

export async function getUiSchemaUrlAsync() : Promise<string> {
    const url = await getLocal(uiSchemaUrlKey);
    if (!url) {
        await setLocal(uiSchemaUrlKey, uiSchemaUrl);
        return uiSchemaUrl;
    }
    return url;
}

export async function syncSchemas(schemaUrl: string = null, uiSchemaUrl: string = null): Promise<void> {
    const p = new Promise<string>(async (resolve, reject) => {
        if (schemaUrl) {
            await setLocal(schemaUrlKey, schemaUrl);
            resolve(schemaUrl);
        } else {
            resolve(await getSchemaUrlAsync());
        }
    }).then((url) => {
        return simpleGet(url);
    }).then((text) => {
        return setLocal(schemaKey, JSON.parse(text));
    });

    const pUi = new Promise<string>(async (resolve, reject) => {
        if (uiSchemaUrl) {
            await setLocal(uiSchemaUrlKey, uiSchemaUrl);
            resolve(uiSchemaUrl);
        } else {
            resolve(await getUiSchemaUrlAsync());
        }
    }).then((url) => {
        return simpleGet(url);
    }).then((text) => {
        return setLocal(uiSchemaKey, JSON.parse(text));
    });

    await Promise.all([p, pUi]);
}
