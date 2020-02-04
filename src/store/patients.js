// import moment from "moment"
import {
    reynoldsRiskScore,
    last,
    avg,
    isSmoker,
    query,
    getPatientDisplayName
} from "../lib"

const initialState = {
    loading: false,
    error  : null,
    
    selectedPatientId: null,

    patientsLoadStartTime: Date.now(),
    patientsLoadEndTime: Date.now(),
    search: "",
    sort: "",
    data  : [],

    observations_loading: false,
    observations_error: null
};

const SET_LOADING  = "patients/setLoading";
const SET_ERROR    = "patients/setError";
const SET_PATIENTS = "patients/setPatients";
const ADD_PATIENTS = "patients/addPatients";
const MERGE        = "patients/merge";
const SELECT       = "patients/selectedPatientId";
const SEARCH       = "patients/search";
const SORT         = "patients/sort";

export function setLoading(bool) {
    return { type: SET_LOADING, payload: !!bool };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function selectPatientId(id) {
    return { type: SELECT, payload: id };
}

export function setPatients(payload) {
    return { type: SET_PATIENTS, payload };
}

export function addPatients(payload) {
    return { type: ADD_PATIENTS, payload };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export function search(payload) {
    return { type: SEARCH, payload };
}

export function sort(payload) {
    return { type: SORT, payload };
}

export function loadPatients(client) {
    return function (dispatch, getState) {
        // console.time("Loading data");
        dispatch(merge({ loading: true, error: null }));
        // let gotFirstChunk = false;
        return query(client, {
            sql: `SELECT 
                '{id}',
                '{gender}',
                '{birthDate}' AS dob,
                '{deceasedBoolean}',
                '{deceasedDateTime}',
                '{{name}}'
                FROM Patient
                LIMIT 10000`,
            onPage(data) {
                dispatch(addPatients(data.map(o => {
                    o.name = getPatientDisplayName(JSON.parse(o.name || "{}"));
                    return o;
                })));
                // if (!gotFirstChunk) {
                //     gotFirstChunk = true;
                //     dispatch(setLoading(false));
                // }
            }
        })
        .then(() => {
            // dispatch(loadObservations(client));
            dispatch(merge({
                error: null,
                loading: false
            }));
            // console.timeEnd("Loading data");
        }).catch(error => {
            dispatch(merge({
                error,
                loading: false
            }));
            // console.timeEnd("Loading data");
        });
    };
}

export function loadObservations(client) {
    return function (dispatch, getState) {

        dispatch(merge({ observations_error: null, observations_loading: true }));

        const selects = [

            // hsCRP -----------------------------------------------------------
            `SELECT
                'hsCRP'                                       AS observationType,
                resource_json ->> '$.valueQuantity.value'     AS observationValue,
                resource_json ->> '$.subject.reference'       AS patient,
                DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
            FROM Observation
            WHERE 
                resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
                resource_json ->> '$.code.coding[0].code'   = '30522-7'`,
    
            // totalCholesterol ------------------------------------------------
            `SELECT
                'totalCholesterol'                            AS observationType,
                resource_json ->> '$.valueQuantity.value'     AS observationValue,
                resource_json ->> '$.subject.reference'       AS patient,
                DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
            FROM Observation
            WHERE 
                resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND (
                    resource_json ->> '$.code.coding[0].code' = '14647-2' OR
                    resource_json ->> '$.code.coding[0].code' = '2093-3'
                )`,
    
            // HDL -------------------------------------------------------------
            `SELECT
                'HDL'                                         AS observationType,
                resource_json ->> '$.valueQuantity.value'     AS observationValue,
                resource_json ->> '$.subject.reference'       AS patient,
                DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
            FROM Observation
            WHERE 
                resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
                resource_json ->> '$.code.coding[0].code'   = '2085-9'`,
    
            // sbp -------------------------------------------------------------
            `SELECT
                'sbp'                                         AS observationType,
                resource_json ->> '$.valueQuantity.value'     AS observationValue,
                resource_json ->> '$.subject.reference'       AS patient,
                DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
            FROM Observation
            WHERE 
                resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND (
                    resource_json ->> '$.code.coding[0].code' = '8480-6' OR
                    resource_json ->> '$.code.coding[0].code' = '8450-9' OR
                    resource_json ->> '$.code.coding[0].code' = '8451-7' OR
                    resource_json ->> '$.code.coding[0].code' = '8459-0' OR
                    resource_json ->> '$.code.coding[0].code' = '8460-8' OR
                    resource_json ->> '$.code.coding[0].code' = '8461-6'
                )`,
    
            // smokingStatus ---------------------------------------------------
            `SELECT
                'smokingStatus'                                           AS observationType,
                resource_json ->> '$.valueCodeableConcept.coding[0].code' AS observationValue,
                resource_json ->> '$.subject.reference'                   AS patient,
                DATE(resource_json ->> '$.effectiveDateTime')             AS effectiveDateTime
            FROM Observation
            WHERE 
                resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
                resource_json ->> '$.code.coding[0].code'   = '72166-2'`
        ];
    
        const sql = selects.join(" UNION ALL ") + " ORDER BY effectiveDateTime ASC";

        return client.request({
            url    : "sql",
            method : "POST",
            mode   : "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: sql })
        }).then(o => {

            const patients = getState().patients.data;

            patients.forEach(ptRec => {
                ptRec.hsCRP       = [];
                ptRec.cholesterol = [];
                ptRec.HDL         = [];
                ptRec.sbp         = [];
                ptRec.smoker      = [];
            });

            o.forEach(observation => {
                const ptRec = patients.find(p => `Patient/${p.id}` === observation.patient);

                if (!ptRec) {
                    console.warn(`Could not find patient ${observation.patient}`);
                    return;
                }

                switch (observation.observationType) {
                    case "hsCRP":
                        ptRec.hsCRP.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "totalCholesterol":
                        ptRec.cholesterol.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "HDL":
                        ptRec.HDL.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "sbp":
                        ptRec.sbp.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "smokingStatus":
                        ptRec.smoker.push({
                            value: observation.observationValue,
                            date : observation.effectiveDateTime
                        });
                    break;
                    default:
                        console.warn(`Unknown observation type "${observation.observationType}"`);
                    break;
                }
            });

            dispatch(merge({
                data                : patients,
                observations_error  : null,
                observations_loading: false
            }));

            console.timeEnd("Loading data");

            dispatch(computeScore());

        }).catch(error => {
            dispatch(merge({
                observations_error  : error,
                observations_loading: false
            }));
        });
    };
}

export function computeScore() {
    return function (dispatch, getState) {
        
        const patients = getState().patients.data;
        // debugger;
        patients.forEach(ptRec => {
            
            ptRec.score = {
                avg: reynoldsRiskScore({
                    age        : ptRec.age,
                    gender     : ptRec.gender,
                    sbp        : avg(ptRec.sbp),
                    hsCRP      : avg(ptRec.hsCRP),
                    cholesterol: avg(ptRec.cholesterol),
                    HDL        : avg(ptRec.HDL),
                    smoker     : isSmoker(ptRec.smoker)
                }),
                last: reynoldsRiskScore({
                    age        : ptRec.age,
                    gender     : ptRec.gender,
                    sbp        : last(ptRec.sbp),
                    hsCRP      : last(ptRec.hsCRP),
                    cholesterol: last(ptRec.cholesterol),
                    HDL        : last(ptRec.HDL),
                    smoker     : isSmoker(ptRec.smoker)
                })
            };
        });
        // debugger;
        dispatch(merge({ data: patients }));
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {

        case SET_LOADING:
            return { ...state, loading: !!action.payload };

        case SET_ERROR:
            return { ...state, error: action.payload };
        
        case SELECT:
            return { ...state, selectedPatientId: action.payload };
        
        case SET_PATIENTS:
            return {
                ...state,
                loading: false,
                data: [
                    ...action.payload
                ]
            };

        case ADD_PATIENTS:
            return {
                ...state,
                patientsLoadEndTime: Date.now(),
                data: [ ...state.data, ...action.payload ]
            };
        
        case MERGE: {
            const data = [ ...state.data ];
            if (action.payload.data) {
                action.payload.data.forEach(item => {
                    const rec = data.find(o => o.id === item.id);
                    if (rec) {
                        Object.assign(rec, item);
                    } else {
                        data.push(item);
                    }
                });
            }

            return {
                ...state,
                ...action.payload,
                data
            };
        }

        case SEARCH:
            return {
                ...state,
                search: action.payload
            };
        
        case SORT:
            return {
                ...state,
                sort: action.payload
            };

        default:
            return state;
    }
}

