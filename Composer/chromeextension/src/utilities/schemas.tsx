import plugins, { mergePluginConfigs } from '../clientdummies/plugins';
import { simpleGet } from './utilities';

// TODO not parallelizable

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uischemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uischema: any = null;

let pluginConfig: any = null;

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

export async function getPluginConfigAsync() : Promise<any> {
    if (!pluginConfig) {
        return await getUiSchemaAsync()
        .then((uischema: any) => {
            // Composer\packages\client\src\pages\design\DesignPage.tsx
            pluginConfig = mergePluginConfigs({ uiSchema: uischema }, plugins);
            return pluginConfig;
        })
    }
    return pluginConfig;
};
