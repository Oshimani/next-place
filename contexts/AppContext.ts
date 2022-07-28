import { createContext } from "react";
import { Socket } from "socket.io-client";

interface IAppContext {
    selectedColor: string, setSelectedColor: any,
    socket: Socket | null,
    fieldDimmensions: { x: number, y: number } | null, setFieldDimmensions: any
}

const AppContext = createContext<IAppContext>(
    {
        selectedColor: "black", setSelectedColor: null,
        socket: null,
        fieldDimmensions: null, setFieldDimmensions: null
    })

export default AppContext