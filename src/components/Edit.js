import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Box, TextField, Typography } from '@mui/material';

function Edit({pack}) {
    // const [loggers, setLoggers] = useState([]);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // console.log(pack)
 
    
    return (
        <div>
                    <div>
                        {/* LoggerId: {pack.LoggerId} | Name: {pack.Name} | Model: {pack.Model} | Voltage Limit: {pack.VoltageLimit} | Flow Limit: {pack.FlowLimit}  */}
                        <button onClick={handleOpen}>edit</button> 
                        <Modal
                            open={open}
                            onClose={handleClose}
                            sx={{display:'flex', justifyContent: 'center'}}    
                        >
                            <Box
                                sx={{display:'flex', flexDirection:'column',  backgroundColor:'white', height:'45%', width:'fit-content', margin:'auto', padding:'20px', justifyContent:'space-evenly'}}
                            >
                                {/* <h1>{pack}</h1> */}
                            <Typography variant='h5'>
                                {pack.Name}
                            </Typography>
                            <TextField
                                label='Minimum Voltage'
                                placeholder={pack.VoltageLimit}
                            />
                            <TextField
                                label='Maximum Voltage'
                                placeholder={pack.VoltageLimit}
                            />
                            <TextField
                                label='Minimum Flow'
                                placeholder={pack.VoltageLimit}
                            />
                            <TextField
                                label='Maximum Flow'
                                placeholder={pack.VoltageLimit}
                            />
                            
                            <button>apply</button>
                            </Box>
                        </Modal>
                    </div>
            {/* <ol>
                {loggers.map((index, logger) => (
                    <li key={index}>{logger.LoggerId}</li>
                ))}
            </ol> */}
        </div>
    );
}

export default Edit;