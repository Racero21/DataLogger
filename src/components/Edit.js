import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, Typography } from '@mui/material';
import axios from 'axios';

function Edit({ pack }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({
        minVolt: "",
        maxVolt: "",
        minFlow: "",
        maxFlow: "",
        minPress: "",
        maxPress: "",
        VoltageLimit: "",
        FlowLimit: "",
        PressureLimit: "",
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = async (id) => {
        if (data.minVolt === "") {
            data.minVolt = pack.VoltageLimit?.split(',')[0]
        }
        if (data.maxVolt === "") {
            data.maxVolt = pack.VoltageLimit?.split(',')[1]
        }
        if (data.minFlow === "" && pack.FlowLimit !== null) {
            data.minFlow = pack.FlowLimit?.split(',')[0]
        }
        if (data.maxFlow === "" && pack.FlowLimit !== null) {
            data.maxFlow = pack.FlowLimit?.split(',')[1]
        }
        if (data.minPress === "" && pack.PressureLimit !== null) {
            data.minPress = pack.PressureLimit?.split(',')[0]
        }
        if (data.maxPress === "" && pack.PressureLimit !== null) {
            data.maxPress = pack.PressureLimit?.split(',')[1]
        }

        data.VoltageLimit = data.minVolt + ',' + data.maxVolt
        if (pack.FlowLimit !== null) data.FlowLimit = data.minFlow + ',' + data.maxFlow
        if (pack.PressureLimit!== null) data.PressureLimit = data.minPress + ',' + data.maxPress
        
        console.log(data)
        console.log(pack.toString())
        console.log(pack.LoggerId)
        const query = await axios.patch(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger_limits/` + pack.LoggerId, data)
        const response = query.data;
        console.log(response.data)
    }
    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


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
                            name = 'minVolt'
                            label='Minimum Voltage'
                            placeholder={pack.VoltageLimit.split(',')[0]}
                            onChange={handleInput}
                        />
                        <TextField
                            name = 'maxVolt'
                            label='Maximum Voltage'
                            placeholder={pack.VoltageLimit.split(',')[1]}
                            onChange={handleInput}
                        />
                        {
                            pack.Name.toLowerCase().includes("flow") ?
                                <>
                                    <TextField
                                        name = 'minFlow'
                                        label='Minimum Flow'
                                        placeholder={pack.FlowLimit?.split(',')[0] ?? "Not Set"}
                                        onChange={handleInput}
                                    />
                                    <TextField
                                        name = 'maxFlow'
                                        label='Maximum Flow'
                                        placeholder={pack.FlowLimit?.split(',')[1] ?? "Not Set"}
                                        onChange={handleInput}
                                    />
                                </>
                                :
                                ''
                        }
                        {
                            pack.Name.toLowerCase().includes("pressure") ?
                                <>
                                    <TextField
                                        name = 'minPress'
                                        label='Minimum Pressure'
                                        placeholder={pack.PressureLimit?.split(',')[0] ?? "Not Set"}
                                        onChange={handleInput}
                                    />
                                    <TextField
                                        name = 'maxPress'
                                        label='Maximum Pressure'
                                        placeholder={pack.PressureLimit?.split(',')[1] ?? "Not Set"}
                                        onChange={handleInput}
                                    />
                                </>
                                :
                                ''
                        }


                        <button onClick= {() => handleSubmit()}>Apply</button>
                    </Box>
                </Modal>
            </div>
        </div>
    );
}

export default Edit;