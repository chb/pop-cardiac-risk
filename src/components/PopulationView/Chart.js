import React          from "react"
import PropTypes      from "prop-types"
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
        height: "300px"
    };

    componentDidMount()
    {    
        const { history } = this.props;
        this.chart = window.Highcharts.chart(this.props.id, {
            chart: {
                zoomType       : 'x',
                plotBorderWidth: 1,
                plotBorderColor: "rgba(0, 0, 0, 0.3)",
                marginRight: 1,
            },
            xAxis: {
                type: "datetime",
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
                        radius: 5,
                        states: {
                            hover: {
                                enabled  : true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    point: {
                        events: {
                            click() {
                                if (this.patient && this.patient.id) {
                                    history.push("/groups/" + this.patient.id)
                                }
                            }
                        }
                    },
                    series: {
                        color: "#000",
                    }
                },
                spline: {
                    lineWidth: 4,
                    shadow: {
                        offsetY: 3,
                        width  : 5,
                        opacity: 0.05
                    }
                }
            },
            noData: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#930'
                }
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
        this.chart.zoomOut();
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
