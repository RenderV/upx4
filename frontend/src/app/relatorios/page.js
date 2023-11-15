'use client'
import Dg from './components/dg';
import { useEffect, useState } from 'react';

export default function Pessoa(){
    const [rows, setRows] = useState([])

    useEffect(() => {
      const fn = () => fetch("http://localhost:8000/api/records/").then((response) => {response.json().then((data) => {setRows(data); console.log(data)})})
      fn()
      const interval = setInterval(fn, 1000)
      return () => {
        clearInterval(interval)
      }
    }, []
    )

    return (
      <Dg rows={rows} className="mydatagrid"/>
    )
}