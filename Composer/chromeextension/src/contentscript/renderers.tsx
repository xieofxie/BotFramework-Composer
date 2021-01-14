import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import TriggersRenderer from './TriggersRenderer';
import { getSchemaAsync, getUiSchemaAsync } from '../utilities/schemas';
import { buttonStyle } from '../utilities/styles';
import { logInfo } from '../utilities/loggers';

export interface ShowHide {
    divElem: JQuery<HTMLElement>;
    buttonElem: JQuery<HTMLElement>;
}

// return new elem
export function configureShowHides(originalElem: JQuery<HTMLElement>, buttons: string[], id: string, buttonAll: string = null): ShowHide[]{
    const res: ShowHide[] = [];
    const divElems: JQuery<HTMLElement>[] = [];
    const buttonIds: string[] = [];
    let buttonStr = '';
    buttons.forEach((button, index) => {
        const thisId = `${id}_${index}`;
        logInfo(`ConfigureShowHides: ${thisId}`);
        // button
        const buttonId = `${thisId}_button`;
        buttonIds.push(buttonId);
        buttonStr += `<div class=${buttonStyle} id=${buttonId}>${button}</div>`;
        // div
        const divId = `${thisId}_div`;
        const divStr = `<div id=${divId}></div>`;
        if (divElems.length == 0) {
            originalElem.after(divStr);
        } else {
            divElems[divElems.length - 1].after(divStr);
        }
        const divElem = $(`div#${divId}`);
        divElem.hide();
        divElems.push(divElem);
    });
    let buttonAllId = null;
    if (!!buttonAll) {
        buttonAllId = `${id}_button_all`;
        buttonStr += `<div class=${buttonStyle} id=${buttonAllId}>${buttonAll}</div>`;
    }
    buttonStr = `<div>${buttonStr}</div>`;
    originalElem.before(buttonStr);
    buttonIds.forEach((buttonId, index) => {
        const buttonElem = $(`div#${buttonId}`);
        buttonElem.on('click', (event) => {
            const isHidden = divElems[index].css('display') == 'none';
            divElems.forEach((r) => r.hide());
            if (isHidden) {
                divElems[index].css('float', 'none');
                divElems[index].css('width', '100%');
                divElems[index].show();
                originalElem.hide();
            } else {
                originalElem.show();
            }
        });
        res.push({divElem: divElems[index], buttonElem});
    });
    if (!!buttonAllId) {
        const buttonElem = $(`div#${buttonAllId}`);
        buttonElem.on('click', (event) => {
            const isHidden = originalElem.css('display') != 'none';
            divElems.forEach((r) => {
                if (isHidden) {
                    r.css('float', 'left');
                    r.css('width', `${100 / divElems.length}%`);
                    r.show();
                } else {
                    r.hide();
                }
            });
            if (isHidden) {
                originalElem.hide();
            } else {
                originalElem.show();
            }
        });
        res.push({divElem: null, buttonElem});
    }
    return res;
}

export function configureShowHide(originalElem: JQuery<HTMLElement>, id: string): ShowHide{
    return configureShowHides(originalElem, ['Toggle'], id)[0];
}

export async function renderAsync(data: any, rootElem, enableHide: boolean, enableProperty: boolean, dataGetter: any = null){
    const schemas = {
        sdk: { content: await getSchemaAsync()},
        ui: { content: await getUiSchemaAsync()},
    };
    var elem =
        <RecoilRoot>
            <TriggersRenderer schemas={schemas} data={data} dataGetter={dataGetter} enableHide={enableHide} enableProperty={enableProperty}></TriggersRenderer>
        </RecoilRoot>;
    ReactDOM.render(elem, rootElem[0]);
}

export function setLazyLoading(renderElem: ShowHide, enableHide: boolean, getter: ()=>Promise<void>){
    renderElem.buttonElem.on('click', async (event)=>{
        // TODO bad check method
        if(renderElem.divElem.children().length != 0) return;
        await renderAsync(null, renderElem.divElem, enableHide, true, getter);
    });
}
