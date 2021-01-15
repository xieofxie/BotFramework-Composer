import { dialogGroups, DialogGroup } from '@bfc/shared';

import { simpleGet } from './utilities';
import { getLocal, setLocal } from './storage';

const schemaUrlKey = 'schemaUrlKey';
const uiSchemaUrlKey = 'uiSchemaUrlKey';
const schemaKey = 'schemaKey';
const uiSchemaKey = 'uiSchemaKey';
const schemaTimeKey = 'schemaTimeKey';

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uiSchemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uiSchema: any = null;

let triggers: Set<string> = new Set<string>();

export async function initSchemas(): Promise<void> {
    const sch = await getLocal(schemaKey);
    if (!sch) {
        await syncSchemas();
    } else {
        schema = sch;
        uiSchema = await getLocal(uiSchemaKey);
    }

    const groups = [DialogGroup.EVENTS, DialogGroup.DIALOG_EVENT_TYPES, DialogGroup.ADVANCED_EVENTS, DialogGroup.RECOGNIZER];
    groups.forEach((group) => {
        dialogGroups[group].types.forEach((type) => triggers.add(type));
    });
};

export async function getSchemaAsync() : Promise<any> {
    return schema;
};

export async function getUiSchemaAsync() : Promise<any> {
    return uiSchema;
};

export function isTrigger(kind: string) : boolean {
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

export async function getSchemaTimeAsync() : Promise<Date> {
    return new Date(await getLocal(schemaTimeKey));
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
        schema = JSON.parse(text);
        return setLocal(schemaKey, schema);
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
        uiSchema = JSON.parse(text);
        return setLocal(uiSchemaKey, uiSchema);
    });

    await Promise.all([p, pUi, setLocal(schemaTimeKey, new Date().toJSON())]);
}
