import $ from 'jquery';

import './contentscript.scss';
import { HandleCodeBlockAsync } from './HandleCodeBlock';
import { HandleDiffAsync } from './HandleDiff';
import { HandleRawAsync } from './HandleRaw';

$(async ()=>{
    return await HandleRawAsync()
    .then(async () => {
        return await HandleDiffAsync();
    }).then(async () => {
        return await HandleCodeBlockAsync();
    });
});
