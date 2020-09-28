import React     from "react";
import PropTypes from "prop-types";


export default class Chart extends React.Component
{
    static propTypes = {
        chartOptions: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired
    };

    componentDidMount()
    {
        // @ts-ignore
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                type               : "spline",
                borderWidth        : 1,
                borderColor        : "#EEE",
                plotBackgroundColor: "#F6F6F6",
                plotBorderColor    : "#DDD",
                plotBorderWidth    : 1,
                zoomType           : "x"
            },
            xAxis: {
                type: 'datetime'
            },
            legend: {
                enabled: false
            },
        });

        this.chart.update(this.props.chartOptions, true, true, false);
    }

    componentDidUpdate()
    {
        this.chart.update(this.props.chartOptions, true, true);
    }

    render()
    {
        return <div className="chart" id={this.props.id} style={{
            width       : "22vw",
            height      : 220,
            marginBottom: 15
        }}/>;
    }
}
