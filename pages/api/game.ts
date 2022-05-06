import { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import { SocketEvents } from '../../models/events'
import { Field } from '../../models/field'
import { Pixel } from '../../models/pixel'

const initializeField = (dimX: number, dimY: number) => {
  let f: Field = []
  for (let y = 0; y < dimY; y++) {
    let row: Array<Pixel> = []
    for (let x = 0; x < dimX; x++) {
      row = [...row, { x, y, color: "white" }]
    }
    f = [...f, row]
  }
  return f
}

let field = initializeField(64, 64)

const updateField = (pixel: Pixel) => {
  if (field) {
      const { x, y, color } = pixel
      field[y][x].color = color
      return [...field]
  }
  return null
}

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on(SocketEvents.CONNECT, (socket) => {

      // send current field to new user
      socket.emit(SocketEvents.JOIN, field)

      // user claims pixel
      socket.on(SocketEvents.CLAIM_PIXEL, (pixel: Pixel) => {
        field = updateField(pixel)!
        // send updated pixel to all users
        socket.broadcast.emit(SocketEvents.UPDATE_PIXEL, pixel)
      })
    })

    io.on(SocketEvents.DISCONNECT, (socket) => {

      // tell everyone that user left
      socket.broadcast.emit(SocketEvents.LEAVE, "<username> left")
    })
  }
  res.end()
}

export default SocketHandler