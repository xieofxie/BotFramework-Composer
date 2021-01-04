// TODO make a simple request (not $.get)
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
export function simpleGet(url: string) : Promise<string>{
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200){
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.status);
                }
            }
        };
        xhr.send();
    });
}
