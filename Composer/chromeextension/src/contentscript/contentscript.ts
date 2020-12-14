import './contentscript.scss';

import $ = require("jquery");

const isThisContentscript = true;
console.log('isThisContentscript: ', isThisContentscript);

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

function HandleRaw(){
    var rawLinkElem = $('a#raw-url');
    if(!rawLinkElem) return;
    var url = rawLinkElem.attr('href');
    // TODO make a simple request (not $.get)
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var bodyElem = $('div.Box-body[itemprop="text"]');
            var renderElem = ConfigureShowHide(bodyElem, 'renderraw');
            renderElem.text(xhr.responseText);
         }
    };
    xhr.send();
}

$(()=>{
    HandleRaw();
});
