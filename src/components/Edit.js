import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, Typography } from '@mui/material';

function Edit({ pack }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <div>
                {/* LoggerId: {pack.LoggerId} | Name: {pack.Name} | Model: {pack.Model} | Voltage Limit: {pack.VoltageLimit} | Flow Limit: {pack.FlowLimit}  */}
                <button onClick={handleOpen} style={{ fontWeight: "bold" }}>Edit</button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                >
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', height: 'fit-content', rowGap: '20px', width: 'fit-content', margin: 'auto', borderRadius: '5px', padding: '20px', justifyContent: 'space-evenly' }}
                    >
                        {/* <h1>{pack}</h1> */}
                        <Typography variant='h5'>
                            <strong align='center'>{pack.Name.split('_').at(-1).replace('-', ' ')}</strong>
                            <br />
                            {pack.Name.split('_').at(-2)} METER
                        </Typography>
                        <TextField
                            label='Minimum Voltage'
                            placeholder={pack.VoltageLimit.split(',')[0]}
                        />
                        <TextField
                            label='Maximum Voltage'
                            placeholder={pack.VoltageLimit.split(',')[1]}
                        />
                        {
                            pack.Name.toLowerCase().includes("flow") ?
                                <>
                                    <TextField
                                        label='Minimum Flow'
                                        placeholder={pack.VoltageLimit?.split(',')[0] ?? "Not Set"}
                                    />
                                    <TextField
                                        label='Maximum Flow'
                                        placeholder={pack.VoltageLimit?.split(',')[1] ?? "Not Set"}
                                    />
                                </>
                                :
                                ''
                        }
                        {
                            pack.Name.toLowerCase().includes("pressure") ?
                                <>
                                    <TextField
                                        label='Minimum Pressure'
                                        placeholder={pack.PressureLimit?.split(',')[0] ?? "Not Set"}
                                    />
                                    <TextField
                                        label='Maximum Pressure'
                                        placeholder={pack.PressureLimit?.split(',')[1] ?? "Not Set"}
                                    />
                                </>
                                :
                                ''
                        }


                        <button>Apply</button>
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