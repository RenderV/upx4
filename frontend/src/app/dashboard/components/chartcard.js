import { Card, Paper } from "@mui/material"
import { LineChart } from "@mui/x-charts"
export default function ChartCard(){
    return (
            <LineChart
                sx = {{marginTop: '-80px'}}
                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                series={[
                    {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    },
                ]}
            />
    )
}
