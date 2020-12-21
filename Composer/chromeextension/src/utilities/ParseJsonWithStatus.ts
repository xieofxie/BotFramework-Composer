import jsonMap from 'json-source-map';

export interface LineStatus {
    status: 'addition' | 'deletion' | 'both';
    line: number;
};

export function ParseJsonWithStatus(data: string, lines: LineStatus[]) : any {
    const result = jsonMap.parse(data);
    console.error(result.pointers);
    return result.data;
};
