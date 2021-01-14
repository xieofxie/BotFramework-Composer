import $ from 'jquery';

import { configureShowHide, setLazyLoading } from './renderers';
import { simpleGet } from '../utilities/utilities';

export async function handleRawAsync(){
    const rawLinkElems = $('a#raw-url');
    if(rawLinkElems.length == 0) return;
    const rawLinkElem = rawLinkElems.first();
    const url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    const bodyElem = $('div.Box-body[itemprop="text"]').first();
    const renderElem = configureShowHide(bodyElem, 'renderraw');
    setLazyLoading(renderElem, false, async ()=>{
        return JSON.parse(await simpleGet(url));
    });
}
