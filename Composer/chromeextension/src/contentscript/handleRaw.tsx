import $ from 'jquery';

import { configureShowHide, renderAsync } from './renderers';
import { simpleGet } from '../utilities/utilities';

export async function handleRawAsync(){
    const rawLinkElems = $('a#raw-url');
    if(rawLinkElems.length == 0) return;
    const rawLinkElem = rawLinkElems.first();
    const url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return await simpleGet(url)
    .then(async (text: string) => {
        const data = JSON.parse(text);
        const bodyElem = $('div.Box-body[itemprop="text"]').first();
        const renderElem = configureShowHide(bodyElem, 'renderraw');
        await renderAsync(data, renderElem, false, true);
    });
}
