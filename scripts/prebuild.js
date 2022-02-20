import fs from 'fs-extra'
import wordListPath from 'word-list'
// https://github.com/webcaetano/shuffle-seed
import shuffleSeed from 'shuffle-seed'
import { XMLParser } from 'fast-xml-parser'

import { getDeterministicItem } from '../src/helpers/deterministic.js'
import { parseUnsplashImgixUrl } from '../src/helpers/urls.js'


const xmlParser = new XMLParser()


async function shuffleAndSaveToText ( options = {} ) {
    const {
        list, 
        seedNumber,
        savePath
    } = options

    const shuffledList = shuffleSeed.shuffle(list, seedNumber)

    // Write the data to a file
    await fs.writeFile(`${savePath}.txt` , shuffledList.join('\n'))

    // Save the meta data as well
    await fs.writeJSON(`${savePath}-meta.json`, {
        total: shuffledList.length,
    })

    return
}

const paths = {}

paths.gitIgnoredPrefix = 'built'
paths.assets = './src/assets'
paths.wordsList = `${ paths.assets }/${ paths.gitIgnoredPrefix }-words`
paths.imageUrlXml = `${ paths.assets }/image-urls.xml`
paths.imageUrlList = `${ paths.assets }/${ paths.gitIgnoredPrefix }-image-urls`


async function main() {

    // console.log( 'wordListPath', wordListPath )
    const alphaWords = (await fs.readFile(wordListPath, 'utf8')).split('\n')

    // Seed number to set the default order of all words
    const numberForShuffle = 4815162342

    console.log('Shuffling words...')
    await shuffleAndSaveToText({
        list: alphaWords,
        seedNumber: numberForShuffle,
        savePath: paths.wordsList
    })


    const sampleWord = await getDeterministicItem({
        list: `${ paths.wordsList }.txt`, 
        listLength: alphaWords.length,
        seedNumber: numberForShuffle
    })

    console.log('Sample word:', sampleWord)


    // Get our image xml
    console.log('Getting image xml...')
    const imageXML = await fs.readFile( paths.imageUrlXml, 'utf8')
    const {
        urlset
    } = xmlParser.parse(imageXML)

    // Map the image urls to an array
    const imageURLs = urlset.url.map(url => {
        const imgixUrl = url['image:image']['image:loc']
        return parseUnsplashImgixUrl(imgixUrl)
    })

    console.log('Shuffling image urls...')
    await shuffleAndSaveToText({
        list: imageURLs,
        seedNumber: numberForShuffle,
        savePath: paths.imageUrlList
    })

    const sampleImageUrl = await getDeterministicItem({
        list: `${ paths.imageUrlList }.txt`, 
        listLength: imageURLs.length,
        seedNumber: numberForShuffle
    })

    console.log('Sample image url:', sampleImageUrl)


    // Save paths to meta data
    await fs.writeJSON(`${ paths.assets }/${ paths.gitIgnoredPrefix }-path-references.json`, paths)


    console.log('Build completed')

    process.exit()
}

main()
