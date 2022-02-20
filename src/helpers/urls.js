
// https://stackoverflow.com/a/57805/1397641
function hexToDec(hex) {
  return parseInt(hex, 16)
}

function decToHex(dec) {
    return dec.toString(16)
}

export function getMetaDataUrl ( hexidecimalTokenId ) {
    const decimal = hexToDec( hexidecimalTokenId )

    return `nft-media/${ decimal }.json`
}

export function getImageUrl ( hexidecimalTokenId ) {
    const decimal = hexToDec( hexidecimalTokenId )

    return `nft-media/${ decimal }.svg`
}
