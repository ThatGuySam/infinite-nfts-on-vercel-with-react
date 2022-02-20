import fs from 'fs-extra'
import glob from 'glob-promise'
import path from 'path'


const layersDirectory = 'src/assets'


const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
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

const takenNames = {};
const takenFaces = {};
let idx = 999;

function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


function getRandomName() {
    const adjectives = 'fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical'.split(' ');
    const names = 'aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis'.split(' ');
    
    const randAdj = randElement(adjectives);
    const randName = randElement(names);
    const name =  `${randAdj}-${randName}`;


    if (takenNames[name] || !name) {
        return getRandomName();
    } else {
        takenNames[name] = name;
        return name;
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


async function createImageXml ( idx ) {


    const heroiconGlob = (await glob('src/assets/heroicons/**/*'))
    const heroicons = heroiconGlob.map(file => {
        // console.log('file', file)

        return path.basename(file, '.svg')
    })

    // console.log('heroicons', heroicons)


    const bg = idx % 5
    const hair = idx % 7
    const eyes = idx % 9
    const nose = idx %  4
    const mouth = idx % 5
    const beard = idx % 3
    const heroicon = idx % heroicons.length
    // ♾ combinations

    // const face = [hair, eyes, mouth, nose, beard].join('');
    
    console.log('total heroicons', heroicons.length)



    const name = getRandomName()
    console.log(name)
    // face[takenFaces] = face;

    const parts = {
        '<!-- bg -->': `fireship/bg${bg}`,
        '<!-- head -->': `fireship/head0`,
        '<!-- hair -->': `fireship/hair${hair}`,
        '<!-- eyes -->': `fireship/eyes${eyes}`,
        '<!-- nose -->': `fireship/nose${nose}`,
        '<!-- mouth -->': `fireship/mouth${mouth}`,
        '<!-- beard -->': `fireship/beard${beard}`,
        '<!-- heroicon -->': `heroicons/${ heroicons[heroicon] }`,
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

    const final = workingString

    // const final = template
    //     .replace('<!-- bg -->', getLayer(`bg${bg}`))
    //     .replace('<!-- head -->', getLayer('head0'))
    //     .replace('<!-- hair -->', getLayer(`hair${hair}`))
    //     .replace('<!-- eyes -->', getLayer(`eyes${eyes}`))
    //     .replace('<!-- nose -->', getLayer(`nose${nose}`))
    //     .replace('<!-- mouth -->', getLayer(`mouth${mouth}`))
    //     .replace('<!-- beard -->', getLayer(`beard${beard}`, 0.5))

    const meta = {
        name,
        description: `A drawing of ${name.split('-').join(' ')}`,
        image: `${idx}.png`,
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

        const {
            meta, 
            markup
        } = await createImageXml( name )

        // Set Cors Headers to allow all origins so data can be requested by a browser
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

        // Handle SVG in path
        if ( extension === 'svg' ) {
            res.setHeader('Content-Type', 'image/svg+xml')
            // Set Content-Disposition to inline
            res.setHeader('Content-Disposition', 'inline')

            res.send(markup)

            return
        }

        // console.log(`Nifty!`)

        // Repond with Video JSON Data
        res.json({
            ...meta, 
            markup
        })

    } catch ( error ) {

        console.error('Error', error)

        res.statusCode = 500
            
        res.send('Error')

        return
    }
}