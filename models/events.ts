export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",

    JOIN = "user-join",
    LEAVE = "user-leave",

    CLAIM_PIXEL = "claim-pixel", // user tries to claim pixel
    CLAIM_PIXEL_FAILED = "claim-pixel-failed", // server rejected pixel claim due to pending timeout
    UPDATE_PIXEL = "update-pixel", // server updated pixel after claim

    NEW_USER = "new-user"
}
