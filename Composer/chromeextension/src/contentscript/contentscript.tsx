import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import './contentscript.scss';
import { SimpleGet } from '../utilities/utilities';
import TriggersRenderer from './TriggersRenderer';

// return new elem
function ConfigureShowHide(originalElem, id){
    console.error(`ConfigureShowHide: ${id}`);
    originalElem.hide();
    var button = `<button id=${'button_'+id}>Toggle</button>`;
    originalElem.before(button);
    var buttonElem = $(`button#${'button_'+id}`);
    var div = `<div id=${'div_'+id}></div>`;
    originalElem.after(div);
    var divElem = $(`div#${'div_'+id}`);
    buttonElem.on('click', (event)=>{
        originalElem.toggle();
        divElem.toggle();
    });
    return divElem;
}

function Render(content, rootElem){
    var data = JSON.parse(content);
    var elem = <TriggersRenderer schema={{}} data={data}></TriggersRenderer>;
    ReactDOM.render(elem, rootElem[0]);
}

function HandleRawAsync(){
    var rawLinkElem = $('a#raw-url');
    if(!rawLinkElem) return;
    var url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    return SimpleGet(url)
    .then((text) => {
        var bodyElem = $('div.Box-body[itemprop="text"]');
        var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
        Render(text, renderElem);
    });
}

$(async ()=>{
    await HandleRawAsync();
});
