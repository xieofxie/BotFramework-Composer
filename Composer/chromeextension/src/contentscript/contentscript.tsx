import $ from 'jquery';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import './contentscript.scss';
import { handleDiffAsync } from './handleDiff';
import { handleRawAsync } from './handleRaw';
import { HandleCodeBlockAsync } from './HandleCodeBlock';


initializeIcons(undefined, { disableWarnings: true });

$(async ()=>{
    return await handleRawAsync()
    .then(async () => {
        return await handleDiffAsync();
    }).then(async () => {
        return await HandleCodeBlockAsync();
    });
});
