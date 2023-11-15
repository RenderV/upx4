'use client'
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

function convertTimeFormat(timeString) {
  const timeComponents = timeString.split(':');

  const hours = parseInt(timeComponents[0], 10);
  const minutes = parseInt(timeComponents[1], 10);
  const secondsAndMicroseconds = timeComponents[2].split('.');
  const seconds = parseInt(secondsAndMicroseconds[0], 10);
  const milliseconds = parseInt(secondsAndMicroseconds[1], 10);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  date.setMilliseconds(milliseconds);

  const formattedTime = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

  return formattedTime;
}


export default function Dg({rows, className}){

    const columns = [
      { field: 'obj_id', headerName: 'ID', width: 90 },
      {
        field: 'in_time',
        headerName: 'Entrada',
        width: 150,
        editable: false,
      },
      {
        field: 'out_time',
        headerName: 'Saída',
        editable: false,
      },
      {
        field: 'obj_type',
        headerName: 'Tipo',
        width: 110,
        editable: false,
      },
      {
        field: 'parking_space',
        headerName: 'parkingSpace',
        description: 'This column has a value getter and is not sortable.',
        width: 160,
      },
    ];
    const matches = useMediaQuery('(max-width:900px)')
    return (
        <DataGrid
          sx = {{
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