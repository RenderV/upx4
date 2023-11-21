import { Card, Paper } from "@mui/material"
import { LineChart, PieChart } from "@mui/x-charts"
import style from "../page.module.css"
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/400.css';

export function LineChartCard({ xAxis, series, title }) {
    return (
        <div className={style.card}>
            <LineChart
                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                series={[
                    {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                    },
                ]}
            />
            <Typography variant="h4" className={style.title}>
                {title}
            </Typography>
        </div>
    )
}

export function PieChartCard({ series, title }) {
    return (
        <div className={style.card}>
            <PieChart series={series}/>
            <Typography variant="h4" className={style.title}>
                {title}
            </Typography>
        </div>
    )
}