import $ from 'jquery';

import { ConfigureShowHide, RenderAsync } from './renderers';

export async function HandleCodeBlockAsync(){
    let renderList = [];
    $("[lang='declarative']").each(function(index, codeblock) {
        const text = $(codeblock).find(":first-child").text();
        const data = JSON.parse(text);
        const renderElem = ConfigureShowHide($(codeblock), 'rendercodeblock'+index);
        renderList.push(RenderAsync(data, renderElem));
    });
    Promise.all(renderList);
}
