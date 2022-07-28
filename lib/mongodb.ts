import { ObjectID } from "bson"
import { add } from "date-fns"
import { MongoClient } from "mongodb"

import { USER_TIMEOUT_IN_SECONDS } from "../config/game.config"
import { IPixel } from "../models/field"

interface IUserLock {
    _id: ObjectID
    userId: string
    created: Date
}

export interface IUserLockResult extends Partial<IUserLock> {
    isLocked: boolean
}


const DB_NAME = "game"
const USER_LOCKS = "user_locks"
const PIXELS = "pixels"

export class DatabaseService {
    private static _client: Promise<MongoClient>
    private static _instance: DatabaseService

    private static _userTimeout: number


    constructor(connectionString: string, pixels: Array<IPixel>) {
        DatabaseService._client = new MongoClient(connectionString).connect()
        DatabaseService._initializeDB(USER_TIMEOUT_IN_SECONDS, pixels)
    }

    public static getInstance(connectionString: string,  pixels: Array<IPixel>) {
        if (!DatabaseService._instance)
            DatabaseService._instance = new DatabaseService(connectionString, pixels)
        return DatabaseService._instance
    }

    private static async _initializeDB(userTimeoutInSeconds: number,  pixels: Array<IPixel>) {
        await DatabaseService._initializeIndex(userTimeoutInSeconds)
        await DatabaseService._initializeField(pixels)
    }

    private static async _initializeField( pixels: Array<IPixel>) {
        // get exisitng field
        try {
            const existingField = await (await DatabaseService._client)
                .db(DB_NAME)
                .collection<IPixel>(PIXELS)
                .find()
            if ((await existingField.toArray()).length > 0)
                return existingField
        } catch (error) {
            console.error(error)
        }

        // create new field
        try {
            const createFieldResult = await (await DatabaseService._client)
                .db(DB_NAME)
                .collection(PIXELS)
                .insertMany(pixels)
            return createFieldResult
        } catch (error) {
            console.error(error)
        }
    }


    //#region USER FUNCTIONS
    private static async _initializeIndex(userTimeoutInSeconds: number) {
        DatabaseService._userTimeout = userTimeoutInSeconds
        // search cleanup index
        const indexExists = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection<IUserLock>(USER_LOCKS)
            .indexExists("auto_cleanup_index")


        if (indexExists) return
        console.log(`Did not find existing index, creating new`, userTimeoutInSeconds);

        // create cleanup index
        const createIndexResult = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection<IUserLock>(USER_LOCKS)
            .createIndex({ created: 1 }, { expireAfterSeconds: userTimeoutInSeconds, name: "auto_cleanup_index" })
        console.log("Index created", createIndexResult)
    }

    public async lockUser(userId: string): Promise<IUserLockResult> {
        const result = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection(USER_LOCKS)
            .insertOne({ userId, created: new Date() })
        console.log(`Locked ${userId} @ ${new Date().toLocaleTimeString()} for ${DatabaseService._userTimeout} seconds`)

        return { _id: result.insertedId, userId, isLocked: true }
    }

    public async isUserLocked(userId: string): Promise<IUserLockResult> {
        const result = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection(USER_LOCKS)
            .find<IUserLock>({ userId })
            .sort({ created: -1 })
            .limit(1)

        if (await result.hasNext()) {
            const lock = await result.next()
            // mongo cleanup routine is not precise
            // need to check if timeout has run out
            if (add(lock!.created, { seconds: USER_TIMEOUT_IN_SECONDS }) > new Date()) {
                console.log("User is locked untill", add(lock!.created, { seconds: DatabaseService._userTimeout }))
                return ({
                    ...lock,
                    isLocked: true
                })
            }
        }

        console.log(`${userId} is not locked`)
        return { isLocked: false }
    }

    public async unlockUser(userId: string): Promise<void> {
        const result = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection(USER_LOCKS)
            .findOneAndDelete({ userId })
    }
    //#endregion

    //#region FIELD FUNCTIONS
    public async updateField(pixel: IPixel) {
        const { x, y, color } = pixel
        try {
            const updateResult = await (await DatabaseService._client)
                .db(DB_NAME)
                .collection(PIXELS)
                .updateOne({ x, y }, { $set: { color } })
            return updateResult
        } catch (error) {
            console.error(error)
        }
    }
    //#endregion
}