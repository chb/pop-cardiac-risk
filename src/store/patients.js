import moment from "moment"
import {
    reynoldsRiskScore,
    last,
    avg,
    isSmoker
} from "../lib"

const initialState = {
    loading: false,
    error  : null,
    observations_loading: false,
    observations_error: null,
    selectedPatientId: null,
    data  : []
};

const SET_LOADING  = "patients/setLoading";
const SET_ERROR    = "patients/setError";
const SET_PATIENTS = "patients/setPatients";
const MERGE        = "patients/merge";
const SELECT       = "patients/selectedPatientId";

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

export function merge(payload) {
    return { type: MERGE, payload };
}

export function loadPatients(client) {
    return function (dispatch, getState) {
        console.time("Loading data");
        dispatch(merge({ loading: true, error: null }));
        return client.request({
            url    : "sql",
            method : "POST",
            mode   : "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `SELECT 
                p.resource_json ->> '$.id' AS id,
                p.resource_json ->> '$.gender' AS gender,
                p.resource_json ->> '$.birthDate' AS dob,
                p.resource_json ->> '$.deceasedBoolean' AS deceasedBoolean,
                p.resource_json ->> '$.deceasedDateTime' AS deceasedDateTime,
                p.resource_json ->> '$.name' AS name
                FROM Patient p`
            })
        })
        .then(patients => {
            dispatch(merge({
                data: patients.map(p => ({
                    ...p,
                    age: moment().diff(p.dob, "years")
                })),
                error: null,
                loading: false
            }));
            dispatch(loadObservations(client));
        }).catch(error => {
            dispatch(merge({
                error,
                loading: false
            }));
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

        default:
            return state;
    }
}

