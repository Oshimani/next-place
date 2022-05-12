import { ObjectID } from "bson"
import { add } from "date-fns"
import { MongoClient } from "mongodb"

import { FIELD_HEIGHT, FIELD_WIDTH, USER_TIMEOUT_IN_SECONDS } from "../config/game.config"
import { Field } from "../models/field"
import { Pixel } from "../models/pixel"
import { initializeField } from "../pages/api/game"

interface IUserLock {
    _id: ObjectID
    userId: string
    created: Date
}

export interface IUserLockResult extends Partial<IUserLock> {
    isLocked: boolean
}

interface IFieldRecord {
    _id?: ObjectID
    value: Field
}

const DB_NAME = "game"
const USER_LOCKS = "user_locks"
const FIELDS = "fields"

export class DatabaseService {
    private static _client: Promise<MongoClient>
    private static _instance: DatabaseService

    private static _userTimeout: number


    constructor(connectionString: string) {
        DatabaseService._client = new MongoClient(connectionString).connect()
        DatabaseService._initializeDB(USER_TIMEOUT_IN_SECONDS)
    }

    public static getInstance(connectionString: string) {
        if (!DatabaseService._instance)
            DatabaseService._instance = new DatabaseService(connectionString)
        return DatabaseService._instance
    }

    private static async _initializeDB(userTimeoutInSeconds: number) {
        await DatabaseService._initializeIndex(userTimeoutInSeconds)
        await DatabaseService._initializeField(FIELD_WIDTH, FIELD_HEIGHT)
    }

    private static async _initializeField(width: number, height: number) {
        // get exisitng field
        const field = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection<Pixel>(FIELDS)
            .findOne()
        if (field) return field

        // create new field
        const createFieldResult = await (await DatabaseService._client)
            .db(DB_NAME)
            .collection<Pixel>(FIELDS)
            .insertMany(initializeField(width, height).flatMap(p => p))
        return createFieldResult
    }

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
}