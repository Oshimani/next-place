import { createContext } from "react";
import { Socket } from "socket.io-client";

interface IAppContext { selectedColor: string | null, setSelectedColor: any, socket: Socket | null }

const AppContext = createContext<IAppContext>({ selectedColor: null, setSelectedColor: null, socket: null })

export default AppContext