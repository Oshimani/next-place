

export type Coordinates = { x: number, y: number }

export interface IPixel extends Coordinates { color: string }


export const updateField = (previousField: Array<IPixel>, pixel: IPixel) => {
    if (previousField) {
        // update item where x and y are equal to coordinates
        const newField = previousField.map(p =>
        (p.x === pixel.x && p.y === pixel.y ?
            { ...p, color: pixel.color } :
            p
        ))
        return newField
    }
    return null
}