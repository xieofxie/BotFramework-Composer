import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import './contentscript.scss';
import plugins, { mergePluginConfigs } from '../utilities/plugins';
import { SimpleGet } from '../utilities/utilities';
import TriggersRenderer from './TriggersRenderer';

const schemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.schema';
let schema: any = {};

const uischemaUrl = 'https://raw.githubusercontent.com/microsoft/BotFramework-Composer/main/Composer/packages/server/schemas/sdk.uischema';
let uischema: any = {};

let pluginConfig: any = {};

// return new elem
function ConfigureShowHide(originalElem, id){
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

function Render(content, rootElem){
    var data = JSON.parse(content);
    var elem = <TriggersRenderer schema={schema} plugins={pluginConfig} data={data}></TriggersRenderer>;
    ReactDOM.render(elem, rootElem[0]);
}

function HandleRawAsync(){
    var rawLinkElem = $('a#raw-url');
    if(!rawLinkElem) return;
    var url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return SimpleGet(url)
    .then((text: string) => {
        var bodyElem = $('div.Box-body[itemprop="text"]');
        var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        Render(text, renderElem);
    });
}

$(async ()=>{
    await SimpleGet(uischemaUrl)
    .then((text: string) => {
        uischema = JSON.parse(text);
        // Composer\packages\client\src\pages\design\DesignPage.tsx
        pluginConfig = mergePluginConfigs({ uiSchema: uischema }, plugins);
    })
    .then(() => {
        return HandleRawAsync();
    });
});
