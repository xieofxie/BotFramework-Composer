import $ from 'jquery';

import { ConfigureShowHide, RenderAsync } from './renderers';
import { SimpleGet } from '../utilities/utilities';

export async function HandleRawAsync(){
    var rawLinkElem = $('a#raw-url');
    if(rawLinkElem.length == 0) return;
    var url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return await SimpleGet(url)
    .then(async (text: string) => {
        var data = JSON.parse(text);
        var bodyElem = $('div.Box-body[itemprop="text"]');
        var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        await RenderAsync(data, renderElem);
    });
}
