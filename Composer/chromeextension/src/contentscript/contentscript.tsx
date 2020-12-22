import $ from 'jquery';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

import './contentscript.scss';
import { HandleDiffAsync } from './HandleDiff';
import { HandleRawAsync } from './HandleRaw';

initializeIcons(undefined, { disableWarnings: true });

$(async ()=>{
    return await HandleRawAsync()
    .then(async () => {
        return await HandleDiffAsync();
    });
});
