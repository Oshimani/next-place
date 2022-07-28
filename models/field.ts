import { Pixel } from "./pixel";


export type Coordinates = { x: number, y: number }

export const coordinatesToString = (coordinates: Coordinates) => `${coordinates.x}|${coordinates.y}`

export type Field = Map<Coordinates, Pixel>

export interface IPixelRecord extends Pixel, Coordinates { }

export const convertFieldToDbRecord = (field: Field): Array<IPixelRecord> => {
    const keys = Array.from(field.keys())
    const values = Array.from(field.values())

    let i = 0
    const records: Array<IPixelRecord> = []
    while (i < keys.length) {
        const key = keys[i]
        const value = values[i]
        i++

        records.push({
            ...value,
            x: key.x,
            y: key.y
        })
    }
    return records
}

export const parseFieldDbRecord = (record: Array<IPixelRecord>): Field => {
    const field: Field = new Map()
    record.forEach((pixelRecord: IPixelRecord) => {

        //  remove location from pixel
        const pixel: any = pixelRecord
        delete pixel.location

        field.set({ x: pixelRecord.x, y: pixelRecord.y }, pixel)
    })

    return field
}