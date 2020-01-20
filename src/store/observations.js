import { query } from "../lib"

const initialState = {
    loading: false,
    error  : null,
    data   : []
};



const SET_LOADING  = "observations/setLoading";
const SET_ERROR    = "observations/setError";
const SET_LDL      = "observations/setLDL";
const SET_HDL      = "observations/setHDL";
// const SET_HS_CRP   = "observations/setHS_CRP";
const MERGE        = "observations/merge";

export function setLoading(bool) {
    return { type: SET_LOADING, payload: !!bool };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function setLDL(payload) {
    return { type: SET_HDL, payload };
}

export function setHDL(payload) {
    return { type: SET_LDL, payload };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export function loadHS_CRP(prop, code) {
    return function (dispatch, getState) {
        dispatch(merge({ loading: true, error: null }));
        return query(
            `SELECT
                o.resource_json ->> '$.valueQuantity.value' AS hsCRP,
                o.resource_json ->> '$.subject.reference' as patient,
                DATE(o.resource_json ->> '$.effectiveDateTime') as effectiveDateTime
            FROM Observation AS o
            WHERE 
                o.resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
                o.resource_json ->> '$.code.coding[0].code' = '30522-7'
            ORDER BY effectiveDateTime DESC`
        ).then(o => {
            dispatch(merge({
                data   : o,
                error  : null,
                loading: false
            }));
        }).catch(error => {
            dispatch(merge({
                error,
                loading: false
            }));
        });
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {

        case SET_LOADING:
            return { ...state, loading: !!action.payload };

        case SET_ERROR:
            return { ...state, error: action.payload };
        
        case MERGE: {
            return {
                ...state,
                ...action.payload
            };
        }

        default:
            return state;
    }
}

