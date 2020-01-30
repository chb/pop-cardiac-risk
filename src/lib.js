import React  from "react"
import moment from "moment"

export function query(client, { sql, rowFormat = "object", onPage = (data) => {}}) {
                
    async function handle(obj) {
        await onPage(obj.data);
        if (obj.meta.continue) {
            return getPage(obj.meta.continue)
        }
    }

    function run(body) {
        return client.request({
            url   : "/",
            method: "POST",
            mode  : "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        })
        .then(handle);
    }

    function getPage(id) {
        return client.request({ url: id, mode: "cors" }).then(handle)
    }

    return run({ query: sql, rowFormat });
}

export function getPatientDisplayName(name) {
    return `${name[0].given[0]} ${name[0].family[0]}`;
}

/**
 * Rounds the given number @n using the specified precision.
 * @param {Number|String} n
 * @param {Number} [precision]
 * @param {Number} [fixed] The number of decimal units for fixed precision. For
 *   example `roundToPrecision(2.1, 1, 3)` will produce `"2.100"`, while
 *   `roundToPrecision(2.1, 3)` will produce `2.1`.
 * @returns {Number|String} Returns a number, unless a fixed precision is used
 */
export function roundToPrecision(n, precision, fixed) {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        n = Math.round( n );
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round( n * q ) / q;
    }

    if (fixed) {
        n = Number(n).toFixed(fixed);
    }

    return n;
}

/**
 * 
 * @param {Object}  p
 * @param {string}  p.gender "male" or "female"
 * @param {number}  p.sbp Systolic Blood Pressure
 * @param {number}  p.hsCRP High Sensitivity C-Reactive Protein (hsCRP)
 * @param {number}  p.cholesterol Total Cholesterol
 * @param {number}  p.HDL HDL or "Good" Cholesterol
 * @param {number}  p.age Years (Maximum age must be 80)
 * @param {Boolean} p.smoker
 * @param {Boolean} [p.hha]
 */
export function reynoldsRiskScore(p, precision = 1, fixed = 0) {

    if (!p.gender ||
        !p.age ||
        !p.sbp ||
        !p.hsCRP ||
        !p.cholesterol ||
        !p.HDL)
        return null;

    let result, params;
  
    if (p.gender === "female") {
        params = {
            age        : 0.0799,
            sbp        : 3.137,
            hsCRP      : 0.180,
            cholesterol: 1.382,
            HDL        : -1.172,
            smoker     : 0.818,
            hha        : 0.438
        }
    } else {
        params = {
            age        : 4.385,
            sbp        : 2.607,
            hsCRP      : 0.102,
            cholesterol: 0.963,
            HDL        : -0.772,
            smoker     : 0.405,
            hha        : 0.541
        }
    }
  
    let b1 = params.age          * (p.gender === "female" ? p.age : Math.log(p.age))
      , b2 = params.sbp          * Math.log(p.sbp)
      , b3 = params.hsCRP        * Math.log(p.hsCRP)
      , b4 = params.cholesterol  * Math.log(p.cholesterol)
      , b5 = params.HDL          * Math.log(p.HDL)
      , b6 = params.smoker       * (p.smoker ? 1 : 0)
      , b7 = params.hha          * (p.hha ? 1 : 0);
  
    var B = b1 + b2 + b3 + b4 + b5 + b6 + b7;
  
    if (p.gender === 'female') {
        result = (1 - Math.pow(0.98634, (Math.exp(B-22.325)))) * 100
    } else {
        result = (1 - Math.pow(0.8990,  (Math.exp(B-33.097)))) * 100
    }

    return roundToPrecision(result, precision, fixed);
}

export function avg(records) {
    return records.reduce((prev, cur) => prev + cur.value, 0) / records.length;
}

export function last(records) {
    const index = records.length - 1;
    if (index < 0) return undefined;
    return records[index].value;
}

export function isSmoker(records) {
    const code = last(records);
    return (
        code === "449868002"       || // Current every day smoker
        code === "428041000124106" || // Current some day smoker
        code === "77176002"        || // Smoker, current status unknown
        code === "428071000124103" || // Current Heavy tobacco smoker
        code === "428061000124105"    // Current Light tobacco smoker
    );
}

/**
 * Given a duration, formats it like "2 hours, 35 minutes and 10 seconds"
 * @param {Number} ms The duration as number of milliseconds 
 * @returns {String}
 */
export function formatDuration(ms)
{
    let out = [];
    let meta = [
        { label: "week",   n: 1000 * 60 * 60 * 24 * 7 },
        { label: "day" ,   n: 1000 * 60 * 60 * 24     },
        { label: "hour",   n: 1000 * 60 * 60          },
        { label: "minute", n: 1000 * 60               },
        { label: "second", n: 1000                    }
    ];

    meta.reduce((prev, cur) => {
        let chunk = Math.floor(prev / cur.n);
        if (chunk) {
            out.push(`${chunk} ${cur.label}${chunk > 1 ? "s" : ""}`);
            return prev - chunk * cur.n;
        }
        return prev;
    }, ms);

    if (!out.length) {
        out.push(`0 ${meta.pop().label}s`);
    }

    if (out.length > 1) {
        let last = out.pop();
        out[out.length - 1] += " and " + last;
    }

    return out.join(", ");
}

export function getAge(patient, suffix = "") {
    if (patient.deceasedBoolean) {
        return <span className="label label-warning">deceased</span>;
    }
    if (patient.deceasedDateTime) {
        return <span className="label label-warning">deceased at {
            moment.duration(
                moment(patient.deceasedDateTime).diff(patient.dob, "days"),
                "days"
            ).humanize()
        }</span>;
    }
    return moment.duration(moment().diff(patient.dob, "days"), "days").humanize() + suffix;
}

/**
 * 
 * @param {String} str 
 * @param {String} stringToFind 
 */
export function highlight(str, stringToFind) {
    let temp  = str;
    let index = str.toLocaleLowerCase().indexOf(stringToFind.toLocaleLowerCase());
    while (index > -1) {
        const replacement = `<span class="search-match">${temp.substr(index, stringToFind.length)}</span>`;
        const endIndex = index + stringToFind.length;
        temp  = temp.substring(0, index) + replacement + temp.substring(endIndex);
        index = temp.toLocaleLowerCase().indexOf(stringToFind.toLocaleLowerCase(), index + replacement.length);
    }
    return temp;
}

export function buildClassName(classes)
{
    return Object.keys(classes).filter(c => classes[c]).join(" ");
}
