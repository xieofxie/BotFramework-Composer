import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import TriggersRenderer from './TriggersRenderer';
import { GetSchemaAsync, GetPluginConfigAsync } from '../utilities/schemas';

// return new elem
export function ConfigureShowHide(originalElem, id: string){
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

export async function RenderAsync(data: any, rootElem){
    var elem = <TriggersRenderer schema={await GetSchemaAsync()} plugins={await GetPluginConfigAsync()} data={data}></TriggersRenderer>;
    ReactDOM.render(elem, rootElem[0]);
}
