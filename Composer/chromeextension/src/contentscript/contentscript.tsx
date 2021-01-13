import $ from 'jquery';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import debug from 'debug';

import './contentscript.scss';
import { handleDiffAsync } from './handleDiff';
import { handleRawAsync } from './handleRaw';
import { handleCodeBlockAsync } from './handleCodeBlock';

initializeIcons(undefined, { disableWarnings: true });

// @ts-ignore
debug.log = console.warn.bind(console);

$(async ()=>{
    return await handleRawAsync()
    .then(async () => {
        return await handleDiffAsync();
    }).then(async () => {
        return await handleCodeBlockAsync();
    });
});
