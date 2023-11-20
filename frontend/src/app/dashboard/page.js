'use client'
import styles from "./page.module.css"
import { BarChart, LineChart, PieChart } from "@mui/x-charts"
import ChartCard from "./components/chartcard"

export default function Home() {
    const data = [
        { id: 0, value: 10 },
        { id: 1, value: 15 },
        { id: 2, value: 20 },
        { id: 3, value: 40 },
    ]

    return (
        <div className={styles.grid}>
            <div className={styles.item}>
                <ChartCard />
            </div>
            <div className={styles.item}>
                <ChartCard />
            </div>
            <div className={styles.item}>
                <ChartCard />
            </div>
            <div className={styles.item}>
                <ChartCard />
            </div>
            <div className={styles.item}>
                <ChartCard />
            </div>
        </div>
    )
}