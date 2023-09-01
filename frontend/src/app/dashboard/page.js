'use client'
import { BarChart, LineChart, PieChart } from "@mui/x-charts"
import styles from "./page.module.css"

export default function Home(){
    const data = [
        { id: 0, value: 10},
        { id: 1, value: 15},
        { id: 2, value: 20},
        { id: 3, value: 40},
      ]

    return (
        <div className={styles.grid}>
            <div className={styles.item_1}>
                <h1>Dashboard</h1>
                <LineChart
                    sx = {{marginTop: '-80px'}}
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                        {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                        },
                    ]}
                    width={500}
                    height={300}
                />
            </div>
        </div>
    )
}