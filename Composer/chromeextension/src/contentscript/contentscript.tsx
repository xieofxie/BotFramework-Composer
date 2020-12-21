import $ from 'jquery';

import './contentscript.scss';
import { HandleDiffAsync } from './HandleDiff';
import { HandleRawAsync } from './HandleRaw';

$(async ()=>{
    return await HandleRawAsync()
    .then(async () => {
        return await HandleDiffAsync();
    });
});
