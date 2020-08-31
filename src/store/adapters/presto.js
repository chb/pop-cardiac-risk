import config from "../../config"

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * select all the patients. Note that patient's name is returned as JSON string
 * and will be parsed on the client-side.
 */
export function loadPatients()
{
    return `SELECT 
        JSON_EXTRACT_SCALAR(json, '$.id')               AS id,
        JSON_EXTRACT_SCALAR(json, '$.gender')           AS gender,
        JSON_EXTRACT_SCALAR(json, '$.birthDate')        AS dob,
        JSON_EXTRACT_SCALAR(json, '$.deceasedBoolean')  AS deceasedBoolean,
        JSON_EXTRACT_SCALAR(json, '$.deceasedDateTime') AS deceasedDateTime,
        JSON_EXTRACT(json, '$.name')                    AS name
    FROM Patient`;
}

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * select the specified patient by id. Note that patient's name and extension
 * are returned as JSON string and will be parsed on the client-side.
 */
export function loadPatient(id)
{
    return `SELECT 
        JSON_EXTRACT_SCALAR(json, '$.gender')           AS gender,
        JSON_EXTRACT_SCALAR(json, '$.birthDate')        AS dob,
        JSON_EXTRACT_SCALAR(json, '$.id')               AS id,
        JSON_EXTRACT_SCALAR(json, '$.deceasedBoolean')  AS deceasedBoolean,
        JSON_EXTRACT_SCALAR(json, '$.deceasedDateTime') AS deceasedDateTime,
        JSON_EXTRACT(json, '$.name')                    AS name,
        JSON_EXTRACT(json, '$.extension')               AS "extensions"
    FROM Patient
    WHERE JSON_EXTRACT_SCALAR(json, '$.id') = '${id}'`;
}

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * return all the observations for all patients within the specified time
 * interval. The observations we need include:
 * - totalCholesterol
 * - HDL
 * - Blood pressure
 * @param {object} options
 * @param {string} options.startDate The effectiveDateTime of the observations
 *     should be the same or after `options.startDate`.
 * @param {string} options.endDate The effectiveDateTime of the observations
 *     should be the same or before `options.endDate`.
 * @param {string|number} [options.minAge] The minimum age in years. If used. it
 *     should be a positive integer as number or string.
 * @param {string|number} [options.maxAge] The maximum age in years. If used. it
 *     should be a positive integer as number or string.
 * @param {string} [options.gender] If used, filter the results to patients
 *     having the specified gender. If the value is "male" or "female" works
 *     as expected. Otherwise filters the results to patients that have gender
 *     specified, but it is not "male" or "female".
 * @param {boolean} [options.all] If this is set to true (and if minAge and
 *     maxAge are not used), then deceased patients should also be included.
 */
export function loadObservations({ startDate, endDate, minAge, maxAge, gender, all })
{
    const codes = [
        ...config.observationCodes.totalCholesterol,
        ...config.observationCodes.HDL,
        ...config.observationCodes.BP
    ];

    let patientFilters = [];
    if (gender) {
        if (gender === "male") {
            patientFilters.push("JSON_EXTRACT_SCALAR(json, '$.gender') = 'male'");
        }
        else if (gender === "female") {
            patientFilters.push("JSON_EXTRACT_SCALAR(json, '$.gender') = 'female'");
        }
        else {
            patientFilters.push("JSON_EXTRACT_SCALAR(json, '$.gender') NOT IN('male', 'female')");
        }
    }
    else if (minAge !== undefined && maxAge !== undefined) {
        patientFilters.push(
            `date_diff('year', from_iso8601_timestamp(JSON_EXTRACT_SCALAR(json, '$.birthDate')), current_date) >= ${minAge}`,
            `date_diff('year', from_iso8601_timestamp(JSON_EXTRACT_SCALAR(json, '$.birthDate')), current_date) <= ${maxAge}`
        );
    }

    if (!all || (minAge !== undefined && maxAge !== undefined)) {
        patientFilters.push(
            "JSON_EXTRACT_SCALAR(json, '$.deceasedBoolean')  IS NULL",
            "JSON_EXTRACT_SCALAR(json, '$.deceasedDateTime') IS NULL"
        );
    }

    const observationQuery = `
    SELECT
        JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') AS code,
        JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime')   AS effectiveDateTime,
        JSON_EXTRACT_SCALAR(json, '$.valueQuantity.value') AS observationValue,
        JSON_EXTRACT_SCALAR(json, '$.subject.reference')   AS patient,
        JSON_EXTRACT(json, '$.component')           AS component
    FROM Observation
    WHERE
        JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') IN ('${codes.join("', '")}')
        AND from_iso8601_timestamp(JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime')) >= from_iso8601_timestamp('${startDate}')
        AND from_iso8601_timestamp(JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime')) <= from_iso8601_timestamp('${endDate}')`;

    let patientColumns = ["JSON_EXTRACT_SCALAR(json, '$.id') AS id"];

    let patientWhere = "";

    if (patientFilters.length) {
        patientColumns.push(
            "JSON_EXTRACT_SCALAR(json, '$.birthDate')        AS DOB",
            "JSON_EXTRACT_SCALAR(json, '$.deceasedBoolean')  AS deceasedBoolean",
            "JSON_EXTRACT_SCALAR(json, '$.deceasedDateTime') AS deceasedDateTime"
        );
        patientWhere = "WHERE " + patientFilters.join(" AND ");
    }

    let patientQuery = `SELECT ${patientColumns.join(", ")} FROM Patient ${patientWhere}`;
    
    return `SELECT
        o.code,
        o.observationValue,
        o.effectiveDateTime,
        o.component,
        p.id AS patient
    FROM (${observationQuery}) AS o
    JOIN (${patientQuery}) AS p ON o.patient = concat('Patient/', p.id)
    ORDER BY o.effectiveDateTime`;
}

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * return all the observations for the specified patient. The observations we
 * need include:
 * - totalCholesterol
 * - HDL
 * - Smoking Status
 * - Blood pressure (as components)
 * 
 * @param {string} id Patient ID 
 */
export function loadPatientObservations(id)
{
    return [

        // totalCholesterol ----------------------------------------------------
        `(
            SELECT
                JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') AS code,
                JSON_EXTRACT_SCALAR(json, '$.valueQuantity.value') AS observationValue
            FROM Observation
            WHERE 
                JSON_EXTRACT_SCALAR(json, '$.subject.reference') = 'Patient/${id}'
                AND JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') IN('${config.observationCodes.totalCholesterol.join("', '")}')
            ORDER BY JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime') DESC
            LIMIT 1
        )`,

        // HDL -----------------------------------------------------------------
        `(
            SELECT
                JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') AS code,
                JSON_EXTRACT_SCALAR(json, '$.valueQuantity.value') AS observationValue
            FROM Observation
            WHERE 
                JSON_EXTRACT_SCALAR(json, '$.subject.reference') = 'Patient/${id}'
                AND JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') IN('${config.observationCodes.HDL.join("', '")}')
            ORDER BY JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime') DESC
            LIMIT 1
        )`,

        // Smoking Status ------------------------------------------------------
        `(
            SELECT
                JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') AS code,
                JSON_EXTRACT_SCALAR(json, '$.valueCodeableConcept.coding[0].code') AS observationValue
            FROM Observation
            WHERE 
                JSON_EXTRACT_SCALAR(json, '$.subject.reference') = 'Patient/${id}'
                AND JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') IN('${config.observationCodes.smokingStatus.join("', '")}')
            ORDER BY JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime') DESC
            LIMIT 1
        )`,

        // Blood pressure ------------------------------------------------------
        `(
            SELECT
                JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') AS code,
                JSON_EXTRACT_SCALAR(json, '$.component[1].valueQuantity.value') AS observationValue
            FROM Observation
            WHERE 
                JSON_EXTRACT_SCALAR(json, '$.subject.reference') = 'Patient/${id}'
                AND JSON_EXTRACT_SCALAR(json, '$.code.coding[0].code') IN('${config.observationCodes.BP.join("', '")}')
            ORDER BY JSON_EXTRACT_SCALAR(json, '$.effectiveDateTime') DESC
            LIMIT 1
        )`

    ].join(" UNION ");
}
