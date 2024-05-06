import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Edit from './Edit';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Modal, Box, TextField, Typography } from '@mui/material';

const pollInterval = 1000

function Logger() {
    const [loggers, setLoggers] = useState([]);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    useEffect(() => {
        let dataTimeout = null;
        const fetchData = async(init) => {
            const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)
            setLoggers(loggerResponse.data)
        if(!init) dataTimeout = setTimeout(fetchData, pollInterval)
        }
        fetchData(true)
        dataTimeout = setTimeout(fetchData, pollInterval)
        return () => clearTimeout(dataTimeout)
  }, []);
  
    return (
        <div>
            <h2>Distinct Flow Loggers</h2>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>LoggerId</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>Name&nbsp;</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>Model&nbsp;</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>Voltage Limit&nbsp;(V)</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}>Flow Limit&nbsp;(L/s)</TableCell>
                        <TableCell align="center" sx={{fontWeight:'bold'}}></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {loggers.map((row) => (
                        <TableRow
                        key={row.Name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell align="right">{row.LoggerId}</TableCell>
                        <TableCell align="right">{row.Name}</TableCell>
                        <TableCell align="right">{row.Model}</TableCell>
                        <TableCell align="right">{row.VoltageLimit}</TableCell>
                        <TableCell align="right">{row.FlowLimit}</TableCell>
                        <TableCell align="right"><Edit pack={row} /></TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* {loggers.map((item, index) => (
                    // console.log(item),
                    <Edit pack={item}/>
                    // <li key={index}>
                    // <div>
                    //     LoggerId: {item.LoggerId} | Name: {item.Name} | Model: {item.Model} | Voltage Limit: {item.VoltageLimit} | Flow Limit: {item.FlowLimit} <button onClick={handleOpen}>edit</button>
                    //     <Modal
                    //         open={open}
                    //         onClose={handleClose}
                    //         sx={{display:'flex', justifyContent: 'center'}}
                    //     >
                    //         <Box
                    //             sx={{display:'flex', flexDirection:'column', backgroundColor:'white', height:'fit-content', width:'fit-content', margin:'auto', padding:'20px'}}
                    //         >
                    //         <Typography variant='h5'>
                    //             {item.Name}
                    //         </Typography>
                    //         <TextField
                    //             label='Minimum Voltage'
                    //             placeholder={item.VoltageLimit}
                    //         />
                    //         <TextField
                    //             label='Maximum Voltage'
                    //             placeholder={item.VoltageLimit}
                    //         />
                    //         <TextField
                    //             label='Minimum Flow'
                    //             placeholder={item.VoltageLimit}
                    //         />
                    //         <TextField
                    //             label='Maximum Flow'
                    //             placeholder={item.VoltageLimit}
                    //         />
                            
                    //         <button>apply</button>
                    //         </Box>
                    //     </Modal>
                    // </div>
                        
                    // </li>
                )
                )} */}
            {/* <ol>
                {loggers.map((index, logger) => (
                    <li key={index}>{logger.LoggerId}</li>
                ))}
            </ol> */}
        </div>
    );
}

export default Logger;