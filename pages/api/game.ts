import { add } from 'date-fns'
import { MongoClient } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import { DatabaseService, IUserLockResult } from '../../lib/mongodb'
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


let dbService: DatabaseService

const handleUserTryClaimPixel = async (pixel: Pixel, userId: string): Promise<[IUserLockResult | null, IUserLockResult | null]> => {
  // check if user may claim pixel
  const lockResult = await dbService.isUserLocked(userId)
  // user is locket and may not claim pixel
  if (lockResult.isLocked) return [null, lockResult]

  // lock user
  const newLockResult = await dbService.lockUser(userId)
  // update field
  field = updateField(pixel)!

  return [newLockResult, null]
}

const SocketHandler = async (req: NextApiRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    // initialize socket
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // initialize db connection
    dbService = DatabaseService.getInstance(process.env.MONGODB_URI!)

    io.on(SocketEvents.CONNECT, (socket) => {
      console.log("New User joined:", socket.id)
      // tell everyone else that user joined
      socket.broadcast.emit(SocketEvents.NEW_USER, socket.id)

      // send current field to new user
      console.log("Sending field to user", socket.id)
      io.to(socket.id).emit(SocketEvents.JOIN, field)
      // socket.emit(SocketEvents.JOIN, field)

      // user claims pixel
      socket.on(SocketEvents.CLAIM_PIXEL, async (pixel: Pixel) => {
        console.log(`${socket.id} claimed pixel @(${pixel.x}|${pixel.y}) color: ${pixel.color}`)

        // try claim pixel
        const [claimSuccess, claimFail] = await handleUserTryClaimPixel(pixel, socket.id)
        if (claimSuccess) {
          // send updated pixel to all users
          io.emit(SocketEvents.UPDATE_PIXEL, pixel)
        }
        else {
          io.to(socket.id).emit(SocketEvents.CLAIM_PIXEL_FAILED, claimFail)
        }
      })
    })

    io.on(SocketEvents.DISCONNECT, (socket) => {

      // tell everyone else that user left
      socket.broadcast.emit(SocketEvents.LEAVE, `${socket.id} left the game`)
    })
  }
  res.end()
}

export default SocketHandler