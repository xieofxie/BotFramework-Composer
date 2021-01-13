import $ from 'jquery';
import queryString from 'query-string';

import { configureShowHides, renderAsync } from './renderers';
import { simpleGet } from '../utilities/utilities';
import parseJsonWithStatus, { LineStatus } from '../utilities/parseJsonWithStatus';
import { logInfo } from '../utilities/loggers';

const getStatus = (element: JQuery<HTMLElement>) => {
    if(element[0].classList.contains('blob-code-addition')){
        return 'addition';
    }else if(element[0].classList.contains('blob-code-deletion')){
        return 'deletion';
    }else{
        return null;
    }
};

const getCommits = ()=>{
    const elem = $('div.js-socket-channel.js-updatable-content.js-pull-refresh-on-pjax').eq(0);
    const url = elem.attr('data-url');
    const parsed = queryString.parseUrl(url);
    const newCommit = parsed.query['end_commit_oid'];
    const baseCommit = parsed.query['base_commit_oid'];
    logInfo(`${baseCommit} -> ${newCommit}`);
    return [newCommit, baseCommit];
};

export async function handleDiffAsync(){
    const linkElems = $('a.btn-link[role="menuitem"][rel="nofollow"]');
    if (linkElems.length == 0) return;
    let urls: string[] = [];
    let baseUrls: string[] = [];
    let bodyElems: JQuery<HTMLElement>[] = [];
    // get commit
    const [newCommit, baseCommit] = getCommits();
    linkElems.each((index, value) => {
        const url = $(value).attr('href');
        if(!url.endsWith('.dialog')){
            return;
        }
        const rawurl = url.replace(/\/blob\//, '/raw/');
        urls.push(rawurl);
        logInfo(rawurl);
        // TODO heavily rely on how github renders its page
        // const bodyElem = $(value).parents().eq(4).next().children().eq(0).children().eq(0);
        const bodyElem = $(value).parents().eq(5).find('table').eq(0);
        bodyElems.push(bodyElem);
        // base url
        const baseUrl = url.replace(`/blob/${newCommit}`, `/raw/${baseCommit}`);
        baseUrls.push(baseUrl);
        logInfo(baseUrl);
    });

    const setStatus = (temp: JQuery<HTMLTableRowElement>, idIndex: number, statusIndex: number, otherStatusIndex: number, status: LineStatus[]) => {
        const linenumbers = temp.eq(idIndex).attr('data-line-number');
        if (!!linenumbers) {
            const linenumber = parseInt(linenumbers) - 1;
            const thisStatus = getStatus(temp.eq(statusIndex));
            if (!!thisStatus) {
                const otherStatus = getStatus(temp.eq(otherStatusIndex));
                status.push({
                    status: otherStatus ? 'both' : thisStatus,
                    line: linenumber
                });
            }
        }
    };

    for(let index = 0;index < urls.length;index++) {
        const url = urls[index];
        let status: LineStatus[] = [];
        let baseStatus: LineStatus[] = [];
        bodyElems[index].find('tr').each((index, value) => {
            const temp = $(value).children();
            if(temp.length == 4){
                setStatus(temp, 0, 1, 3, baseStatus);
                setStatus(temp, 2, 3, 1, status);
            }
        });
        // console.error(status);
        // console.error(baseStatus);

        await simpleGet(url)
        .then(async (text: string) => {
            const data = parseJsonWithStatus(text, status);
            const renderElem = configureShowHides(bodyElems[index], ['Toggle Base', 'Toggle New'], `renderdiff_${index}`, 'Toggle All');
            await renderAsync(data, renderElem[1].divElem, true, true);
            // base
            const baseText = await simpleGet(baseUrls[index]);
            const baseData = parseJsonWithStatus(baseText, baseStatus);
            await renderAsync(baseData, renderElem[0].divElem, true, true);
        });
    }
}
