import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, Colors } from "chart.js";
import { BorderColor, BorderColorOutlined } from "@mui/icons-material";


function DashboardGraphs() {
    // Chart.register(Colors)
    const [barData, setBarData] = useState({});
    const [loading, setLoading] = useState(true)

    // const graphColor = {
    //     t1: '#ffac33', // Electric Orange
    //     t2: '#42A5F5',    // Water Blue
    //     t3: '#f4ff00',
    //     t4: '#4CAF50', // Fresh Green
    //     t5: '#af579f', // Rusty Red
    // }

    const graphColor = [
        '#ffac33',   
        '#42A5F5',
        '#4CAF50',
        '#af579f',
    ]


    const barOptions = {
        aspectRatio: 3,
        maintainAspectRatio: true,
        responsive: true,
        indexAxis: 'x',
        scales: {
            x: {
                type: 'time',
                time: {
                    displayFormats: {
                        day: 'MM/d'
                    },
                    unit: 'day',
                },
            },
        },
        plugins: {
            crosshair: {
                line: {
                    color: '#f66',
                    width: 1,
                    dashPattern: [0, 5]
                },
                zoom: {
                    enabled: false
                },
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: false,
                    },
                    pinch: {
                        enabled: false
                    },
                },
                pan: {
                    enabled: false,
                    mode: 'x',
                },
                limits: {
                    x: {
                        min: 'original',
                        max: 'original'
                    }
                }
            },
            title: {
                font: {
                    size: 20,
                },
                display: true,
                text: ' Totalizer'
            },
            legend: {
                // display: false,
            },
            tooltip: {
                callbacks: {
                    label: (item) => `${item.dataset.label}: ${item.formattedValue} m3`
                },
                // mode: 'x',
                intersect: false
            }
        }
    };

    function parseTime(logTime) {
        const datetime = logTime.slice(0, -1);
        return new Date(datetime);
      }


    useEffect(() => {
        const fetchData = async () => {
            const loggerResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger/`)
            const loggerData = loggerResponse.data;
            const totalizerLogger = {};
            await (async () => {
                for await (const logger of loggerData) {
                    // Skip logger if not flowmeter
                    if (!logger.FlowLimit) continue
                    const loggerId = logger.LoggerId
                    // console.log(loggerId)
                    const testResponse = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/totalizer/${loggerId}`)
                    const testData = testResponse.data
                    totalizerLogger[loggerId] = testData
                    // console.log(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/totalizer/${loggerId}`)
                    // console.log(testData)
                }
            })();
            const datasets = []
            // console.log(Object.keys(totalizerData))
            let counter = 0;
            Object.keys(totalizerLogger).forEach(loggerId => {
                // console.log(totalizerLogger[loggerId])
                datasets.push({
                    label: 'Logger ' + loggerId,
                    data: totalizerLogger[loggerId].map(item => item.DailyFlowPositive),
                    backgroundColor: graphColor[counter%4],
                    stack: `Stack 0`,
                    fill: true,
                    hidden: false,
                })
                counter+=1;
            });
            console.log(totalizerLogger[108173687].map(item => item.DailyFlowPositive));
            let maxTotalizerDaysKey = null;
            Object.keys(totalizerLogger).forEach(loggerId => {
                if (!maxTotalizerDaysKey)
                    maxTotalizerDaysKey = loggerId;
                if (totalizerLogger[loggerId].length > totalizerLogger[maxTotalizerDaysKey].length)
                    maxTotalizerDaysKey = loggerId;
            });
            // console.log(`max ${maxTotalizerDays}`)

            const transformedTotalizerData = {
                // labels: Object.keys(totalizerLogger)?.map(loggerId => 'Logger ' + loggerId),
                labels: totalizerLogger[maxTotalizerDaysKey].map(totalizerLog => parseTime(totalizerLog.Date)),
                datasets: datasets
            }
            console.log(datasets)
            setBarData(transformedTotalizerData)
            setLoading(false);
        };
        fetchData()

    }, []);

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }



    return (
        <>
            <Typography variant="h3">DASHBOARD GRAPHS</Typography>
            <Grid container>
                <Grid item xs={12}>
                    {/* <Typography variant="h4" align="center">Totalizer</Typography> */}
                    <Card sx={{ border: "4px solid #42A5F5" }}>
                        <CardContent>
                            <Bar data={barData} options={barOptions}></Bar>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>

                </Grid>
            </Grid>


        </>
    )
}

export default DashboardGraphs;