import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import TriggersRenderer from './TriggersRenderer';
import { getSchemaAsync, getUiSchemaAsync } from '../utilities/schemas';

// return new elem
export function configureShowHides(originalElem: JQuery<HTMLElement>, buttons: string[], id: string){
    const res = [];
    const divElems: JQuery<HTMLElement>[] = [];
    const buttonIds: string[] = [];
    let buttonStr = '';
    buttons.forEach((button, index) => {
        const thisId = `${id}_${index}`;
        console.error(`ConfigureShowHides: ${thisId}`);
        // button
        const buttonId = `${thisId}_button`;
        buttonIds.push(buttonId);
        buttonStr += `<div id=${buttonId}>${button}</div>`;
        // div
        const divId = `${thisId}_div`;
        const divStr = `<div id=${divId}></div>`;
        originalElem.after(divStr);
        const divElem = $(`div#${divId}`);
        divElem.hide();
        divElems.push(divElem);
    });
    const buttonContainerId = `${id}_buttonContainer`
    buttonStr = `<div id=${buttonContainerId}>${buttonStr}</div>`;
    originalElem.before(buttonStr);
    buttonIds.forEach((buttonId, index) => {
        const buttonElem = $(`div#${buttonId}`);
        buttonElem.on('click', (event) => {
            const isHidden = divElems[index].css('display') == 'none';
            divElems.forEach((r) => r.hide());
            if (isHidden) {
                divElems[index].show();
                originalElem.hide();
            } else {
                originalElem.show();
            }
        });
        buttonElem.css('display', 'inline-block');
        buttonElem.css('color', 'white');
        buttonElem.css('background-color', '#3362D5');
        buttonElem.hover(function(){
            $(this).css("background-color","#2C53B1");
        },function(){
            $(this).css("background-color","#3362D5");
        });
        buttonElem.css('user-select', 'none');
        buttonElem.css('padding', '4px');
        res.push({divElem: divElems[index], buttonElem});
    });
    return res;
}

export function configureShowHide(originalElem: JQuery<HTMLElement>, id: string){
    return configureShowHides(originalElem, ['Toggle'], id)[0];
}

export async function renderAsync(data: any, rootElem, enableHide: boolean, enableProperty: boolean){
    const schemas = {
        sdk: { content: await getSchemaAsync()},
        ui: { content: await getUiSchemaAsync()},
    };
    var elem =
        <RecoilRoot>
            <TriggersRenderer schemas={schemas} data={data} enableHide={enableHide} enableProperty={enableProperty}></TriggersRenderer>
        </RecoilRoot>;
    ReactDOM.render(elem, rootElem[0]);
}
