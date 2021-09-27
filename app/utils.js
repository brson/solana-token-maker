// https://www.thetopsites.net/article/50868276.shtml
export const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

export const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export function getCookieValue(name) {
    if (document.cookie.includes(`${name}=`) == false) {
        return null;
    }

    // https://developer.mozilla.org/en-US/docs/web/api/document/cookie
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        .split('=')[1];
}

export function setCookieValue(name, value) {
    document.cookie = `${name}=${value}`;
}
