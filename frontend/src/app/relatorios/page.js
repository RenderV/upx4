'use client'
import Dg from './components/dg';
import { useEffect, useState } from 'react';

export default function Pessoa() {
    const [rows, setRows] = useState([])

    useEffect(() => {
        const updateRows = () => fetch("http://localhost:8000/api/records/").then((response) => { response.json().then((data) => { setRows(data) }) })
        updateRows()
        const interval = setInterval(updateRows, 1000)
        return () => {
            clearInterval(interval)
        }
    }, []
    )

    const formattedRows = rows.map((row) => {
        const in_date = new Date(row.in_time)
        const in_time = in_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        let out_time = null
        let out_date = null
        let time_diff_str = null

        if (row.out_time) {
            out_date = new Date(row.out_time)
            out_time = out_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        } else {
            out_date = new Date()
        }
        const time_diff = out_date - in_date
        const hours = Math.floor(time_diff / 3600000)
        const minutes = Math.floor((time_diff % 3600000) / 60000)
        const seconds = Math.floor((time_diff % 60000) / 1000)
        const hour_str = hours > 0 ? `${hours.toString().padStart(2, "0")}` : '00'
        const minute_str = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}:` : ':00:'
        const second_str = seconds > 0 ? `${seconds.toString().padStart(2, "0")}` : '00'
        time_diff_str = `${hour_str}${minute_str}${second_str}`
        return {
            ...row,
            in_time: in_time,
            out_time: out_time,
            time_diff: time_diff_str,
            date: new Date(row.in_time).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }),
        }
    })

    return (
        <Dg rows={formattedRows} className="mydatagrid" />
    )
}