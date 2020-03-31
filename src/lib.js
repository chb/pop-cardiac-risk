import React  from "react"
import moment from "moment"

export function query({
    sql,
    rowFormat = "object",
    maxRows = 10000,
    onPage = (data) => {}}) {
                
    async function handle(obj) {
        await onPage(obj.data);
        if (obj.meta.continue) {
            return getPage(obj.meta.continue)
        }
    }

    function run(body) {
        // @ts-ignore
        return window.SMARTClient.request({
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
        // @ts-ignore
        return window.SMARTClient.request({
            url: id,
            mode: "cors"
        }).then(handle)
    }

    return run({ query: sql, rowFormat, maxRows });
}

export function makeArray(x) {
    return Array.isArray(x) ? x : [x];
}

export function getPatientDisplayName(name) {

    try {
        return `${makeArray(name[0].given)[0]} ${makeArray(name[0].family)[0]}`;
    } catch {
        return `NO NAME`
    }
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

/**
 * 
 * @param {Object}   options
 * @param {string}   options.gender male|female|m|M|f|F
 * @param {number}   options.sbp Systolic Blood Pressure
 * @param {boolean}  options.africanAmerican
 * @param {number}   options.totalCholesterol Total Cholesterol
 * @param {number}   options.hdl HDL or "Good" Cholesterol
 * @param {number}   options.age Years (Maximum age must be 79)
 * @param {boolean}  [options.smoker]
 * @param {boolean}  [options.diabetes]
 * @param {boolean}  [options.hypertensionTreatment]
 */
export function calcASCVD(options, precision = 1, fixed = 0)
{    
    // const required = ["age", "totalCholesterol", "hdl", "sbp", "africanAmerican", "gender"];
    // for( const param of required) {
    //     if (options[param] === undefined) {
    //         throw new Error(`"${param}" option is required`);
    //         // return NaN;
    //     }
    // }

    const {
        age,
        totalCholesterol,
        hdl,
        sbp,
        hypertensionTreatment,
        africanAmerican,
        gender,
        diabetes,
        smoker
    } = options;

    const logAge = Math.log(age);
    const logTCH = Math.log(totalCholesterol);
    const logHDL = Math.log(hdl);
    const logSBP = Math.log(sbp);

    let s0_10, mnxb, prediction = 0;

    if (String(gender).charAt(0).toUpperCase() === "M") {
      
      // Black male ------------------------------------------------------------
      if (africanAmerican) {
        s0_10 = 0.89536;
        mnxb  = 19.5425;
        
        prediction = (
          2.469 * logAge +
          0.302 * logTCH +
          (-0.307 * logHDL) +
          logSBP * (hypertensionTreatment ? 1.916 : 1.809) +
          (smoker ? 0.549 : 0) +
          (diabetes ? 0.645 : 0)
        );
      }
      
      // White male ------------------------------------------------------------
      else {
        s0_10 = 0.91436;
        mnxb  = 61.1816;

        prediction = (
          12.344 * logAge +
          11.853 * logTCH +
          (-2.664 * logAge * logTCH) +
          (-7.99  * logHDL) +
          1.769 * logAge * logHDL +
          logSBP * (hypertensionTreatment ? 1.797 : 1.764) +
          (smoker ? 7.837 : 0) +
          (smoker ? -1.795 * logAge : 0) +
          (diabetes ? 0.658 : 0)
        );
      }
    }
    else if (String(gender).charAt(0).toUpperCase() === "F") {
      
      // Black female ----------------------------------------------------------
      if (africanAmerican) {
        s0_10 = 0.95334
        mnxb = 86.6081
        
        prediction = (
            17.1141 * logAge +
            0.9396 * logTCH +
            (-18.9196 * logHDL) +
            4.4748 * logAge * logHDL +
            logSBP * (hypertensionTreatment ? 29.2907 : 27.8197) +
            logSBP * logAge * (hypertensionTreatment ? -6.4321 : -6.0873) +
            (smoker ? 0.6908 : 0) +
            (diabetes ? 0.8738 : 0)
        );
      }
      
      // White female ----------------------------------------------------------
      else {
        s0_10 = 0.96652
        mnxb = -29.1817
        
        prediction = (
            (-29.799 * logAge) +
            4.884 * logAge * logAge +
            13.54  * logTCH +
            (-3.114 * logAge * logTCH) +
            (-13.578 * logHDL) +
            3.149 * logAge * logHDL +
            logSBP * (hypertensionTreatment ? 2.019 : 1.957) +
            (smoker ? 7.574 : 0) +
            (smoker ? -1.665 * logAge : 0) +
            (diabetes ? 0.661 : 0)
        );
      }
    }
    else {
        // throw new Error(`Unknown gender "${gender}"`);
        return NaN;
    }
  
    const risk = 1 - Math.pow(s0_10, Math.exp(prediction - mnxb))

    return roundToPrecision(risk * 100, precision, fixed);
}

export function avg(records) {
    return records.reduce((prev, cur) => prev + cur.value, 0) / records.length;
}

/**
 * Given a records array returns the value of the last record or undefined
 * @param {Array<{value: string|number}>} records 
 */
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
        return (
            <>
                <span className="label label-warning">deceased</span> at {
                moment.duration(
                    moment(patient.deceasedDateTime).diff(patient.dob, "days"),
                    "days"
                ).humanize()}
            </>
        );
    }
    if (!patient.dob || !moment(patient.dob).isValid()) {
        return <span className="label label-danger">Unknown age</span>;
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

export function getPath(obj, path) {
    return path.split(".").reduce((prev, cur) => prev ? prev[cur] : undefined, obj);
}

export function setQuery(q = {}) {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    for (const name in q) {
        const param = q[name];
        if (!param && param !== 0) {
            params.delete(name);
        }
        else {
            params.set(name, param);
        }
    }
    window.history.replaceState({}, document.title, url.href);
}

export function getQuery(param = "") {
    const query = new URLSearchParams(window.location.search);
    if (param) {
        return query.get(param);
    }
    const out = {};
    for (const [name, value] of query.entries()) {
        out[name] = value;
    }
    return out;
}
