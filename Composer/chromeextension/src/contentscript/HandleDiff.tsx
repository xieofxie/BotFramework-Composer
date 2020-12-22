import $ from 'jquery';

import { ConfigureShowHide, RenderAsync } from './renderers';
import { SimpleGet } from '../utilities/utilities';
import ParseJsonWithStatus, { LineStatus } from '../utilities/ParseJsonWithStatus';

const GetStatus = (element: JQuery<HTMLElement>) => {
    if(element[0].classList.contains('blob-code-addition')){
        return 'addition';
    }else if(element[0].classList.contains('blob-code-deletion')){
        return 'deletion';
    }else{
        return null;
    }
};

export async function HandleDiffAsync(){
    const linkElems = $('a.btn-link[role="menuitem"][rel="nofollow"]');
    if (linkElems.length == 0) return;
    let urls: string[] = [];
    let bodyElems: JQuery<HTMLElement>[] = [];
    linkElems.each((index, value) => {
        const url = $(value).attr('href');
        if(!url.endsWith('.dialog')){
            return;
        }
        const rawurl = url.replace(/\/blob\//, '/raw/');
        urls.push(rawurl);
        // TODO heavily rely on how github renders its page
        const bodyElem = $(value).parents().eq(4).next();
        bodyElems.push(bodyElem);
    });

    urls.forEach(async (url, index) => {
        let status: LineStatus[] = [];
        bodyElems[index].find('tr').each((index, value) => {
            const temp = $(value).children();
            if(temp.length == 4){
                const linenumbers = temp.eq(2).attr('data-line-number');
                if (!!!linenumbers) return;
                const linenumber = parseInt(linenumbers);
                const thisStatus = GetStatus(temp.eq(3));
                if (!!!thisStatus) return;
                const prevStatus = GetStatus(temp.eq(1));
                status.push({
                    status: prevStatus ? 'both' : thisStatus,
                    line: linenumber
                });
            }
        });
        // console.error(status);

        return await SimpleGet(url)
        .then(async (text: string) => {
            const data = ParseJsonWithStatus(text, status);
            const renderElem = ConfigureShowHide(bodyElems[index], `renderdiff_${index}`);
            await RenderAsync(data, renderElem, true);
        });
    });
}
