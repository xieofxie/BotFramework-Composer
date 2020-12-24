import $ from 'jquery';

import { configureShowHide, renderAsync } from './renderers';

export async function handleCodeBlockAsync(){
    let renderList = [];
    $("[lang='declarative']").each(function(index, codeblock) {
        const text = $(codeblock).find(":first-child").text();
        const data = JSON.parse(text);
        const renderElem = configureShowHide($(codeblock), 'rendercodeblock'+index);
        renderList.push(renderAsync(data, renderElem, false));
    });
    Promise.all(renderList);
}
