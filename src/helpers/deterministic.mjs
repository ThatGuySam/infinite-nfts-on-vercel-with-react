import nthline from 'nthline'

export async function getDeterministicItem ( options = {} ) {
    const {
        list, 
        listLength, 
        seedNumber
    } = options

    // console.log( 'wordsListPath', wordsListPath )

    const itemIndex = seedNumber % listLength

    console.log('itemIndex', itemIndex, list)
    

    // If data is a string, then assume it's a path to a file
    if (typeof list === 'string') {
        const item = await nthline( itemIndex, list )

        return item
    }

    return list[itemIndex]
}