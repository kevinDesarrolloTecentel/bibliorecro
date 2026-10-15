import { useState } from "react"

export interface EdadGeneroItem {
    
}

const useDashboardEG = () => {
    const [edad, setEdad] = useState<string>('')
    return { edad, setEdad }
}
export default useDashboardEG