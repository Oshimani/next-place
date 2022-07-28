import { NextApiRequest, NextApiResponse } from 'next'

import { Server } from 'socket.io'

import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'

import { differenceInSeconds } from 'date-fns'

import { USER_TIMEOUT_IN_SECONDS } from '../../config/game.config'
import { DatabaseService, IUserLockResult } from '../../lib/mongodb'

import { SocketEvents } from '../../models/events'
import { convertFieldToDbRecord, Coordinates, Field } from '../../models/field'
import { Pixel } from '../../models/pixel'

export const initializeField = (dimX: number, dimY: number) => {
  let f: Field = new Map()
  for (let y = 0; y < dimY; y++) {
    for (let x = 0; x < dimX; x++) {
      f.set({ x, y }, { color: "white" })
    }
  }
  return f
}
const fieldDimmensions = { x: 4, y: 4 }
let field = initializeField(fieldDimmensions.x, fieldDimmensions.y)

const updateField = (coordinates: Coordinates, pixel: Pixel) => {
  if (field) {
    // this does not work???
    field.set(coordinates, pixel)
    return field
  }
  return null
}

let dbService: DatabaseService

const handleUserTryClaimPixel = async (coordinates: Coordinates, pixel: Pixel, userId: string): Promise<[IUserLockResult | null, IUserLockResult | null]> => {
  // check if user may claim pixel
  const lockResult = await dbService.isUserLocked(userId)
  // user is locket and may not claim pixel
  if (lockResult.isLocked) return [null, lockResult]

  // lock user
  const newLockResult = await dbService.lockUser(userId)
  // update field
  field = updateField(coordinates, pixel)!

  // save field to db
  await dbService.updateField(coordinates, pixel)

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
    dbService = DatabaseService.getInstance(process.env.MONGODB_URI!, field)

    io.on(SocketEvents.CONNECT, (socket) => {
      console.log("New User joined:", socket.id)
      // tell everyone else that user joined
      socket.broadcast.emit(SocketEvents.NEW_USER, socket.id)

      // send current field to new user
      console.log("Sending field to user", socket.id)
      io.to(socket.id).emit(SocketEvents.JOIN, { fieldDimmensions, pixels: convertFieldToDbRecord(field) })
      // socket.emit(SocketEvents.JOIN, field)

      // user claims pixel
      socket.on(SocketEvents.CLAIM_PIXEL, async (args: { coordinates: Coordinates, pixel: Pixel }) => {
        const { coordinates, pixel } = args
        console.log(`${socket.id} claimed pixel @(${coordinates.x}|${coordinates.y}) color: ${pixel.color}`)

        // try claim pixel
        const [claimSuccess, claimFail] = await handleUserTryClaimPixel(coordinates, pixel, socket.id)
        if (claimSuccess) {
          // send updated pixel to all users
          io.emit(SocketEvents.UPDATE_PIXEL, { coordinates, pixel })
        }
        else {
          // inform user about remaining timeout
          const remainingTimeout = USER_TIMEOUT_IN_SECONDS - differenceInSeconds(new Date(), claimFail!.created!)
          io.to(socket.id).emit(SocketEvents.CLAIM_PIXEL_FAILED, { remainingTimeout })
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