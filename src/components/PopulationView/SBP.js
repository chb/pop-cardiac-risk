import React                    from "react"
import PropTypes                from "prop-types"
import { connect }              from "react-redux"
import Chart                    from "./Chart"
import { load }                 from "../../store/sbp"
import { getObservationSeries } from "./lib"
import moment from "moment"

const baseChartOptions = {
    title: {
        text: "Systolic Blood Pressure"
    },
    xAxis: {
        min: null,
        max: null
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
    tooltip: {
        formatter() {
            if (this.series.name === "Monthly Average") {
                return '<span style="color:' + this.point.color +
                    '"> ● </span> Average for ' +
                    moment(this.x).format("MMM YYYY") + '<b>: ' +
                    (Math.round(this.y * 100) / 100) + '</b>';
            }
            return '<span style="color:' + this.point.color +
                '"> ● </span> <b>' + this.point.name + '</b><br>' +
                moment(this.x).format("YYYY-MM-DD") +
                ' - <b>' + this.y + '</b><br>Click to select this patient';
        }
    }
}


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
            endDate  : this.props.endDate.format("YYYY-MM-DD"),
            patientId: this.props.patientId
        });
    }

    shouldComponentUpdate(newProps)
    {
        const startDate = newProps.startDate.format("YYYY-MM-DD");
        const endDate   = newProps.endDate.format("YYYY-MM-DD");

        if (newProps.patientId !== this.props.patientId ||
            startDate !== this.props.startDate.format("YYYY-MM-DD") ||
            endDate !== this.props.endDate.format("YYYY-MM-DD")) {
            this.props.load({ startDate, endDate, patientId: newProps.patientId });
            return false;
        }
        return true;
    }

    renderForPatient()
    {
        let { data, patients, patientId } = this.props;

        let pt = patients.find(p => p.id === patientId);

        if (!pt) {
            return "Patient not found";
        }

        const series = [{
            type : "spline",
            name : "Systolic Blood Pressure",
            color: "#008eb0",
            data: data.map(o => ({
                x: moment(o.effectiveDateTime).toDate(),
                y: +o.observationValue
            })),//.sort((a, b) => a.x - b.x),
            showInLegend: false,
            marker: {
                fillColor: "#7ac5de",
                lineColor: "#008eb0"
            }
        }];

        return (
            <Chart id="SBP" chartOptions={{
                ...baseChartOptions,
                series,
                tooltip: {
                    formatter() {
                        return '<span style="color:' + this.point.color +
                            '"> ● </span> <b>' + pt.name + '</b><br>' +
                            moment(this.x).format("YYYY-MM-DD") +
                            ' - <b>' + this.y + '</b>';
                    }
                }
            }} />
        )
    }

    render()
    {
        const { startDate, endDate, error, data, groupBy, patients, idIndex, patientId } = this.props;

        if (error) {
            return <div className="chart center">{ String(error) }</div>
        }

        if (patientId) {
            return this.renderForPatient();
        }

        const series = getObservationSeries(data, { groupBy, patients, idIndex });
        const len = series.reduce((prev, cur) => prev + cur.data.length, 0);
        const radius = Math.max(2, 6 - Math.ceil(len / 1000));

        let title = "Systolic Blood Pressure";
        if (groupBy === "gender") {
            title += " by Gender";
        }
        else if (groupBy === "age") {
            title += " by Age";
        }

        return (
            <Chart id="SBP" chartOptions={{
                ...baseChartOptions,
                title: {
                    text: title
                },
                xAxis: {
                    min: +moment(startDate),
                    max: +moment(endDate)
                },
                plotOptions: {
                    ...baseChartOptions.plotOptions,
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
}

const ConnectedChart = connect(
    state => ({
        error    : state.sbp.error,
        data     : state.sbp.data,
        patients : state.patients.data,
        idIndex  : state.sbp.idIndex
    }),
    dispatch => ({
        load: options => dispatch(load(options))
    })
)(SBPChart);

export default ConnectedChart;
