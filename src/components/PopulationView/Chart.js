import React          from "react"
import PropTypes      from "prop-types"
import moment         from "moment"
import { withRouter } from "react-router-dom"


class Chart extends React.Component
{
    static propTypes = {
        chartOptions: PropTypes.object.isRequired,
        id          : PropTypes.string.isRequired,
        height      : PropTypes.string,
        history     : PropTypes.object.isRequired
    };

    static defaultProps = {
        height: "400px"
    };

    componentDidMount()
    {    
        const { history } = this.props;
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                type: 'scatter',
                zoomType: 'x',
                // events: {
                //     render(e) {
                //         // console.log(e, this)
                //         // this.hideLoading();
                //         if (!this.series.reduce((a, b) => a + b.data.length, 0)) {
                //             this.showNoData();
                //         } else {
                //             this.hideNoData();
                //         }
                //     },
                //     // selection(e) {
                //     //     console.log(e, this)
                //     // }
                // }
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
                                // console.log(e, this)
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
            lang: {
                noData: "No Data available for the selected criteria"
            }
        });

        this.chart.update(this.props.chartOptions, true, true, false);
        if (!this.props.chartOptions.series.reduce((a, b) => a + b.data.length, 0)) {
            this.chart.showNoData();
        }
    }

    componentDidUpdate() {
        this.chart.hideNoData();
        this.chart.showLoading();
        setTimeout(() => {
            this.chart.series.forEach(s => s.remove(false));
            this.chart.hideNoData();
            this.chart.update(this.props.chartOptions, true, true, false);
            this.chart.hideLoading();
            if (!this.props.chartOptions.series.reduce((a, b) => a + b.data.length, 0)) {
                this.chart.showNoData();
            }
        }, 0);
    }

    render() {
        return <div className="chart" id={this.props.id} style={{
            height      : this.props.height,
            minHeight   : this.props.height,
            marginBottom: 15
        }}/>;
    }
}

export default withRouter(Chart);
