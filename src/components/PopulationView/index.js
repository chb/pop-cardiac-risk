import React          from "react"
import PropTypes      from "prop-types"
import { connect }    from "react-redux"
import { withRouter } from "react-router-dom"
import moment         from "moment"
import ClientContext  from "../../ClientContext"
import { query }      from "../../lib"
import "./PopulationView.scss"


// -----------------------------------------------------------------------------

export class Chart extends React.Component
{
    static propTypes = {
        chartOptions: PropTypes.object.isRequired,
        id          : PropTypes.string.isRequired,
        loaded      : PropTypes.bool,
        height      : PropTypes.string
    };

    static defaultProps = {
        height: "400px"
    };

    // getPatientById(id)
    // {

    // }

    componentDidMount()
    {    
        const { history } = this.props;
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                type: 'scatter',
                zoomType: 'x',
                events: {
                    render(e) {
                        // console.log(e, this)
                        this.hideLoading();
                    },
                    selection(e) {
                        console.log(e, this)
                    }
                }
            },
            // accessibility: {
            //     description: 'A scatter plot compares the height and weight of 507 individuals by gender. Height in centimeters is plotted on the X-axis and weight in kilograms is plotted on the Y-axis. The chart is interactive, and each data point can be hovered over to expose the height and weight data for each individual. The scatter plot is fairly evenly divided by gender with females dominating the left-hand side of the chart and males dominating the right-hand side. The height data for females ranges from 147.2 to 182.9 centimeters with the greatest concentration between 160 and 165 centimeters. The weight data for females ranges from 42 to 105.2 kilograms with the greatest concentration at around 60 kilograms. The height data for males ranges from 157.2 to 198.1 centimeters with the greatest concentration between 175 and 180 centimeters. The weight data for males ranges from 53.9 to 116.4 kilograms with the greatest concentration at around 80 kilograms.'
            // },
            // title: {
            //     text: 'hsCRP by Gender'
            // },
            // subtitle: {
            //     text: 'Source: Heinz  2003'
            // },
            xAxis: {
                // title: {
                //     enabled: true,
                //     text: 'Date'
                // },
                // startOnTick: true,
                // endOnTick: true,
                // showLastLabel: true,
                type: "datetime"
            },
            // yAxis: {
            //     title: {
            //         text: 'hsCRP'
            //     }
            // },
            // legend: {
            //     symbolRadius: 10
            //     layout: 'vertical',
            //     align: 'left',
            //     verticalAlign: 'top',
            //     x: 100,
            //     y: 70,
            //     floating: true,
            //     // backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
            //     borderWidth: 1
            // },
            plotOptions: {
                series: {
                    turboThreshold: 100000,
                },
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    point: {
                        events: {
                            // render(e) {
                            //     // console.log(e, this)
                            //     this.hideLoading();
                            // },
                            click(e) {
                                console.log(e, this)
                                if (this.patient && this.patient.id) {
                                    history.push("/" + this.patient.id)
                                }
                            }
                        }
                    }
                    // states: {
                    //     hover: {
                    //         marker: {
                    //             enabled: false
                    //         }
                    //     }
                    // },
                    // opacity: 0.5
                    // tooltip: {
                    //     // headerFormat: '<b>{series.name}</b><br>',
                    //     // pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>",
                    //     xDateFormat: "%Y %m %d"
                    //     // pointFormatter: point => {
                    //     //     console.log(point);
                    //     //     return '<span><b>' +
                    //     //         moment(point.x).format("YYYY-MM-DD") +
                    //     //         "</b>:  " + point.y + "</span>";
                    //     // }
                    // }
                },
                // spline: {
                //     tooltip: {
                //         // headerFormat: '<b>{series.name}</b><br>',
                //         // pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>",
                //         // xDateFormat: "%Y %m %d",
                //         // pointFormatter: point => {
                //         //     console.log(point);
                //         //     return '<span><b>' +
                //         //         moment(point.x).format("YYYY-MM-DD") +
                //         //         "</b>:  " + point.y + "</span>";
                //         // }
                //         formatter() {
                //             // console.log(this, arguments)
                //             return '<span style="color:' + this.point.color +
                //                 '"> ● </span> <b> Average for ' + moment(this.x).format("mm YYYY") + '</b><br>' +
                //                 this.y;
                //         }
                //     }
                // }
            },
            tooltip: {
                // headerFormat: '<b>{series.name}</b><br>',
                // pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>",
                // xDateFormat: "%Y %m %d",
                // pointFormatter: point => {
                //     console.log(point);
                //     return '<span><b>' +
                //         moment(point.x).format("YYYY-MM-DD") +
                //         "</b>:  " + point.y + "</span>";
                // }
                formatter() {
                    // console.log(this, arguments)
                    if (this.series.name === "Monthly Average") {
                        return '<span style="color:' + this.point.color +
                            '"> ● </span> Average for ' +
                            moment(this.x).format("MMM YYYY") + '<b>: ' +
                            (Math.round(this.y * 100) / 100) + '</b>';
                    }
                    return '<span style="color:' + this.point.color +
                        '"> ● </span> <b>' + this.point.name + '</b><br>' +
                        moment(this.x).format("YYYY-MM-DD") +
                        ' - <b>' + this.y + '</b>';
                }
            },
            noData: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#930'
                }
            },
            lang: {
                noData: "No Data available for the selected criteria"
            }
        });

        // this.chart.hideNoData();
        // this.chart.showLoading();
        // this.chart.series.forEach(s => s.remove(false));
        this.chart.update(this.props.chartOptions, true, true, false);
    }

    componentDidUpdate() {
        // this.chart.showLoading();
        this.chart.series.forEach(s => s.remove(false));
        this.chart.update(this.props.chartOptions, true, true, false);
        // if (this.props.loaded) {
        //     this.chart.hideLoading();
        //     if (!this.chart.series[0].points.length) {
        //         this.chart.showNoData();
        //     }
        // }
    }

    render() {
        return <div className="chart" id={this.props.id} style={{
            height      : this.props.height,
            minHeight   : this.props.height,
            marginBottom: 15
        }}/>;
    }
}

// -----------------------------------------------------------------------------

export class PopulationViewHeader extends React.Component
{
    static propTypes = {
        startDate: PropTypes.any,
        endDate  : PropTypes.any,
        groupBy  : PropTypes.string
    };

    static defaultProps = {
        startDate: moment().subtract(2, "years"),
        endDate  : moment(),
        groupBy  : "gender"
    };

    constructor(props)
    {
        super(props);

        this.state = {
            startDate: this.props.startDate,
            endDate  : this.props.endDate,
            groupBy  : this.props.groupBy
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e)
    {
        e.preventDefault();
        if (typeof this.props.onSubmit == "function") {
            this.props.onSubmit(this.state);
        }
    }

    render()
    {
        const dateFormat = "YYYY-MM-DD";
        const { startDate, endDate, groupBy } = this.state;

        return (
            <header className="text-center">
                <form onSubmit={ this.onSubmit }>
                    <div className="row">
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>From</label>
                            <input
                                type="date"
                                className="form-control"
                                // min={ moment().subtract(10, "years").format(dateFormat) }
                                max={ moment(endDate).subtract(1, "day").format(dateFormat) }
                                value={ startDate.format(dateFormat) }
                                onChange={ e => this.setState({ startDate: moment(e.target.valueAsDate )}) }
                            />
                        </div>
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>To</label>
                            <input
                                type="date"
                                className="form-control"
                                min={ moment(startDate).add(1, "day").format(dateFormat) }
                                // max={ moment().format(dateFormat) }
                                value={ endDate.format(dateFormat) }
                                onChange={ e => this.setState({ endDate: moment(e.target.valueAsDate )}) }
                            />
                        </div>
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>Group By</label>
                            <select
                                className="form-control"
                                value={groupBy}
                                onChange={ e => this.setState({ groupBy: e.target.value }) }
                            >
                                <option value="none">None</option>
                                <option value="gender">Gender</option>
                                <option value="age">Age</option>
                                <option value="race">Race</option>
                            </select>
                        </div>
                        <div className="col-xs-6 col-sm-3">
                            <label>&nbsp;</label>
                            <button type="submit" className="btn btn-primary btn-small btn-block">Apply</button>
                        </div>
                    </div>
                </form>
            </header>
        );
    }
}
// -----------------------------------------------------------------------------

export class PopulationView extends React.Component
{
    static propTypes = {
        patientsLoading: PropTypes.bool,
        patientsError  : PropTypes.instanceOf(Error),
        patientsData   : PropTypes.arrayOf(PropTypes.object)
    };

    constructor(props)
    {
        super(props)
        this.state = {
            observations: [],
            observationsLoading: null,
            startDate: moment().subtract(5, "years"),
            endDate: moment(),
            groupBy: "gender"
        }
    }

    fetch()
    {
        this.fetched = true;
        let observations = [];
        this.setState({ observationsLoading: true });

        // const startDate = +this.state.startDate//.format("YYYY-MM-DD");

        query(this.props.client, {
            sql: `SELECT
                'hsCRP'                 AS observationType,
                '{valueQuantity.value}' AS observationValue,
                '{effectiveDateTime}'   AS effectiveDateTime,
                '{subject.reference}'   AS patient
            FROM Observation
            WHERE 
                '{code.coding[0].system}' = 'http://loinc.org' AND
                '{code.coding[0].code}'   = '30522-7'

            UNION SELECT
                'totalCholesterol'      AS observationType,
                '{valueQuantity.value}' AS observationValue,
                '{effectiveDateTime}'   AS effectiveDateTime,
                '{subject.reference}'   AS patient
            FROM Observation
            WHERE 
                '{code.coding[0].system}' = 'http://loinc.org'
                AND (
                    '{code.coding[0].code}' = '14647-2' OR
                    '{code.coding[0].code}' = '2093-3'
                )
                
            UNION SELECT
                'HDL'                   AS observationType,
                '{valueQuantity.value}' AS observationValue,
                '{effectiveDateTime}'   AS effectiveDateTime,
                '{subject.reference}'   AS patient
            FROM Observation
            WHERE 
                '{code.coding[0].system}' = 'http://loinc.org' AND
                '{code.coding[0].code}'   = '2085-9'
                
            UNION SELECT
                'sbp'                   AS observationType,
                '{{component[0].valueQuantity.value}}' AS observationValue,
                '{effectiveDateTime}'   AS effectiveDateTime,
                '{subject.reference}'   AS patient
            FROM Observation
            WHERE
                '{code.coding[0].system}' = 'http://loinc.org'
                AND (
                    '{code.coding[0].code}' = '55284-4'
                )`,
            onPage: (data) => {
                observations = observations.concat(data);
            }
        }).then(() => {
            this.setState({ observationsLoading: false, observations });
        });
    }

    getSeriesForObservationType(type, asNumbers = false)
    {
        let series = [];

        switch (this.state.groupBy)
        {
            case "gender":
                series.push({
                    name: 'Female',
                    color: 'rgba(127, 0, 64, .3)',
                    showInLegend: true,
                    marker: {
                        symbol: "circle"
                    },
                    data: []
                }, {
                    name: 'Male',
                    color: 'rgba(0, 0, 127, .3)',
                    showInLegend: true,
                    marker: {
                        symbol: "circle"
                    },
                    data: []
                });
            break;
            case "age":
                series.push(
                    { name: '0 - 10' , showInLegend: true, data: [], marker: { symbol: "circle" } },
                    { name: '10 - 20', showInLegend: true, data: [], marker: { symbol: "circle" } },
                    { name: '20 - 40', showInLegend: true, data: [], marker: { symbol: "circle" } },
                    { name: '40 - 60', showInLegend: true, data: [], marker: { symbol: "circle" } },
                    { name: '60 - 80', showInLegend: true, data: [], marker: { symbol: "circle" } },
                    { name: '80+'    , showInLegend: true, data: [], marker: { symbol: "circle" } }
                );
            break;
            default:
                series.push({
                    name: "",
                    color: 'rgba(0, 0, 0, .5)',
                    data: [],
                    showInLegend: false,
                    marker: { symbol: "circle" }
                });
            break;
        }

        const avgSeries = {
            name: "Monthly Average",
            color: 'rgb(0, 220, 0)',
            data: [],
            type: "spline",
            shadow: {
                color: "#000",
                offsetX: 0,
                offsetY: 1,
                opacity: 0.3,
                width: 4
            }
            // dashStyle: "ShortDot",
            // lineWidth: 0.5
            // showInLegend: false,
            // marker: { symbol: "circle" }
            
        };

        const avg = {};

        
        this.state.observations.forEach(rec => {
            if (rec.observationType !== type) {
                return;
            }

            let _x = moment(rec.effectiveDateTime);

            if (this.state.startDate.isAfter(_x)) {
                return;
            }

            if (this.state.endDate.isBefore(_x)) {
                return;
            }

            let pt = this.props.patientsData.find(p => `Patient/${p.id}` === rec.patient);

            if (!pt) {
                return;
            }

            const x = _x.toDate();
            const y = +rec.observationValue;

            let key = _x.format("YYYY-MM");
            if (!avg[key]) avg[key] = [];
            avg[key].push(y)

            // const point = asNumbers ? [+x, y] : { x, y, name: pt.name };
            const point = { x, y, name: pt.name, patient: pt };

            if (this.state.groupBy === "gender") {
                if (pt.gender === "female") {
                    series[0].data.push(point);
                }
                else if (pt.gender === "male") {
                    series[1].data.push(point);
                }
            } else if (this.state.groupBy === "age") {
                const age = moment().diff(pt.dob, "years");
                if (age < 10) {
                    series[0].data.push(point);
                }
                else if (age < 20) {
                    series[1].data.push(point);
                }
                else if (age < 40) {
                    series[2].data.push(point);
                }
                else if (age < 60) {
                    series[3].data.push(point);
                }
                else if (age < 80) {
                    series[4].data.push(point);
                }
                else {
                    series[5].data.push(point);
                }
            } else {
                series[0].data.push(point);
            }
        });

        avgSeries.data = Object.keys(avg).map(key => {
            return {
                x: moment(key + "-15").toDate(),
                y: avg[key].reduce((prev, cur) => prev + cur, 0) / (avg[key].length || 1)
            };
        }).sort((a, b) => (+(a.x) - (+(b.x))));

        series.push(avgSeries);

        return series;
    }

    renderCRP()
    {
        const series = this.getSeriesForObservationType("hsCRP");
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));
        return (
            <Chart id="hsCRP" history={this.props.history} height="300px" loaded={!this.state.observationsLoading} chartOptions={{
                title: {
                    text: 'hsCRP by Gender'
                },
                xAxis: {
                    min: +this.state.startDate,
                    max: +this.state.endDate
                },
                yAxis: {
                    title: {
                        text: 'hsCRP'
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius
                        }
                    }
                },
                series
            }} />
        )
    }

    renderSBP()
    {
        const series = this.getSeriesForObservationType("sbp", true);
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));
        return (
            <Chart id="sbp" history={this.props.history} loaded={!this.state.observationsLoading} chartOptions={{
                title: {
                    text: 'Systolic Blood Pressure by Gender'
                },
                xAxis: {
                    min: +this.state.startDate,
                    max: +this.state.endDate
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

    renderTotalCholesterol()
    {
        const series = this.getSeriesForObservationType("totalCholesterol");
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));
        return (
            <Chart id="totalCholesterol" history={this.props.history} loaded={!this.state.observationsLoading} chartOptions={{
                title: {
                    text: 'Total Cholesterol by Gender'
                },
                yAxis: {
                    title: {
                        text: 'Total Cholesterol'
                    }
                },
                xAxis: {
                    min: +this.state.startDate,
                    max: +this.state.endDate
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius
                        }
                    }
                },
                series
            }} />
        )
    }

    renderHDL()
    {
        const series = this.getSeriesForObservationType("HDL");
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));
        return (
            <Chart id="HDL" history={this.props.history} loaded={!this.state.observationsLoading} chartOptions={{
                title: {
                    text: 'HDL by Gender'
                },
                xAxis: {
                    min: +this.state.startDate,
                    max: +this.state.endDate
                },
                yAxis: {
                    title: {
                        text: 'HDL'
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius
                        }
                    }
                },
                series
            }} />
        )
    }

    renderCharts()
    {
        if (!this.fetched) {
            setTimeout(() => this.fetch(), 0)
        }

        if (this.state.observationsLoading) {
            return (
                <div className="center">
                    <div>
                        <i className="loader"/> Loading observations...
                    </div>
                </div>
            );
        }

        if (!this.state.observations.length) {
            return <div className="center">No observations found</div>
        }

        return (
            <>
                { this.renderCRP() }
                { this.renderTotalCholesterol() }
                { this.renderHDL() }
                { this.renderSBP() }
            </>
        )
    }

    render()
    {
        const { patientsLoading, patientsError, patientsData } = this.props;

        if (patientsLoading) {
            return (
                <div className="center" style={{ color: "#FFF" }}>
                    <div>
                        <i className="loader"/> Loading patients...
                    </div>
                </div>
            )
        }

        if (patientsError) {
            return <div className="center">{String(patientsError)}</div>
        }

        if (!patientsData.length) {
            return <div className="center">No patients found</div>
        }

        return (
            <div className="page population-view active">
                <div>
                    {/* <h1>Population Dashboard</h1> */}
                    <PopulationViewHeader
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                        onSubmit={ data => this.setState(data) }
                    />
                    { this.renderCharts() }
                </div>
            </div>
        );
    }
}

class Wrapper extends React.Component
{
    // shouldComponentUpdate(nextProps)
    // {
    //     const oldId = this.props.match.params.id;
    //     const newId = nextProps.match.params.id;
    //     return !!newId || !(!!oldId && !newId)
    // }

    render()
    {
        const { id } = this.props.match.params;
        return (
            <ClientContext.Consumer>
                { client => <PopulationView { ...this.props } client={ client }/> }
            </ClientContext.Consumer>
        );
    }
}

const ConnectedPopulationView = connect(state => ({
    patientsLoading: state.patients.loading,
    patientsError  : state.patients.error,
    patientsData   : state.patients.data
  }))(Wrapper);

export default withRouter(ConnectedPopulationView);
