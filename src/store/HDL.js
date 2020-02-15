import { query } from "../lib"

const initialState = {
    loading: false,
    error  : null,
    data   : []
};

const ADD_DATA = "observations/addData";
const MERGE    = "observations/merge";


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

