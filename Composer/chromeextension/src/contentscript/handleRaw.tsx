import $ from 'jquery';

import { configureShowHide, renderAsync } from './renderers';
import { simpleGet } from '../utilities/utilities';

export async function handleRawAsync(){
    const rawLinkElems = $('a#raw-url');
    if(rawLinkElems.length == 0) return;
    const rawLinkElem = rawLinkElems.first();
    const url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    const bodyElem = $('div.Box-body[itemprop="text"]').first();
    const renderElem = configureShowHide(bodyElem, 'renderraw');
    renderElem.buttonElem.on('click', async (event)=>{
        // TODO bad check method
        if(renderElem.divElem.children().length != 0) return;
        await renderAsync(null, renderElem.divElem, false, true, async ()=>{
            return JSON.parse(await simpleGet(url));
        });
    });
}
