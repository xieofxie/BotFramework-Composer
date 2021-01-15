/// <reference types="Chrome"/>

export function getLocal(key: string) : Promise<any>{
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    })
}

export function setLocal(key: string, value: any) : Promise<void>{
    return new Promise((resolve, reject) => {
        const pair = {};
        pair[key] = value;
        chrome.storage.local.set(pair, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    })
}
