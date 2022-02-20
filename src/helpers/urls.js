
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

export function getImageURLFromDecimal ( decimalTokenId ) {
    return `nft-media/${ decimalTokenId }.svg`
}

export function getImageUrl ( hexidecimalTokenId ) {
    const decimalTokenId = hexToDec( hexidecimalTokenId )

    return getImageURLFromDecimal( decimalTokenId )
}

export function parseUnsplashImgixUrl ( rawImgixUrl ) {
    const url = new URL( rawImgixUrl )

    // Unsplash uses Imgix so so update the Imgix params to want we want
    // Example - https://images.unsplash.com/photo-1643544590582-33dc3477a3cd?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces,focalpoint&cs=tinysrgb&w=1080&h=1080&fit=crop

    // https://docs.imgix.com/apis/rendering/size/crop
    url.searchParams.set('crop', 'faces,focalpoint')
    // https://docs.imgix.com/apis/rendering/size/fit
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('w', 1080)
    url.searchParams.set('h', 1080)

    return url.toString()
}