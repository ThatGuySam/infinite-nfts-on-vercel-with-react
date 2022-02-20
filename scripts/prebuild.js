import fs from 'fs-extra'
import wordListPath from 'word-list'
// https://github.com/webcaetano/shuffle-seed
import shuffleSeed from 'shuffle-seed'

import { getDeterministicItem } from '../src/helpers/deterministic.js'



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


async function main() {

    // console.log( 'wordListPath', wordListPath )
    const alphaWords = (await fs.readFile(wordListPath, 'utf8')).split('\n')

    // Seed number to set the default order of all words
    const numberForShuffle = 4815162342

    console.log('Shuffling words...')
    await shuffleAndSaveToText({
        list: alphaWords,
        seedNumber: numberForShuffle,
        savePath: './src/assets/built-words'
    })


    const sampleWord = await getDeterministicItem({
        list: './src/assets/words.txt',
        listLength: alphaWords.length,
        seedNumber: numberForShuffle
    })

    console.log('Sample word:', sampleWord)


    console.log('Build completed')

    process.exit()
}

main()
    .then(() => process.exit(0))
