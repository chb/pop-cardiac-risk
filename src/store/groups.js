import { query, getPath } from "../lib"

const initialState = {
    loading: false,
    error  : null,
    data   : {
        cholesterol : [],
        HDL         : [],
        sbp         : []
    }
};

const ADD_DATA = "groups/addData";
const MERGE    = "groups/merge";


export function merge(payload) {
    return { type: MERGE, payload };
}

export function load({ startDate, endDate, patientId }) {
    return dispatch => {
        dispatch(merge({ loading: true, error: null, data: [] }));

        let sql = `SELECT
            '{valueQuantity.value}' AS observationValue,
            '{effectiveDateTime}'   AS effectiveDateTime,
            '{subject.reference}'   AS patient
        FROM Observation
        WHERE 
            '{code.coding[0].system}' = 'http://loinc.org' AND
            '{code.coding[0].code}'   = '2085-9'`;

        if (patientId) {
            sql += ` AND '{subject.reference}' LIKE '%${patientId}%'`;
        }
        else {
            sql += ` AND DATE('{effectiveDateTime}') > DATE('${startDate}')
                     AND DATE('{effectiveDateTime}') < DATE('${endDate  }')`;
        }

        sql += " ORDER BY '{effectiveDateTime}' ASC"

        return query(window.SMARTClient, {
            sql,
            onPage(payload) {
                dispatch({ type: ADD_DATA, payload });
            }
        })
        .then(() => dispatch(merge({ error: null, loading: false })))
        .catch(error => dispatch(merge({ error, loading: false })));
    };
}

export function loadAll({ startDate, endDate, minAge = 40, maxAge = 80 }) {
    return dispatch => {
        dispatch(merge({ loading: true, error: null, data: [] }));

        const codes = [
            '14647-2', '2093-3', // totalCholesterol
            '2085-9',            // HDL
            '55284-4'            // Blood pressure as components
        ];
        
        const sql = `SELECT
            o.code,
            o.observationValue,
            o.effectiveDateTime,
            o.component,
            p.id AS patient
        FROM (
            SELECT
                code,
                '{valueQuantity.value}' AS observationValue,
                subject                 AS patient,
                effectiveDateTime,
                '{component}'           AS component
            FROM Observation
            WHERE
                code IN ('${codes.join("', '")}')
                AND effectiveDateTime > DATE('${startDate}')
                AND effectiveDateTime < DATE('${endDate}')
        ) AS o

        JOIN (
            SELECT
                resource_id          AS id,
                DOB,
                '{deceasedBoolean}'  AS deceasedBoolean,
                '{deceasedDateTime}' AS deceasedDateTime
            FROM Patient
            WHERE
                DATE_ADD(DOB, INTERVAL ${minAge} YEAR) <= CURDATE()
                AND DATE_ADD(DOB, INTERVAL ${maxAge} YEAR) >= CURDATE()
                AND '{deceasedBoolean}'  IS NULL
                AND '{deceasedDateTime}' IS NULL
        ) AS p ON o.patient = p.id`;
        
        const data = {
            cholesterol : [],
            HDL         : [],
            sbp         : []
        };

        return query(window.SMARTClient, {
            sql,
            onPage(payload) {
                payload.forEach(observation => {
                    switch (observation.code) {
    
                        // totalCholesterol
                        case "14647-2":
                        case "2093-3":
                            data.cholesterol.push({
                                value  : parseFloat(observation.observationValue),
                                date   : observation.effectiveDateTime,
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // HDL
                        case "2085-9":
                            data.HDL.push({
                                value  : parseFloat(observation.observationValue),
                                date   : observation.effectiveDateTime,
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // Systolic Blood Pressure from component
                        case "55284-4":
                            const component = JSON.parse(observation.component);
                            data.sbp.push({
                                value  : parseFloat(getPath(component, "0.valueQuantity.value")),
                                date   : observation.effectiveDateTime,
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // This shouldn't happen
                        default:
                            console.warn(`Unknown observation type "${observation.code}"`);
                        break;
                    }
                });
            }
        })
        .then(() => dispatch(merge({ error: null, loading: false, data })))
        .catch(error => dispatch(merge({ error, loading: false })));
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {

        case ADD_DATA:
            return { ...state, data: [...state.data, ...action.payload] };
        
        case MERGE:
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

