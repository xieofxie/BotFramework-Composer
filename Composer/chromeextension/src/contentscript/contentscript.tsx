import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import './contentscript.scss';
import plugins, { mergePluginConfigs } from '../utilities/plugins';
import { SimpleGet } from '../utilities/utilities';
import TriggersRenderer from './TriggersRenderer';

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = null;

const uischemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uischema: any = null;

let pluginConfig: any = null;

const GetSchemaAsync = async () => {
    if (!schema) {
        return await SimpleGet(schemaUrl)
        .then((text: string) => {
            schema = JSON.parse(text);
            return schema;
        });
    }
    return schema;
};

const GetUiSchemaAsync = async () => {
    if (!uischema) {
        return await SimpleGet(uischemaUrl)
        .then((text: string) => {
            uischema = JSON.parse(text);
            return uischema;
        });
    }
    return uischema;
};

const GetPluginConfigAsync = async () => {
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

// return new elem
const ConfigureShowHide = (originalElem, id) => {
    console.error(`ConfigureShowHide: ${id}`);
    originalElem.hide();
    var button = `<button id=${'button_'+id}>Toggle</button>`;
    originalElem.before(button);
    var buttonElem = $(`button#${'button_'+id}`);
    var div = `<div id=${'div_'+id}></div>`;
    originalElem.after(div);
    var divElem = $(`div#${'div_'+id}`);
    buttonElem.on('click', (event)=>{
        originalElem.toggle();
        divElem.toggle();
    });
    return divElem;
}

const RenderAsync = async (content, rootElem) => {
    var data = JSON.parse(content);
    var elem = <TriggersRenderer schema={await GetSchemaAsync()} plugins={await GetPluginConfigAsync()} data={data}></TriggersRenderer>;
    ReactDOM.render(elem, rootElem[0]);
}

const HandleRawAsync = async () => {
    var rawLinkElem = $('a#raw-url');
    if(rawLinkElem.length == 0) return;
    var url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return await SimpleGet(url)
    .then(async (text: string) => {
        var bodyElem = $('div.Box-body[itemprop="text"]');
        var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        await RenderAsync(text, renderElem);
    });
}

$(async ()=>{
    return await HandleRawAsync();
});
