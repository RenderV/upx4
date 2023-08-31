'use client'
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export default function Dg({rows, className}){
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const columns = [
      { field: 'id', headerName: 'ID', width: 90 },
      {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: false,
      },
      {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: false,
      },
      {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: false,
      },
      {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (params) =>
          `${params.row.firstName || ''} ${params.row.lastName || ''}`,
      },
    ]
    return (
        <ThemeProvider theme={darkTheme}>
        <DataGrid
          rows={rows}
          className={className}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[10, 20]}
          checkboxSelection
        />
        </ThemeProvider>
    )
}