import React                    from "react"
import PropTypes                from "prop-types"
import { connect }              from "react-redux"
import Chart                    from "./Chart"
import { load }                 from "../../store/sbp"
import { getObservationSeries } from "./lib"
import moment from "moment"


class SBPChart extends React.Component
{
    static propTypes = {
        error    : PropTypes.instanceOf(Error),
        data     : PropTypes.arrayOf(PropTypes.object),
        patients : PropTypes.arrayOf(PropTypes.object),
        startDate: PropTypes.object,
        endDate  : PropTypes.object,
        groupBy  : PropTypes.string,
        load     : PropTypes.func.isRequired
    };

    static defaultProps = {
        groupBy: "none"
    };

    componentDidMount()
    {
        this._isMounted = true;
        this.props.load({
            startDate: this.props.startDate.format("YYYY-MM-DD"),
            endDate  : this.props.endDate.format("YYYY-MM-DD")
        });
    }

    shouldComponentUpdate(newProps)
    {
        const startDate = newProps.startDate.format("YYYY-MM-DD");
        const endDate   = newProps.endDate.format("YYYY-MM-DD");

        if (startDate !== this.props.startDate.format("YYYY-MM-DD") ||
            endDate !== this.props.endDate.format("YYYY-MM-DD")) {
            this.props.load({ startDate, endDate });
            return false;
        }
        return true;
    }

    render()
    {
        const { startDate, endDate, error, data, groupBy, patients, idIndex } = this.props;

        if (error) {
            return <div className="chart center">{ String(error) }</div>
        }

        const series = getObservationSeries(data, { groupBy, patients, idIndex });
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));
        return (
            <Chart id="SBP" chartOptions={{
                title: {
                    text: 'Systolic Blood Pressure by Gender'
                },
                xAxis: {
                    min: +moment(startDate),
                    max: +moment(endDate)
                },
                yAxis: {
                    title: {
                        text: 'Systolic Blood Pressure'
                    },
                    plotLines: [
                        {
                            value: 100,
                            color: 'rgba(0, 0, 0, 0.3)',
                            dashStyle: "ShortDash",
                            zIndex: 2
                        },
                        {
                            value: 140,
                            color: 'rgba(0, 0, 0, 0.3)',
                            dashStyle: "ShortDash",
                            zIndex: 2
                        }
                    ],
                    plotBands: [
                        {
                            from: 0,
                            to: 100,
                            color: 'rgba(68, 170, 213, 0.1)',
                            // borderColor: "#000",
                            // borderWidth: 1
                            // label: {
                            //     text: 'Low',
                            //     style: {
                            //         color: '#606060'
                            //     }
                            // }
                        },
                        {
                            from: 100,
                            to: 140,
                            color: 'rgba(68, 213, 82, 0.1)',
                            // label: {
                            //     text: 'Normal',
                            //     style: {
                            //         color: '#606060'
                            //     }
                            // }
                        },
                        {
                            from: 140,
                            to: 300,
                            color: 'rgba(213, 68, 68, 0.1)',
                            // label: {
                            //     text: 'High',
                            //     style: {
                            //         color: '#606060'
                            //     }
                            // }
                        }
                    ]
                },
                plotOptions: {
                    series: {
                        turboThreshold: 100000,
                        cluster: {
                            enabled: false,
                            minimumClusterSize: 5,
                            allowOverlap: false,
                            // animation: false,
                            layoutAlgorithm: {
                                type: 'grid',
                                gridSize: 40
                            },
                            marker: {
                                // fillColor: '#ffcccc',
                                radius: 10,
                                symbol: "circle"
                            },
                        //     dataLabels: {
                        //         style: {
                        //             fontSize: '8px'
                        //         },
                        //         // y: -1
                        //     },
                            zones: [{
                                from: 100,
                                to: 140,
                                marker: {
                                    fillColor: '#ffcccc',
                                    // radius: 6
                                }
                            }],
                            // , {
                        //     //     from: 110,
                        //     //     to: 120,
                        //     //     marker: {
                        //     //         fillColor: '#ff9999',
                        //     //         radius: 8
                        //     //     }
                        //     // }, {
                        //     //     from: 120,
                        //     //     to: 130,
                        //     //     marker: {
                        //     //         fillColor: '#ff6666',
                        //     //         radius: 10
                        //     //     }
                        //     // }, {
                        //     //     from: 130,
                        //     //     to: 140,
                        //     //     marker: {
                        //     //         fillColor: '#ff3333',
                        //     //         radius: 16
                        //     //     }
                        //     // }, {
                        //     //     from: 140,
                        //     //     to: 200,
                        //     //     marker: {
                        //     //         fillColor: '#e60000',
                        //     //         radius: 20
                        //     //     }
                        //     // }]
                        }
                    },
                    scatter: {
                        // pointInterval: 1,
                        // pointIntervalUnit: "month",
                        marker: {
                            radius
                        }
                    }
                },
                series
            }} />
        )
    }
}

const ConnectedChart = connect(
    state => ({
        error    : state.sbp.error,
        data     : state.sbp.data,
        patients : state.patients.data,
        idIndex  : state.sbp.idIndex
    }),
    dispatch => ({
        load: (range) => dispatch(load(range))
    })
)(SBPChart);

export default ConnectedChart;