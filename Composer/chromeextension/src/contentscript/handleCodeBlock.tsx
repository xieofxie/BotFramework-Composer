import $ from 'jquery';
// @ts-ignore
import MutationSummary from 'mutation-summary';
import ReactDOM from 'react-dom';

import { configureShowHide, renderAsync } from './renderers';

let currentButton: JQuery<HTMLElement>[] = [];
let currentDiv: JQuery<HTMLElement>[] = [];

const setupWatch = function() {
	const observer = new MutationSummary({
		callback: async function(summaries) {
			await renderCodeBlockAsync();
		},
		queries: [{ element: '[lang="declarative"]' }]
	});
};

export async function handleCodeBlockAsync(){
    setupWatch();
    await renderCodeBlockAsync();
}

async function renderCodeBlockAsync() {
    clearCurrentElems();
    let renderList = [];
    $("[lang='declarative']").each(function(index, codeblock) {
        const text = $(codeblock).find(":first-child").text();
        const data = JSON.parse(text);
        const suffix = 'rendercodeblock_' + index;
        const renderElem = configureShowHide($(codeblock), suffix);
        renderList.push(renderAsync(data, renderElem.divElem, false, true));
        currentButton.push(renderElem.buttonElem);
        currentDiv.push(renderElem.divElem);
    });
    Promise.all(renderList);
}

function clearCurrentElems() {
    currentButton.forEach(element => {
        element.remove();
    });
    currentDiv.forEach(element => {
        ReactDOM.unmountComponentAtNode(element[0]);
        element.remove();
    });
    currentButton = [];
    currentDiv = [];
}
