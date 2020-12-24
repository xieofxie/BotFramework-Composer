import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import TriggersRenderer from './TriggersRenderer';
import { getSchemaAsync, getPluginConfigAsync } from '../utilities/schemas';

// return new elem
export function configureShowHide(originalElem, id: string){
    console.error(`ConfigureShowHide: ${id}`);
    originalElem.show();
    var button = `<button id=${'button_'+id}>Toggle</button>`;
    originalElem.before(button);
    var buttonElem = $(`button#${'button_'+id}`);
    var div = `<div id=${'div_'+id}></div>`;
    originalElem.after(div);
    var divElem = $(`div#${'div_'+id}`);
    divElem.hide();
    buttonElem.on('click', (event)=>{
        originalElem.toggle();
        divElem.toggle();
    });
    return divElem;
}

export async function renderAsync(data: any, rootElem, enableHide: boolean){
    var elem =
        <RecoilRoot>
            <TriggersRenderer schema={await getSchemaAsync()} plugins={await getPluginConfigAsync()} data={data} enableHide={enableHide}></TriggersRenderer>
        </RecoilRoot>;
    ReactDOM.render(elem, rootElem[0]);
}
