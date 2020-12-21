import $ from 'jquery';

import './contentscript.scss';
import { HandleRawAsync } from './HandleRaw';

$(async ()=>{
    return await HandleRawAsync();
});
