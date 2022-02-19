import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'


const layersDirectory = 'src/layers'


const getAllLayers = () => {
    return glob.sync(`${ layersDirectory }/**`)
}



const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- head -->
        <!-- hair -->
        <!-- eyes -->
        <!-- nose -->
        <!-- mouth -->
        <!-- beard -->
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



async function createImageXml (idx) {

    const bg = randInt(5);
    const hair = randInt(7);
    const eyes = randInt(9);
    const nose = randInt(4); 
    const mouth = randInt(5);
    const beard = randInt(3);
    // 18,900 combinations

    // const face = [hair, eyes, mouth, nose, beard].join('');

    const name = getRandomName()
    console.log(name)
    // face[takenFaces] = face;

    const parts = {
        '<!-- bg -->': `bg${bg}`,
        '<!-- head -->': `head0`,
        '<!-- hair -->': `hair${hair}`,
        '<!-- eyes -->': `eyes${eyes}`,
        '<!-- nose -->': `nose${nose}`,
        '<!-- mouth -->': `mouth${mouth}`,
        '<!-- beard -->': `beard${beard}`,
    }

    let workingString = template;

    for ( const [key, value] of Object.entries(parts)) {
        const layerMarkup = await getLayer(value)

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
        const { ext } = path.parse( req.url )
        // Trim dot from extension
        const extension = ext.substring(1)

        const {
            meta, 
            markup
        } = await createImageXml( 33 )

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
            meta,
            layers: getAllLayers(),
        })

    } catch ( error ) {

        console.error('Error', error)

        res.statusCode = 500
            
        res.send('Error')

        return
    }
}