import moment from "moment"


export function getObservationSeries(data, { groupBy, patients, idIndex })
{
    let series = [];

    switch (groupBy)
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
    };

    const avg = {};

    data.forEach(rec => {
        let _x = moment(rec.effectiveDateTime);

        // let pt = patients.find(p => `Patient/${p.id}` === rec.patient);
        // let pt = patients.get(rec.patient.split(/:|\//).pop());
        let ptId = rec.patient.split(/:|\//).pop();
        let pt = idIndex ?
            patients[idIndex[ptId]] :
            patients.find(p => p.id === ptId);

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

        if (groupBy === "gender") {
            if (pt.gender === "female") {
                series[0].data.push(point);
            }
            else if (pt.gender === "male") {
                series[1].data.push(point);
            }
        } else if (groupBy === "age") {
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
