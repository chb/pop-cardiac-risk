/**
 * Returns an SQL query that can be executed against MySQL database and should
 * select all the patients. Note that patient's name is returned as JSON string
 * and will be parsed on the client-side.
 */
export function loadPatients()
{
    return `SELECT 
        resource_id                           AS id,
        gender                                AS gender,
        DOB                                   AS dob,
        resource_json -> '$.deceasedBoolean'  AS deceasedBoolean,
        resource_json -> '$.deceasedDateTime' AS deceasedDateTime,
        resource_json ->> '$.name'            AS name
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
        gender,
        DOB                                    AS "dob",
        resource_id                            AS "id",
        resource_json ->  '$.deceasedBoolean'  AS "deceasedBoolean",
        resource_json ->  '$.deceasedDateTime' AS "deceasedDateTime",
        resource_json ->> '$.name'             AS "name",
        resource_json ->> '$.extension'        AS "extensions"
    FROM Patient
    WHERE resource_id = '${id}'`;
}

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * return all the observations for all patients within the specified time
 * interval. The observations we need include:
 * - totalCholesterol (14647-2, 2093-3)
 * - HDL (2085-9)
 * - Blood pressure (55284-4)
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
        '14647-2', '2093-3', // totalCholesterol
        '2085-9',            // HDL
        '55284-4'            // Blood pressure as components
    ];

    let patientFilters = [];
    if (gender) {
        if (gender === "male") {
            patientFilters.push("gender = 'male'");
        }
        else if (gender === "female") {
            patientFilters.push("gender = 'female'");
        }
        else {
            patientFilters.push("gender NOT IN('male', 'female')");
        }
    }
    else if (minAge !== undefined && maxAge !== undefined) {
        patientFilters.push(
            `DATE_ADD(DOB, INTERVAL ${minAge} YEAR) <= CURDATE()`,
            `DATE_ADD(DOB, INTERVAL ${maxAge} YEAR) >= CURDATE()`
        );
    }

    if (!all || (minAge !== undefined && maxAge !== undefined)) {
        patientFilters.push(
            "resource_json -> '$.deceasedBoolean'  IS NULL",
            "resource_json -> '$.deceasedDateTime' IS NULL"
        );
    }
    
    const sql = `SELECT
        o.code,
        o.observationValue,
        o.effectiveDateTime,
        o.component,
        p.id AS patient
    FROM (
        SELECT
            code,
            effectiveDateTime,
            resource_json -> '$.valueQuantity.value' AS observationValue,
            subject                                  AS patient,
            resource_json -> '$.component'           AS component
        FROM Observation
        WHERE
            code IN ('${codes.join("', '")}')
            AND effectiveDateTime >= DATE('${startDate}')
            AND effectiveDateTime <= DATE('${endDate}')
    ) AS o
    JOIN (
        SELECT
            resource_id          AS id,
            DOB,
            resource_json -> '$.deceasedBoolean'  AS deceasedBoolean,
            resource_json -> '$.deceasedDateTime' AS deceasedDateTime
        FROM Patient
        ${patientFilters.length ? "WHERE " + patientFilters.join(" AND ") : "" }
    ) AS p ON o.patient = p.id
    ORDER BY o.effectiveDateTime`;
    
    return sql;
}

/**
 * Returns an SQL query that can be executed against MySQL database and should
 * return all the observations for the specified patient. The observations we
 * need include:
 * - totalCholesterol (14647-2, 2093-3)
 * - HDL (2085-9)
 * - Smoking Status (72166-2)
 * - Blood pressure (55284-4)
 * 
 * @param {string} id Patient ID 
 */
export function loadPatientObservations(id)
{
    return [

        // totalCholesterol ----------------------------------------------------
        `(
            SELECT
                \`code\`,
                resource_json -> '$.valueQuantity.value' AS observationValue
            FROM Observation
            WHERE 
                subject = '${id}' AND code IN('14647-2', '2093-3')
            ORDER BY effectiveDateTime DESC
            LIMIT 1
        )`,

        // HDL -----------------------------------------------------------------
        `(
            SELECT
                \`code\`,
                resource_json -> '$.valueQuantity.value' AS observationValue
            FROM Observation
            WHERE 
                subject = '${id}' AND code = '2085-9'
            ORDER BY effectiveDateTime DESC
            LIMIT 1
        )`,

        // Smoking Status ------------------------------------------------------
        `(
            SELECT
                \`code\`,
                resource_json -> '$.valueCodeableConcept.coding[0].code' AS observationValue
            FROM Observation
            WHERE 
                subject = '${id}' AND code = '72166-2'
            ORDER BY effectiveDateTime DESC
            LIMIT 1
        )`,

        // Blood pressure ------------------------------------------------------
        `(
            SELECT
                \`code\`,
                resource_json -> '$.component[0].valueQuantity.value' AS observationValue
            FROM Observation
            WHERE 
                subject = '${id}' AND code = '55284-4'
            ORDER BY effectiveDateTime DESC
            LIMIT 1
        )`

    ].join(" UNION ");
}
