import fs from 'fs-extra'
import glob from 'glob-promise'
import path from 'path'
import replaceAll from 'just-replace-all'
import axios from 'axios'

import { getDeterministicItem } from '../../src/helpers/deterministic.js'
import { getImageURLFromDecimal } from '../../src/helpers/urls.js'

// import paths from '../../src/assets/built-path-references.json'



const ONE_HOUR = 60 * 60
const ONE_DAY = ONE_HOUR * 24
const ONE_WEEK = ONE_DAY * 7
const ONE_MONTH = ONE_DAY * 30
const ONE_YEAR = ONE_DAY * 365


export const successHeaders = {
    // Set Cors Headers to allow all origins so data can be requested by a browser
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept', 
    
    // Use very long cache duration to ensure we're not doing lots of requests
    'Cache-Control': `public, max-age=${ ONE_DAY }, s-maxage=${ ONE_YEAR }`,

    // Set the content type for jpg
    'Content-Type': 'image/svg+xml', 
    'Content-Disposition': 'inline'
}


let paths
let wordsListPath
let wordsMetaPath
let imageListPath
let imageMetaPath

async function setupPathVariables () {
    paths = await fs.readJson('./src/assets/built-path-references.json')

    wordsListPath = `${ paths.wordsList }.txt`
    wordsMetaPath = `${ paths.wordsList }-meta.json`
    imageListPath = `${ paths.imageUrlList }.txt`
    imageMetaPath = `${ paths.imageUrlList }-meta.json`

    return
}


const layersDirectory = 'src/assets'


const template = `
    <svg 
        width="1000"
        height="1000" 
        viewBox="0 0 256 256" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink"
    >
        <!-- bg -->
        <!-- image1 -->
        <!-- head -->
        <!-- hair -->
        <!-- eyes -->
        <!-- nose -->
        <!-- mouth -->
        <!-- beard -->
        <g style="transform: scale(4) translate(1%, 1%);">
            <!-- heroicon -->
        </g>
    </svg>
`

const blendModes = [
    'difference',
    'color-burn',
    'color-dodge',
    'darken',
    'multiply',
    'color-burn',
    'soft-light',
    'lighten',
    'screen',
    'soft-light',
    'soft-light',
    'overlay',
    'soft-light',
    'lighten',
    'difference',
    'exclusion',
    'exclusion'
]

const templateImage = ({ href, blendMode }) => {
    // Convert Ampersands for SVG validation
    // https://stackoverflow.com/a/6919260/1397641
    const encodedHref = replaceAll(href, '&', '&amp;')

    return `
        <image 
            x="0" 
            y="0" 
            width="256" 
            height="256" 
            style="object-fit: cover; mix-blend-mode: ${ blendMode };"
            href="${ encodedHref }"
        />
`
}

function getBase64(url) {
    return axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

async function getWordsFromSeedNumber( seedNumber ) {

    console.log( 'wordsListPath', wordsListPath )

    const wordsMeta = await fs.readJson(wordsMetaPath)

    const word = await getDeterministicItem({
        list: wordsListPath, 
        listLength: wordsMeta.total,
        seedNumber
    })

    return word
}


async function getNameAndBand ( seedNumber ) {
    return {
        name: await getWordsFromSeedNumber( seedNumber ),
        band: await getWordsFromSeedNumber( seedNumber + 1 ),
    }
}


async function getLayer(name, skip=0.0) {
    const svg = await fs.readFile(`./${ layersDirectory }/${name}.svg`, 'utf-8');
    const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
    const layer = svg.match(re)[0];
    return Math.random() > skip ? layer : '';
}

// async function svgToPng(name) {
//     const src = `./out/${name}.svg`;
//     const dest = `./out/${name}.png`;

//     const img = await sharp(src);
//     const resized = await img.resize(1024);
//     await resized.toFile(dest);
// }

function replaceAllFillColor ( str, fill ) {
    return str.replace(/fill="[^"]*"/g, `fill="${fill}"`)

    // myAttr=\"([^']*?)\"
}



async function createImageXml ( multiverseAlbumNumber ) {


    const heroiconGlob = (await glob('src/assets/heroicons/**/*'))
    const heroicons = heroiconGlob.map(file => {
        // console.log('file', file)

        return path.basename(file, '.svg')
    })

    // console.log('heroicons', heroicons)


    const bg = multiverseAlbumNumber % 5

    const heroicon = multiverseAlbumNumber % heroicons.length
    // ♾ combinations
    
    // console.log('total heroicons', heroicons.length)



    const {
        name
    } = await getNameAndBand( multiverseAlbumNumber )

    // Get an image from the multiverse album number
    const imageUrl = await getDeterministicItem({
        list: imageListPath,
        listLength: (await fs.readJson( imageMetaPath )).total,
        seedNumber: multiverseAlbumNumber
    })

    console.log( 'imageUrl', imageUrl )

    // Fetch and convert the image to base64
    const imageBase64 = 'data:image/jpg;base64,' + (await getBase64(imageUrl))

    const blendMode = blendModes[ multiverseAlbumNumber % blendModes.length ]

    const parts = {
        '<!-- bg -->': `fireship/bg${bg}`,
        // '<!-- head -->': `fireship/head0`,
        // '<!-- hair -->': `fireship/hair${hair}`,
        // '<!-- eyes -->': `fireship/eyes${eyes}`,
        // '<!-- nose -->': `fireship/nose${nose}`,
        // '<!-- mouth -->': `fireship/mouth${mouth}`,
        // '<!-- beard -->': `fireship/beard${beard}`,
        '<!-- heroicon -->': `heroicons/${ heroicons[heroicon] }`,
    }

    const templatedParts = {
        '<!-- image1 -->': templateImage({ href: imageBase64, blendMode }),
    }

    let workingString = template;

    for ( const [key, value] of Object.entries(parts)) {
        let layerMarkup = await getLayer(value)

        if ( key !== '<!-- bg -->' ) {
            // Set the fill color
            layerMarkup = replaceAllFillColor( layerMarkup, '#000000' )
        }

        workingString = workingString.replace(key, layerMarkup)
    }

    for ( const [key, value] of Object.entries(templatedParts)) {
        workingString = workingString.replace(key, value)
    }

    const final = workingString

    const meta = {
        name,
        description: `A drawing of ${name.split('-').join(' ')}`,
        image: getImageURLFromDecimal( multiverseAlbumNumber ),
        attributes: [
            { 
                beard: '',
                rarity: 0.5
            }
        ]
    }

    return {
        meta,
        markup: final
    }
}


export default async function (req, res) {

    
    try {

        // Get path from url
        const { ext, name } = path.parse( req.query.path )
        // Trim dot from extension
        const extension = ext.substring(1)

        await setupPathVariables()

        const {
            meta, 
            markup
        } = await createImageXml( name )

        // Set Cors Headers to allow all origins so data can be requested by a browser
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

        // Handle SVG in path
        if ( extension === 'svg' ) {
            // Set headers
            for ( const [key, value] of Object.entries(successHeaders)) {
                res.setHeader(key, value)
            }

            res.send(markup)

            return
        }

        // console.log(`Nifty!`)

        // Repond with Video JSON Data
        res.json({
            ...meta, 
            // markup
        })

    } catch ( error ) {

        console.error('Error', error)

        res.statusCode = 500
            
        res.send('Error')

        return
    }
}