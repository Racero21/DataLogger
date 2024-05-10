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

const pollInterval = 1000

function Logger() {
    const [loggers, setLoggers] = useState([]);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        let dataTimeout = null;
        const fetchData = async (init) => {
            const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)
            setLoggers(loggerResponse.data)
            if (!init) dataTimeout = setTimeout(fetchData, pollInterval)
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
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>LoggerId</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Name&nbsp;</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Model&nbsp;</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Type&nbsp;</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Voltage Limit&nbsp;(<em>V</em>)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Flow Limit&nbsp;(<em>L/s</em>)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Pressure Limit&nbsp;(<em>psi</em>)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loggers.map((row) => (
                            <TableRow
                                key={row.Name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                hover='true'
                            >
                                <TableCell align="left">{row.LoggerId}</TableCell>
                                <TableCell align="left"><strong>{row.Name.split('_').at(-1).replace('-', ' ')}</strong></TableCell>
                                <TableCell align="left">{row.Model}</TableCell>
                                <TableCell align="left">{row.Name.split('_').at(-2)}</TableCell>
                                <TableCell align="right">{row.VoltageLimit ? <> {row.VoltageLimit.split(',')[0]} - {row.VoltageLimit.split(',')[1]} </>
                                    : <strong>Not Set</strong>}
                                </TableCell>
                                <TableCell align="right">{row.FlowLimit ? <> {row.FlowLimit.split(',')[0]} - {row.FlowLimit.split(',')[1]} </>
                                    : (row.Name.toLowerCase().includes("flow") ? <strong>Not Set</strong> : <div style={{ color: '#4444' }}>N/A</div>)}
                                </TableCell>
                                <TableCell align="right">{row.PressureLimit ? <> {row.PressureLimit.split(',')[0]} - {row.PressureLimit.split(',')[1]} </>
                                    : (row.Name.toLowerCase().includes("pressure") ? <strong>Not Set</strong> : <div style={{ color: '#4444' }}>N/A</div>)}
                                </TableCell>
                                <TableCell align="right"><Edit pack={row} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Logger;