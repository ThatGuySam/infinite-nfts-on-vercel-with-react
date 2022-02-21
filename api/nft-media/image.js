import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'

import { getDeterministicItem } from '../../src/helpers/deterministic.js'

import paths from '../../src/assets/built-path-references.json'


console.log('built-path-references', paths)

const imageListPath = `${ paths.imageUrlList }.txt`
const imageMetaPath = `${ paths.imageUrlList }-meta.json`


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
    'Content-Type': 'image/jpeg', 
    'Content-Disposition': 'inline'
}


export default async function (req, res) {

    
    try {

        // Get path from url
        const { 
            name: multiverseAlbumNumber
        } = path.parse( req.query.path )

        // Get an image from the multiverse album number
        const imageUrl = await getDeterministicItem({
            list: imageListPath,
            listLength: (await fs.readJson( imageMetaPath )).total,
            seedNumber: multiverseAlbumNumber
        })

        // Set headers
        for ( const [key, value] of Object.entries(successHeaders)) {
            res.setHeader(key, value)
        }


        const imageResponse = await axios.get( imageUrl, {
            responseType: 'stream'
        })
        

        console.log('Streaming image...', imageUrl)

        imageResponse.data.pipe(res)

        // Wait for stream to finish
        await new Promise(function(resolve, reject) {
            res.on('end', () => resolve())
            imageResponse.data.on('error', reject) // or something like that. might need to close `hash`
        })

        return

    } catch ( error ) {

        console.error('Error', error)

        res.statusCode = 500
            
        res.send('Error')

        return
    }
}