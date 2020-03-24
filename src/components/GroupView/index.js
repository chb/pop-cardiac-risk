import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router-dom";
import { connect }    from "react-redux";
import moment         from "moment";
import PageHeader     from "../PageHeader";
import config         from "../../config";
import { loadAll }    from "../../store/groups";
import { getAge }     from "../../lib";

const dateFormat = "YYYY-MM-DD";

class Chart extends React.Component
{
    static propTypes = {
        chartOptions   : PropTypes.object.isRequired,
        id             : PropTypes.string.isRequired,
        height         : PropTypes.string,
        history        : PropTypes.object.isRequired,
        patient        : PropTypes.object,
        onPatientSelect: PropTypes.func 
    };

    static defaultProps = {
        height: "216px"
    };

    componentDidMount()
    {    
        const { history } = this.props;
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                zoomType       : "x",
                plotBorderWidth: 1,
                plotBorderColor: "rgba(0, 0, 0, 0.3)",
                marginRight    : 1,
                // events: {
                //     drilldown: (e) => {

                //         if (!e.seriesOptions) {

                //             const point = e.point,
                //                   chart = this.chart,
                //                   patient = point.patient;
                            
                //             let drillDown = {
                //                 name: e.point.patient.name,
                //                 type: "spline",
                //                 color: 'rgb(244, 128, 78)',
                //                 showInLegend: true,
                //                 dashStyle: null,
                //                 // marker: {
                //                 //     symbol: "circle"
                //                 // },
                //                 data: point.series.data.filter(d => d.patient.id === patient.id).map(p => ({
                //                     x: p.x,
                //                     y: p.y,
                //                     patient: p.patient
                //                 })).sort((a, b) => a.x - b.x)
                //             };
        
                //             // Show the loading label
                //             chart.showLoading('Simulating Ajax ...');
        
                //             setTimeout(function () {
                //                 chart.hideLoading();
                //                 chart.addSeriesAsDrilldown(point, drillDown);
                //             }, 1000);
                //         }
                //     }
                // }
            },
            title: {
                text: ""
            },
            xAxis: {
                type             : "datetime",
                lineColor        : "rgba(0, 0, 0, 0)",
                gridLineColor    : "rgba(0, 0, 0, 0.2)",
                gridLineWidth    : "0.5px",
                gridLineDashStyle: "ShortDot"
            },
            yAxis: {
                lineColor        : "rgba(0, 0, 0, 0)",
                gridLineColor    : "rgba(0, 0, 0, 0.2)",
                gridLineWidth    : "0.5px",
                gridLineDashStyle: "ShortDot"
            },
            plotOptions: {
                series: {
                    turboThreshold: 100000,
                    marker: {
                        symbol   : "circle",
                        lineColor: "inherit",
                        lineWidth: 1,
                        radius   : 5
                    },
                },
                scatter: {
                    marker: {
                        radius: 4,
                        symbol: "circle",
                        states: {
                            hover: {
                                enabled  : true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    // dataSorting: {
                    //     enabled: true,
                    //     sortKey: "x"
                    // },
                    point: {
                        events: {
                            click: (e) => {
                                if (this.props.onPatientSelect) {
                                    this.props.onPatientSelect(e.point.patient)
                                }
                                // if (this.patient && this.patient.id) {
                                //     history.push("/groups/" + this.patient.id);
                                // }
                                // console.log(this, e);

                                // this.series.chart.showLoading('Loading...');
                                // setTimeout(() => {

                                    // let drillDown = {
                                    //     name: this.patient.name,
                                    //     type: "spline",
                                    //     color: 'rgba(0, 142, 176, 0.5)',
                                    //     showInLegend: false,
                                    //     dashStyle: null,
                                    //     // marker: {
                                    //     //     symbol: "circle"
                                    //     // },
                                    //     data: this.series.data.filter(d => d.patient.id === this.patient.id).map(p => ({
                                    //         x: p.x,
                                    //         y: p.y,
                                    //         patient: p.patient
                                    //     })).sort((a, b) => a.x - b.x)
                                    // };

                                    // // this.series.chart.hideLoading();
                                    // this.series.chart.addSeriesAsDrilldown(e.point, drillDown);
                                // }, 1000);
                            }
                        }
                    }
                },
                spline: {
                    lineWidth: 2,
                    // marker   : false,
                    dashStyle: "ShortDot",
                    shadow: {
                        color: "#000",
                        offsetX: 0,
                        offsetY: 1,
                        opacity: 0.2,
                        width  : 3
                    }
                }
            },
            tooltip: {
                formatter() {
                    if (this.series.name === "Monthly Average") {
                        return '<span style="color:' + this.point.color +
                            '"> ● </span> Average for ' +
                            moment(this.x).format("MMM YYYY") + '<b>: ' +
                            (Math.round(this.y * 100) / 100) + '</b>';
                    }
                    return '<span style="color:' + this.point.color +
                        '"> ● </span> <b>' + this.point.patient.name + '</b><br>' +
                        moment(this.x).format("YYYY-MM-DD") +
                        ' - <b>' + this.y + '</b><br>Click to select this patient';
                }
            },
            noData: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#930'
                }
            },
            drilldown: {
                series: []
            }
        });

        this.chart.update(this.props.chartOptions, true, true, false);
        // if (!this.props.chartOptions.series.reduce((a, b) => a + b.data.length, 0)) {
        //     this.chart.showNoData();
        // }
    }

    componentDidUpdate() {
        const { patient } = this.props;

        if (patient) {
            let drillDown = {
                name : patient.name,
                type : "spline",
                color: 'rgb(244, 128, 78)',
                showInLegend: false,
                visible: true,
                dashStyle: "Solid",
                marker: {
                    symbol: "circle"
                },
                data: this.chart.series[0].data.filter(d => d.patient.id === patient.id).map(p => ({
                    x: p.x,
                    y: p.y,
                    patient: p.patient
                })).sort((a, b) => a.x - b.x)
            };
            this.chart.series.forEach(s => s.remove(false));
            this.chart.update({ series: [ drillDown ]}, true, true, false);
        } else {
            this.chart.series.forEach(s => s.remove(false));
            this.chart.update(this.props.chartOptions, true, true, false);
        }
    //     this.chart.hideNoData();
    //     this.chart.showLoading();
    //     this.chart.zoomOut();
    //     setTimeout(() => {
    //         this.chart.series.forEach(s => s.remove(false));
    //         this.chart.hideNoData();
    //         this.chart.update(this.props.chartOptions, true, true, false);
    //         this.chart.hideLoading();
    //         if (!this.props.chartOptions.series.reduce((a, b) => a + b.data.length, 0)) {
    //             this.chart.showNoData();
    //         }
    //     }, 0);
    }

    render() {
        return <div id={this.props.id} style={{
            height      : this.props.height,
            minHeight   : this.props.height,
            marginBottom: 15
        }}/>;
    }
}

class GroupView extends React.Component
{
    static propTypes = {
        match  : PropTypes.object.isRequired,
        load   : PropTypes.func.isRequired,
        loading: PropTypes.bool,
        error  : PropTypes.instanceOf(Error),
        data   : PropTypes.any
    };

    constructor(props)
    {
        super(props);
        this.state = {
            startDate: "2010-01-01",
            endDate  : "2017-09-30",
            selectedPatient: null
        };
    }

    componentDidMount()
    {
        this.load();
    }

    componentDidUpdate(prevProps, prevState)
    {
        const { startDate, endDate } = this.state;

        const { condition: oldCondition, groupBy: oldGroupBy } = prevProps.match.params;
        const { condition: newCondition, groupBy: newGroupBy } = this.props.match.params;
        if (
            oldCondition !== newCondition     ||
            oldGroupBy !== newGroupBy         ||
            prevState.startDate !== startDate ||
            prevState.endDate !== endDate
        ) {
            this.load();
        }
    }

    load()
    {
        const { condition, groupBy }   = this.props.match.params;
        const { startDate, endDate }   = this.state;

        let group = config.groups[groupBy][condition];

        this.props.load({
            startDate,
            endDate,
            minAge: group.minAge,
            maxAge: group.maxAge
        });
    }

    renderStage()
    {
        const { data, loading, error, patients } = this.props;
        const { startDate, endDate, selectedPatient }   = this.state;

        if (loading) {
            return (
                <div className="center">
                    <div>
                        <i className="loader"/> Loading...
                    </div>
                </div>
            )
        }

        if (error) {
            return <div className="center">{String(error)}</div>
        }

        const { condition, groupBy }   = this.props.match.params;
        let group = config.groups[groupBy][condition];
        let title = group.label + " patients";

        // SBP -----------------------------------------------------------------
        const seriesSBP = [
            {
                name : "Systolic Blood Pressure",
                type : "scatter",
                color: 'rgba(244, 128, 78, 0.5)',
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgba(0, 142, 176, 1)',
                data   : [],
                type   : "spline",
                marker : false,
                visible: false
            }
        ];

        data.sbp.forEach(rec => {
            const avgKey  = rec.date.substr(0, 8) + "15";
            const avgDate = moment(avgKey).toDate();
            seriesSBP[0].data.push({
                x      : new Date(rec.date),
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesSBP[1].data.find(p => moment(p.x).isSame(avgDate, "month"));
            if (pt) {
                pt.y += rec.value
                pt.count += 1
            } else {
                seriesSBP[1].data.push({
                    x    : avgDate,
                    y    : rec.value,
                    count: 1
                });
            }
        });

        seriesSBP[1].data = seriesSBP[1].data.map(p => ({
            x: p.x,
            y: p.y / p.count
        })).sort((a, b) => a.x - b.x);

        // HDL -----------------------------------------------------------------
        const seriesHDL = [
            {
                name : "HDL",
                type : "scatter",
                color: 'rgba(0, 142, 176, 0.5)',
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgba(244, 128, 78, 1)',
                data   : [],
                type   : "spline",
                marker : false,
                visible: false
            }
        ];

        data.HDL.forEach((rec, i) => {
            const avgKey = rec.date.substr(0, 8) + "15";
            const avgDate = moment(avgKey).toDate();
            seriesHDL[0].data.push({
                x      : new Date(rec.date),
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesHDL[1].data.find(p => moment(p.x).isSame(avgDate, "month"));
            if (pt) {
                pt.y += rec.value
                pt.count += 1
            } else {
                seriesHDL[1].data.push({
                    x: avgDate,
                    y: rec.value,
                    count: 1
                });
            }
        });

        seriesHDL[1].data = seriesHDL[1].data.map(p => ({
            x: p.x,
            y: p.y / p.count
        })).sort((a, b) => a.x - b.x);

        // cholesterol ---------------------------------------------------------
        const seriesCholesterol = [
            {
                name : "Total Cholesterol",
                type : "scatter",
                color: 'rgba(0, 142, 176, 0.5)',
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgba(244, 128, 78, 1)',
                data   : [],
                type   : "spline",
                marker : false,
                visible: false
            }
        ];

        data.cholesterol.forEach((rec, i) => {
            const avgKey = rec.date.substr(0, 8) + "15";
            const avgDate = moment(avgKey).toDate();
            seriesCholesterol[0].data.push({
                x      : new Date(rec.date),
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesCholesterol[1].data.find(p => moment(p.x).isSame(avgDate, "month"));
            if (pt) {
                pt.y += rec.value
                pt.count += 1
            } else {
                seriesCholesterol[1].data.push({
                    x: avgDate,
                    y: rec.value,
                    count: 1
                });
            }
        });

        seriesCholesterol[1].data = seriesCholesterol[1].data.map(p => ({
            x: p.x,
            y: p.y / p.count
        })).sort((a, b) => a.x - b.x);

        let header = null;
        if (selectedPatient) {
            const ageAsString = getAge({
                dob             : selectedPatient.dob,
                deceasedBoolean : selectedPatient.deceasedBoolean,
                deceasedDateTime: selectedPatient.deceasedDateTime
            }, " old");

            header = (
                <div className="text-center">
                    <h3>
                        <b>{ selectedPatient.name }</b> - { ageAsString }, { selectedPatient.gender || "Unknown gender" }
                    </h3>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                        this.setState({ selectedPatient: null });
                    }}>Show all patients</button>
                    <hr/>
                </div>
            );
        }

        return (
            <div className="page-contents">
                { header }
                <h4 className="text-center" style={{ marginBottom: 0 }}>
                    <b>Total cholesterol</b>
                    { selectedPatient ? null : <small className="text-muted"> in { title }</small> }
                </h4>
                <Chart
                    id="chart-cholesterol"
                    history={ this.props.history }
                    patient={ selectedPatient }
                    onPatientSelect={(pt) => this.setState({ selectedPatient: pt })}
                    chartOptions={{
                        xAxis: {
                            min: +moment(startDate),
                            max: +moment(endDate)
                        },
                        yAxis: {
                            floor: 130,
                            softMin: 130,
                            softMax: 320,
                            endOnTick: false,
                            maxPadding: 0,
                            title: {
                                text: "Total Cholesterol"
                            },
                            plotLines: [
                                {
                                    value: 200,
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    dashStyle: "ShortDash",
                                    zIndex: 2
                                },
                                {
                                    value: 240,
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    dashStyle: "ShortDash",
                                    zIndex: 2
                                }
                            ],
                            plotBands: [
                                {
                                    from: 0,
                                    to: 200,
                                    color: 'rgba(0, 255, 0, 0.05)',
                                },
                                {
                                    from: 200,
                                    to: 240,
                                    color: 'rgba(255, 127, 0, 0.05)',
                                },
                                {
                                    from: 240,
                                    to: 320,
                                    color: 'rgba(255, 0, 0, 0.075)',
                                }
                            ]
                        },
                        series: seriesCholesterol
                    }}
                />
                <h4 className="text-center" style={{ marginBottom: 0 }}>
                    <b>HDL</b>
                    { selectedPatient ? null : <small className="text-muted"> in { title }</small> }
                </h4>
                <Chart
                    id="chart-hdl"
                    history={ this.props.history }
                    patient={ selectedPatient }
                    onPatientSelect={(pt) => this.setState({ selectedPatient: pt })}
                    chartOptions={{
                        xAxis: {
                            min: +moment(startDate),
                            max: +moment(endDate)
                        },
                        yAxis: {
                            title: {
                                text: "HDL"
                            },
                            // floor: 20,
                            // ceiling: 120,
                            softMin: 20,
                            softMax: 100,
                            endOnTick: false,
                            maxPadding: 0.1,
                            plotLines: [
                                {
                                    value: 40,
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    dashStyle: "ShortDash",
                                    zIndex: 2
                                },
                                {
                                    value: 60,
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    dashStyle: "ShortDash",
                                    zIndex: 2
                                }
                            ],
                            plotBands: [
                                {
                                    from: 0,
                                    to: 40,
                                    color: 'rgba(255, 0, 0, 0.075)',
                                },
                                {
                                    from: 40,
                                    to: 60,
                                    color: 'rgba(255, 127, 0, 0.05)',
                                },
                                {
                                    from: 60,
                                    to: 100,
                                    color: 'rgba(0, 255, 0, 0.05)',
                                }
                            ]
                        },
                        series: seriesHDL
                    }}
                />
                <h4 className="text-center" style={{ marginBottom: 0 }}>
                    <b>Systolic blood pressure</b>
                    { selectedPatient ? null : <small className="text-muted"> in { title }</small> }
                </h4>
                <Chart
                    id="chart-sbp"
                    history={ this.props.history }
                    patient={ selectedPatient }
                    onPatientSelect={(pt) => this.setState({ selectedPatient: pt })}
                    chartOptions={{
                        xAxis: {
                            min: +moment(startDate),
                            max: +moment(endDate)
                        },
                        yAxis: {
                            title: {
                                text: 'Systolic Blood Pressure'
                            },
                            softMin: 80,
                            softMax: 160,
                            endOnTick: false,
                            maxPadding: 0.1,
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
                                    color: 'rgba(0, 127, 255, 0.05)',
                                },
                                {
                                    from: 100,
                                    to: 140,
                                    color: 'rgba(0, 255, 0, 0.05)',
                                },
                                {
                                    from: 140,
                                    to: 300,
                                    color: 'rgba(255, 0, 0, 0.075)',
                                }
                            ]
                        },
                        series: seriesSBP
                    }}
                />
            </div>
        );
    }

    render()
    {
        const { condition, groupBy }   = this.props.match.params;
        const { startDate, endDate }   = this.state;

        let group = config.groups[groupBy][condition];
        let title = group.label + " patients";

        return (
            <div className="page active">
                <PageHeader
                    title={ title }
                    left="back"
                />
                <header className="text-center sub-header">
                    <div className="row" style={{ width: "100%" }}>
                        <div className="col-xs-6 text-center">
                            <div className="input-group" style={{ maxWidth: "100px", margin: "auto" }}>
                                <span className="input-group-addon"><b>From</b></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    min={ moment().subtract(20, "years").format(dateFormat) }
                                    max={ moment(endDate).subtract(1, "day").format(dateFormat) }
                                    value={ startDate }
                                    onChange={ e => this.setState({ startDate: moment(e.target.valueAsDate).utc().format(dateFormat)}) }
                                />
                            </div>
                        </div>
                        <div className="col-xs-6 text-center" style={{ maxWidth: "100px", margin: "auto" }}>
                            <div className="input-group">
                                <span className="input-group-addon"><b>To</b></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    min={ moment(startDate).add(1, "day").format(dateFormat) }
                                    max={ moment().format(dateFormat) }
                                    value={ endDate }
                                    onChange={ e => this.setState({ endDate: moment(e.target.valueAsDate).utc().format(dateFormat)}) }
                                />
                            </div>
                        </div>
                    </div>
                </header>
                { this.renderStage() }
            </div>
        );
    }
}

const ConnectedGroupView = connect(
    state => ({
        loading : state.groups.loading,
        error   : state.groups.error,
        data    : state.groups.data,
        patients: state.patients.idIndex
    }),
    dispatch => ({
        load: options => dispatch(loadAll(options))
    })
)(GroupView);

export default withRouter(ConnectedGroupView);
