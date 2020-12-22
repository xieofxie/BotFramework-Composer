import $ from 'jquery';

import { ConfigureShowHide, RenderAsync } from './renderers';
import { SimpleGet } from '../utilities/utilities';

export async function HandleRawAsync(){
    const rawLinkElems = $('a#raw-url');
    if(rawLinkElems.length == 0) return;
    const rawLinkElem = rawLinkElems.first();
    const url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return await SimpleGet(url)
    .then(async (text: string) => {
        const data = JSON.parse(text);
        const bodyElem = $('div.Box-body[itemprop="text"]').first();
        const renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        await RenderAsync(data, renderElem, false);
    });
}
