'use client'
import { BarChart, LineChart, PieChart } from "@mui/x-charts"
import styles from "./page.module.css"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography } from "@mui/material";

export default function Home(){
    const darkTheme = createTheme({
        palette: {
        mode: 'dark',
        },
    });
    const data = [
        { id: 0, value: 10},
        { id: 1, value: 15},
        { id: 2, value: 20},
        { id: 3, value: 40},
      ]

    return (
        <div className={styles.mahdiv}>
            <ThemeProvider theme={darkTheme}>
                <div>
                    <BarChart
                        xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                        series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                        width={500}
                        height={300}
                    />
                    <PieChart
                        series={[
                            {
                            data: data,
                            innerRadius: 30,
                            outerRadius: 100,
                            paddingAngle: 5,
                            cornerRadius: 5,
                            startAngle: -90,
                            endAngle: 180,
                            cx: 150,
                            cy: 150,
                            }
                        ]}
                    />
                </div>
                <div>
                    <LineChart
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
            </ThemeProvider>
        </div>
    )
}