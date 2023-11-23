'use client'
import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useMediaQuery } from '@mui/material';

// Function to fetch data from the API
async function getData() {
  const url = 'http://localhost:8000/api/records_by_parking_space/';
  const res = await fetch(url);
  return await res.json();
}

// Updated Row component to render the data from the API
function Row(props: { row: any }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.label}
        </TableCell>
        <TableCell align="right">{row.camera}</TableCell>
        {/* Include other TableCell components for additional fields */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Vehicle
              </Typography>
              {/* Modify this section to display the record_set data */}
              <Table size="small" aria-label="vehicles">
                <TableHead>
                  <TableRow>
                    <TableCell>In Time</TableCell>
                    <TableCell>Out Time</TableCell>
                    <TableCell>Vehicle Id</TableCell>
                    <TableCell align="right">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Map through the record_set data */}
                  {row.record_set.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        {vehicle.in_time ? new Date(vehicle.in_time).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell>
                        {vehicle.out_time ? new Date(vehicle.out_time).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell>{vehicle.obj_id}</TableCell>
                      <TableCell align="right">{vehicle.obj_type}</TableCell>
                      {/* Include other TableCell components for additional fields */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function Page() {
  const matches = useMediaQuery('(max-width:900px)');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch data when the component mounts
    async function fetchData() {
      try {
        const apiData = await getData();
        setData(apiData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ /* your table container styles */ }}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Parking Space</TableCell>
            {/* Include other Table header cells */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}