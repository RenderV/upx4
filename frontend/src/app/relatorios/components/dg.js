'use client'
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';


export default function Dg({ rows, className }) {

    const columns = [
        { field: 'obj_id', headerName: 'ID', width: 90 },
        { field: 'date', headerName: 'Data', width: 150 },
        {
            field: 'parking_space_label',
            headerName: 'Vaga',
            width: 200,
        },
        {
            field: 'in_time',
            headerName: 'Entrada',
            width: 150,
            editable: false,
        },
        {
            field: 'out_time',
            headerName: 'Saída',
            width: 150,
            editable: false,
        },
        {
            field: 'time_diff',
            headerName: 'Tempo de estadia',
            width: 150,
            editable: false,
        },
        {
            field: 'obj_type',
            headerName: 'Tipo',
            width: 110,
            editable: false,
        },
    ];
    const matches = useMediaQuery('(max-width:900px)')
    return (
        <DataGrid
            sx={{
                borderRadius: matches ? '2rem' : '1.5rem',
            }
            }
            rows={rows}
            className={className}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 20 },
                },
            }}
            pageSizeOptions={[10, 20]}
        />
    )
}