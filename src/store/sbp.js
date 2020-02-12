import { query } from "../lib"
// import moment from "moment";

const initialState = {
    loading: false,
    error  : null,
    data   : []
};

const ADD_DATA = "sbp/addData";
const MERGE    = "sbp/merge";


export function merge(payload) {
    return { type: MERGE, payload };
}

export function load({ startDate, endDate }) {
    return dispatch => {
        dispatch(merge({ loading: true, error: null, data: [] }));
        return query(window.SMARTClient, {
            sql: `SELECT
                '{{component[0].valueQuantity.value}}' AS observationValue,
                '{effectiveDateTime}' AS effectiveDateTime,
                '{subject.reference}' AS patient
            FROM Observation
            WHERE
                '{code.coding[0].system}' = 'http://loinc.org'
                AND '{code.coding[0].code}' = '55284-4'
                AND DATE('{effectiveDateTime}') > DATE('${startDate}')
                AND DATE('{effectiveDateTime}') < DATE('${endDate}')`,
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

