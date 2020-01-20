
/**
 * Used in fetch Promise chains to reject if the "ok" property is not true
 */
export async function checkResponse(resp) {
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
            "Request failed:\n" +
            `${resp.status} ${resp.statusText}\nURL: ${resp.url}\n\n${text}`
        );
    }
    return resp;
}

/**
 * Used in fetch Promise chains to return the JSON version of the response.
 * Note that `resp.json()` will throw on empty body so we use resp.text()
 * instead.
 * @param {Response} resp
 * @returns {Promise<object|string>}
 */
export function responseToJSON(resp) {
    return resp.text().then(text => text.length ? JSON.parse(text) : "");
}

export function query(sql)
{
    return fetch("http://localhost:3003/sql", {
        method : "POST",
        mode   : "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: sql })
    })
    .then(checkResponse)
    .then(responseToJSON);
}

export function getAllPatients() {
    // First get all patients with as much info as we can get for them in a
    // convenient way
    let sql = `SELECT
        o1.resource_json ->> '$.valueQuantity.value' AS hsCRP,
        o2.resource_json ->> '$.valueQuantity.value' AS totalCholesterol,
        o3.resource_json ->> '$.valueQuantity.value' AS HDL
    FROM Observation AS o1
    RIGHT JOIN Observation AS o2 ON (o1.resource_json ->> '$.subject.reference'     = o2.resource_json ->> '$.subject.reference')
    RIGHT JOIN Observation AS o3 ON (o1.resource_json ->> '$.subject.reference'     = o3.resource_json ->> '$.subject.reference')
    WHERE 
        o1.resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        o1.resource_json ->> '$.code.coding[0].code'   = '30522-7' AND
        o2.resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        o2.resource_json ->> '$.code.coding[0].code'   = '2093-3' AND
        o3.resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        o3.resource_json ->> '$.code.coding[0].code'   = '2085-9'
    ORDER BY o1.resource_json ->> '$.issued'
    `;

    return query(sql)
        .then(console.log)
        .catch(console.error);
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
 * @param {Boolean} p.fx_of_mi
 */
export function reynoldsRiskScore(p) {

    if (!p.gender ||
        !p.age ||
        !p.sbp ||
        !p.hsCRP ||
        !p.cholesterol ||
        !p.HDL)
        return "N/A";

    let result = null, params;
  
    if (p.gender === "female") {
        params = {
            age        : 0.0799,
            sbp        : 3.137,
            hsCRP      : 0.180,
            cholesterol: 1.382,
            HDL        : -1.172,
            smoker     : 0.818,
            fx_of_mi   : 0.438
        }
    } else {
        params = {
            age        : 4.385,
            sbp        : 2.607,
            hsCRP      : 0.102,
            cholesterol: 0.963,
            HDL        : -0.772,
            smoker     : 0.405,
            fx_of_mi   : 0.541
        }
    }
  
    let b1 = params.age          * (p.gender === "female" ? p.age : Math.log(p.age))
      , b2 = params.sbp          * Math.log(p.sbp)
      , b3 = params.hsCRP        * Math.log(p.hsCRP)
      , b4 = params.cholesterol  * Math.log(p.cholesterol)
      , b5 = params.HDL          * Math.log(p.HDL)
      , b6 = params.smoker       * (p.smoker ? 1 : 0)
      , b7 = params.fx_of_mi     * (p.fx_of_mi ? 1 : 0);
  
    var B = b1 + b2 + b3 + b4 + b5 + b6 + b7;
  
    if (p.gender === 'female') {
        result = (1 - Math.pow(0.98634, (Math.exp(B-22.325)))) * 100
    } else {
        result = (1 - Math.pow(0.8990,  (Math.exp(B-33.097)))) * 100
    }

    return Math.round((result < 10 ? result.toPrecision(1) : result.toPrecision(2)))
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

