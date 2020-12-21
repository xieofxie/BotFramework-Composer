import plugins, { mergePluginConfigs } from './plugins';
import { SimpleGet } from './utilities';

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uischemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uischema: any = null;

let pluginConfig: any = null;

export async function GetSchemaAsync() : Promise<any> {
    if (!schema) {
        return await SimpleGet(schemaUrl)
        .then((text: string) => {
            schema = JSON.parse(text);
            return schema;
        });
    }
    return schema;
};

export async function GetUiSchemaAsync() : Promise<any> {
    if (!uischema) {
        return await SimpleGet(uischemaUrl)
        .then((text: string) => {
            uischema = JSON.parse(text);
            return uischema;
        });
    }
    return uischema;
};

export async function GetPluginConfigAsync() : Promise<any> {
    if (!pluginConfig) {
        return await GetUiSchemaAsync()
        .then((uischema: any) => {
            // Composer\packages\client\src\pages\design\DesignPage.tsx
            pluginConfig = mergePluginConfigs({ uiSchema: uischema }, plugins);
            return pluginConfig;
        })
    }
    return pluginConfig;
};
