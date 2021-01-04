import jsonMap from 'json-source-map';
import jsonpointer from 'jsonpointer';

import { mergeStatus } from './status';

export interface LineStatus {
    status: 'addition' | 'deletion' | 'both';
    line: number;
};

interface LineObj {
    begin: number;
    end: number;
    obj: any;
};

// TODO optimize
export default function parseJsonWithStatus(data: string, lines: LineStatus[]) : any {
    const result = jsonMap.parse(data);
    const lineObjs: LineObj[] = [];
    for (let [key, value] of Object.entries(result.pointers)) {
        const obj = jsonpointer.get(result.data, key);
        if (typeof(obj) === 'object' && '$kind' in obj) {
            // @ts-ignore
            lineObjs.push({ begin: value.value.line, end: value.valueEnd.line, obj: obj});
        }
    }
    //console.error(lineObjs);
    lines.forEach((line) => {
        let best: LineObj = null;
        lineObjs.forEach((lineObj) => {
            if (line.line >= lineObj.begin && line.line <= lineObj.end) {
                if(best == null) {
                    best = lineObj;
                }else if(best.end - best.begin > lineObj.end - lineObj.begin){
                    best = lineObj;
                }
            }
        });
        if(best){
            best.obj.gitStatus = mergeStatus(best.obj.gitStatus, line.status);
            // console.error(best);
        }
    });
    return result.data;
};
