'use client'

import styles from "./page.module.css"
import { BarChartCard } from "./components/chartcards"
import { useEffect, useState } from "react"
 
async function getData() {
    const response = await fetch(`http://localhost:8000/api/count_last_24h/`, { cache: "no-cache" })
    const data = await response.json()
    return data
}

export default function Home() {
    const [data, setData] = useState({0: 0})

    useEffect(() => {
        const updateInfo = () => getData().then(setData)
        updateInfo()
        const inverval = setInterval(updateInfo, 1000)

        return () => clearInterval(inverval)
    }, [])

    return (
        <div className={styles.grid}>
            <div className={styles.item}>
                <BarChartCard data={data} />
            </div>
        </div>
    )
}