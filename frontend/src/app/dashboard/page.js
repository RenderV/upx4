'use client'
import styles from "./page.module.css"
import { BarChart, LineChart, PieChart } from "@mui/x-charts"
import {LineChartCard, PieChartCard} from "./components/chartcards"

export default function Home() {
    const xAxis = [{ data: [1, 2, 3, 5, 8, 10] }];
    const series = [
        {
            data: [2, 5.5, 2, 8.5, 1.5, 5],
        },
    ]

    const pieSeries = [
        {
            data: [
                { id: 0, value: 10, label: 'series A' },
                { id: 1, value: 15, label: 'series B' },
                { id: 2, value: 20, label: 'series C' },
            ],
        },
    ]

    return (
        <div className={styles.grid}>
            <div className={styles.item}>
                <LineChartCard xAxis={xAxis} series={series} title={"test"} />
            </div>
            <div className={styles.item}>
                <PieChartCard series={pieSeries} title={"test"}/>
            </div>
        </div>
    )
}