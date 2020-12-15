// @ts-nocheck

import './contentscript.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import VisualDesigner from '@bfc/adaptive-flow';
import { EditorExtension } from '@bfc/extension-client';

import $ from 'jquery';

// return new elem
function ConfigureShowHide(originalElem, id){
    console.error(`ConfigureShowHide: ${id}`);
    originalElem.hide();
    var button = `<button id=${'button_'+id}>Toggle</button>`;
    originalElem.before(button);
    var buttonElem = $(`button#${'button_'+id}`);
    var div = `<div id=${'div_'+id} style="position:relative;height:100vh;"></div>`;
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
    var onBlur = (e) => {};
    var onFocus = (e) => {};
    var schema = {};
    var uischema = {};
    const shellData = {
        // ApplicationContextApi
        api: {
            addCoachMarkRef: (ref) => {},
        },
        data: {
            focusedEvent: 'triggers[0]',
        },
    };
    var elem =
    <EditorExtension plugins={{ uiSchema: uischema, widgets: { flow: {}, recognizer: {} } }} shell={shellData}>
        <VisualDesigner
        data={data}
        schema={schema}
        onBlur={onBlur}
        onFocus={onFocus}
    />
    </EditorExtension>;
    ReactDOM.render(elem, rootElem[0]);
}

function HandleRaw(){
    var rawLinkElem = $('a#raw-url');
    if(!rawLinkElem) return;
    var url = rawLinkElem.attr('href');
    if(!url.endsWith('.dialog')) return;
    // TODO make a simple request (not $.get)
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var bodyElem = $('div.Box-body[itemprop="text"]');
            var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
            //renderElem.text(xhr.responseText);
            Render(xhr.responseText, renderElem);
         }
    };
    xhr.send();
}

$(()=>{
    HandleRaw();
});
