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
        patient        : PropTypes.object,
        onPatientSelect: PropTypes.func 
    };

    static defaultProps = {
        height: "206px"
    };

    componentDidMount()
    {    
        // @ts-ignore
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                zoomType       : "x",
                plotBorderWidth: 1,
                plotBorderColor: "rgba(0, 0, 0, 0.3)",
                marginRight    : 1,
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
                    animation: false,
                    turboThreshold: 100000,
                    marker: {
                        symbol   : "circle",
                        lineColor: "inherit",
                        lineWidth: 1,
                        radius   : 5
                    },
                },
                scatter: {
                    color: 'rgba(0, 142, 176, 0.5)',
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
                    point: {
                        events: {
                            click: (e) => {
                                if (this.props.onPatientSelect) {
                                    this.props.onPatientSelect(e.point.patient)
                                }
                            }
                        }
                    }
                },
                spline: {
                    lineWidth: 2,
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
        // this.chart.showLoading();
        if (patient) {
            let drillDown = {
                name : patient.name,
                type : "spline",
                // color: 'rgb(244, 128, 78)',
                color: 'rgb(0, 142, 176)',
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

            const tooltip = {
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
                        ' - <b>' + this.y + '</b>';
                }
            }
            // this.chart.series.forEach(s => s.remove(false));
            this.chart.update({
                tooltip,
                series: [ drillDown ],
            }, true, false, false);
        } else {
            // this.chart.series.forEach(s => s.remove(false));
            this.chart.update(this.props.chartOptions, true, false, false);
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
        }} className="custom-chart"/>;
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

        const { groupID: oldCondition, groupBy: oldGroupBy } = prevProps.match.params;
        const { groupID: newCondition, groupBy: newGroupBy } = this.props.match.params;
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
        const { groupID, groupBy }   = this.props.match.params;
        const { startDate, endDate }   = this.state;

        let group = config.groups[groupBy][groupID];

        const options = {
            startDate,
            endDate
        };

        if (groupBy === "gender") {
            options.gender = groupID === "f" ? "female" : "male";
        } else {
            options.minAge = group.minAge;
            options.maxAge = group.maxAge;
        }

        this.props.load(options);
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

        const { groupID, groupBy }   = this.props.match.params;
        let group = config.groups[groupBy][groupID];
        let title = group.label + " patients";

        // SBP -----------------------------------------------------------------
        const seriesSBP = [
            {
                name : "Systolic Blood Pressure",
                type : "scatter",
                color: 'rgba(0, 142, 176, 0.5)',
                showInLegend: true,
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgb(244, 128, 78)',
                data   : [],
                type   : "spline",
                dashStyle: "ShortDot",
                marker : false,
                visible: false
            }
        ];

        data.sbp.forEach(rec => {
            const avgYear  = rec.date.getFullYear();
            const avgMonth = rec.date.getMonth();
            const avgDate  = new Date(avgYear, avgMonth, 15);

            seriesSBP[0].data.push({
                x      : rec.date,
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesSBP[1].data.find(
                p => p.x.getFullYear() === avgYear && p.x.getMonth() === avgMonth
            );
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
        }));

        // HDL -----------------------------------------------------------------
        const seriesHDL = [
            {
                name : "HDL",
                type : "scatter",
                color: 'rgba(0, 142, 176, 0.5)',
                showInLegend: true,
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgba(244, 128, 78, 1)',
                dashStyle: "ShortDot",
                data   : [],
                type   : "spline",
                marker : false,
                visible: false
            }
        ];

        data.HDL.forEach((rec, i) => {
            const avgYear  = rec.date.getFullYear();
            const avgMonth = rec.date.getMonth();
            const avgDate  = new Date(avgYear, avgMonth, 15);

            seriesHDL[0].data.push({
                x      : rec.date,
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesHDL[1].data.find(
                p => p.x.getFullYear() === avgYear && p.x.getMonth() === avgMonth
            );
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
        }));

        // cholesterol ---------------------------------------------------------
        const seriesCholesterol = [
            {
                name : "Total Cholesterol",
                type : "scatter",
                color: 'rgba(0, 142, 176, 0.5)',
                showInLegend: true,
                data : []
            },
            {
                name   : "Monthly Average",
                color  : 'rgba(244, 128, 78, 1)',
                data   : [],
                type   : "spline",
                dashStyle: "ShortDot",
                marker : false,
                visible: false
            }
        ];

        data.cholesterol.forEach((rec, i) => {
            const avgYear  = rec.date.getFullYear();
            const avgMonth = rec.date.getMonth();
            const avgDate  = new Date(avgYear, avgMonth, 15);

            seriesCholesterol[0].data.push({
                x      : rec.date,
                y      : rec.value,
                patient: patients[rec.patient]
            });

            let pt = seriesCholesterol[1].data.find(
                p => p.x.getFullYear() === avgYear && p.x.getMonth() === avgMonth
            );
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
        }));

        let header = null;
        if (selectedPatient) {
            const ageAsString = getAge({
                dob             : selectedPatient.dob,
                deceasedBoolean : selectedPatient.deceasedBoolean,
                deceasedDateTime: selectedPatient.deceasedDateTime
            }, " old");

            header = (
                <>
                <div className="row">
                    <div className="col-lg-6 text-center">
                        <h3 style={{ marginTop: 0 }}>
                            <i className="glyphicon glyphicon-user"/> <b>{ selectedPatient.name }</b> - { ageAsString }, { selectedPatient.gender || "Unknown gender" }
                        </h3>
                    </div>
                    <div className="col-lg-6 text-center">
                        <h3 style={{ marginTop: 0 }}>
                            <div className="btn-group btn-group-justified">
                                <button type="button" className="btn btn-default" style={{ width: "14em" }} onClick={() => this.setState({ selectedPatient: null })}>
                                    <i className="glyphicon glyphicon-signal"/> Show all patients
                                </button>
                                <button type="button" className="btn btn-default" style={{ width: "14em" }} onClick={() => this.props.history.push("/" + selectedPatient.id)}>
                                    <i className="glyphicon glyphicon-dashboard"/> Cardiac Risk Calculator
                                </button>
                            </div>
                        </h3>
                    </div>
                </div>
                <hr style={{ margin: "5px 0" }}/>
                </>
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
                            tickInterval: 50,
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
                            tickInterval: 25,
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
                            softMax: 200,
                            endOnTick: false,
                            maxPadding: 0.1,
                            tickInterval: 10,
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
        const { groupID, groupBy }   = this.props.match.params;
        const { startDate, endDate }   = this.state;

        let group = config.groups[groupBy][groupID];
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
