import React                    from "react"
import PropTypes                from "prop-types"
import { connect }              from "react-redux"
import Chart                    from "./Chart"
import { load }                 from "../../store/totalCholesterol"
import { getObservationSeries } from "./lib"


class TotalCholesterolChart extends React.Component
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
            <Chart id="totalCholesterol" chartOptions={{
                title: {
                    text: 'Total Cholesterol by Gender'
                },
                xAxis: {
                    min: +startDate,
                    max: +endDate
                },
                yAxis: {
                    title: {
                        text: 'Total Cholesterol'
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
}

const ConnectedChart = connect(
    state => ({
        error   : state.totalCholesterol.error,
        data    : state.totalCholesterol.data,
        patients: state.patients.data,
        idIndex : state.patients.idIndex
    }),
    dispatch => ({
        load: (range) => dispatch(load(range))
    })
)(TotalCholesterolChart);

export default ConnectedChart;
