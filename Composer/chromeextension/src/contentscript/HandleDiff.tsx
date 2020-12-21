import $ from 'jquery';

import { ConfigureShowHide, RenderAsync } from './renderers';
import { SimpleGet } from '../utilities/utilities';

export async function HandleDiffAsync(){
    const linkElems = $('a.btn-link[role="menuitem"]');
    if (linkElems.length == 0) return;
    let url = null;
    let bodyElem = null;
    linkElems.each((index, value) => {
        const temp = $(value).attr('href');
        if(temp.endsWith('.dialog')){
            url = temp;
            bodyElem = $(value).parents().eq(5);
            return false;
        }
    })
    if (!url) return;
    url = url.replace(/\/blob\//, '/raw/');
    return await SimpleGet(url)
    .then(async (text: string) => {
        const data = JSON.parse(text);
        const renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        await RenderAsync(data, renderElem);
    });
}
