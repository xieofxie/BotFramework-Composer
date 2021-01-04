import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import TriggersRenderer from './TriggersRenderer';
import { getSchemaAsync, getUiSchemaAsync } from '../utilities/schemas';

// return new elem
export function configureShowHides(originalElem: JQuery<HTMLElement>, buttons: string[], id: string){
    const res: JQuery<HTMLElement>[] = [];
    const buttonIds: string[] = [];
    let buttonStr = '';
    buttons.forEach((button, index) => {
        const thisId = `${id}_${index}`;
        console.error(`ConfigureShowHides: ${thisId}`);
        // button
        const buttonId = `${thisId}_button`;
        buttonIds.push(buttonId);
        buttonStr += `<button id=${buttonId}>${button}</button>`;
        // div
        const divId = `${thisId}_div`;
        const divStr = `<div id=${divId}></div>`;
        originalElem.after(divStr);
        const divElem = $(`div#${divId}`);
        divElem.hide();
        res.push(divElem);
    });
    buttonStr = `<div>${buttonStr}</div>`;
    originalElem.before(buttonStr);
    buttonIds.forEach((buttonId, index) => {
        const buttonElem = $(`button#${buttonId}`);
        buttonElem.on('click', (event) => {
            const isHidden = res[index].css('display') == 'none';
            res.forEach((r) => r.hide());
            if (isHidden) {
                res[index].show();
                originalElem.hide();
            } else {
                originalElem.show();
            }
        });
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
