import $ from 'jquery';
import queryString from 'query-string';

import { configureShowHides, renderAsync, setLazyLoading } from './renderers';
import { simpleGet } from '../utilities/utilities';
import parseJsonWithStatus, { LineStatus } from '../utilities/parseJsonWithStatus';
import { logInfo } from '../utilities/loggers';
import { Status } from '../utilities/status';
import { buttonStyle } from '../utilities/styles';

const getDiffType = () => {
    const elem = $('meta[name="diff-view"');
    if (elem.length == 0) return null;
    return elem.attr('content');
}

const getStatus = (element: JQuery<HTMLElement>): Status => {
    if(element[0].classList.contains('blob-code-addition')){
        return Status.Addition;
    }else if(element[0].classList.contains('blob-code-deletion')){
        return Status.Deletion;
    }else{
        return null;
    }
};

const setStatus = (temp: JQuery<HTMLTableRowElement>, idIndex: number, statusIndex: number, otherStatusIndex: number, status: LineStatus[]) => {
    const linenumbers = temp.eq(idIndex).attr('data-line-number');
    if (!!linenumbers) {
        const linenumber = parseInt(linenumbers) - 1;
        const thisStatus = getStatus(temp.eq(statusIndex));
        if (!!thisStatus) {
            const otherStatus = otherStatusIndex == -1 ? null : getStatus(temp.eq(otherStatusIndex));
            status.push({
                status: otherStatus ? Status.Both : thisStatus,
                line: linenumber
            });
        }
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

const handleLinkElem = (diffType: string, value: HTMLElement, rawUrl: string, baseUrl: string, index: number)=>{
    const bodyElem = $(value).parents().eq(5).find('table').eq(0);
    const renderElem = configureShowHides(bodyElem, ['Toggle Base', 'Toggle New'], `renderdiff_${index}`, 'Toggle All');

    const baseGetter = async () =>{
        let baseStatus: LineStatus[] = [];
        bodyElem.find('tr').each((index, value) => {
            const temp = $(value).children();
            if (diffType == 'split' && temp.length == 4){
                setStatus(temp, 0, 1, 3, baseStatus);
            } else if (diffType == 'unified' && temp.length == 3){
                // TODO note unified has different result with split
                if(temp[0].classList.contains('empty-cell')) {
                }else{
                    setStatus(temp, 0, 2, -1, baseStatus);
                }
            }
        });
        // console.error(baseStatus);

        const baseText = await simpleGet(baseUrl);
        const baseData = parseJsonWithStatus(baseText, baseStatus);
        return baseData;
    };
    setLazyLoading(renderElem[0], true, baseGetter);

    const newGetter = async () =>{
        let status: LineStatus[] = [];
        bodyElem.find('tr').each((index, value) => {
            const temp = $(value).children();
            if (diffType == 'split' && temp.length == 4){
                setStatus(temp, 2, 3, 1, status);
            } else if (diffType == 'unified' && temp.length == 3){
                // TODO note unified has different result with split
                if(temp[0].classList.contains('empty-cell')) {
                    setStatus(temp, 1, 2, -1, status);
                }else{
                }
            }
        });
        // console.error(status);

        const text = await simpleGet(rawUrl);
        const data = parseJsonWithStatus(text, status);
        return data;
    };
    setLazyLoading(renderElem[1], true, newGetter);

    // TODO bad check method
    renderElem[2].buttonElem.on('click', async (event)=>{
        if(renderElem[0].divElem.children().length == 0) {
            await renderAsync(null, renderElem[0].divElem, true, true, baseGetter);
        }
        if(renderElem[1].divElem.children().length == 0) {
            await renderAsync(null, renderElem[1].divElem, true, true, newGetter);
        }
    });
};

export async function handleDiffAsync(){
    const diffType = getDiffType();
    if (diffType == null) return;
    const linkElems = $('a.btn-link[role="menuitem"][rel="nofollow"]');
    if (linkElems.length == 0) return;
    // get commit
    const [newCommit, baseCommit] = getCommits();
    let index = 0;
    linkElems.each((_, value) => {
        const url = $(value).attr('href');
        if(!url.endsWith('.dialog') || url.endsWith('.lu.dialog')){
            return;
        }
        const rawUrl = url.replace(/\/blob\//, '/raw/');
        logInfo(rawUrl);
        // base url
        const baseUrl = url.replace(`/blob/${newCommit}`, `/raw/${baseCommit}`);
        logInfo(baseUrl);
        // TODO heavily rely on how github renders its page
        const bodyElem = $(value).parents().eq(5).find('table').eq(0);
        if (bodyElem.length == 0){
            const reloadButtonId = `renderdiff_${index}_reload`;
            const reloadButtonStr = `<div class=${buttonStyle} id=${reloadButtonId}>Click after Load diff</div>`;
            const reloadParent = $(value).parents().eq(5).find('div.js-file-content');
            reloadParent.before(reloadButtonStr);
            const reloadButton = $(`div#${reloadButtonId}`);
            const thisIndex = index;
            reloadButton.on('click', (event)=>{
                reloadButton.remove();
                handleLinkElem(diffType, value, rawUrl, baseUrl, thisIndex);
            });
        }else{
            handleLinkElem(diffType, value, rawUrl, baseUrl, index);
        }
        index++;
    });
}
