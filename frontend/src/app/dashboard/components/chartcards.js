'use client'
import { PieChart, BarChart } from "@mui/x-charts"
import style from "../page.module.css"
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/400.css';

export function BarChartCard({ data, title }) {
    const formattedData = Object.entries(data).map(([key, value]) => {
        var date = new Date(key)
        const day = date.getDay()
        const daymap = {
            0: "Dom",
            1: "Seg",
            2: "Ter",
            3: "Qua",
            4: "Qui",
            5: "Sex",
            6: "Sab",
        }
        const hours = date.getHours()
        const label = `${daymap[day]} ${hours}h`
        return {
            label: label,
            value,
        };
    });

    const valueFormatter = (value) => `${value}`;

    const xAxis = [
        {
            scaleType: 'band',
            dataKey: 'label',
            label: 'horario',
        },
    ];

    const series = [
        {
            dataKey: 'value',
            label: 'Número de carros',
            valueFormatter,
        },
    ];

    return (
        <div className={style.card}>
            <BarChart
                dataset={formattedData}
                xAxis={xAxis}
                series={series}
            />
            <Typography variant="h4" className={style.title}>
                {title}
            </Typography>
        </div>
    );
}

export function PieChartCard({ series, title }) {
    return (
        <div className={style.card}>
            <PieChart series={series} />
            <Typography variant="h4" className={style.title}>
                {title}
            </Typography>
        </div>
    )
}