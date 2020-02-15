import {
    // reynoldsRiskScore,
    // last,
    // avg,
    // isSmoker,
    query,
    getPatientDisplayName
} from "../lib"

const initialState = {
    loading: false,
    error  : null,
    data: {
        // id          : "patient-id",
        gender      : "male",
        dob         : "1939-08-30",
        // age         : 80,
        // deceasedBoolean : false,
        deceasedDateTime: "1989-08-30",
        name        : "John Doe",
        // hsCRP       : 2,
        // cholesterol : 100,
        // HDL         : 70,
        // LDL         : 80,
        // sbp         : 120,
        // smoker      : false,
        // hha         : false // Family history of heart attack
    }
};

const SET_LOADING  = "selectedPatient/setLoading";
const SET_ERROR    = "selectedPatient/setError";
const MERGE        = "selectedPatient/merge";

export function setLoading(bool) {
    return { type: SET_LOADING, payload: !!bool };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export function load(client, id) {
    return function (dispatch, getState) {
        // console.time("Loading data");
        dispatch(merge({
            loading: true,
            error: null,
            data: {
                gender          : null,
                dob             : null,
                deceasedBoolean : null,
                deceasedDateTime: null,
                name            : null,
                cholesterol     : null,
                sbp             : null,
                HDL             : null,
                smoker          : null,
                afroAmerican    : null,
                diabetic        : null,
                hypertensionTmt : null
            }
        }));

        let patient;
        
        return query(client, {
            sql: `SELECT 
                '{id}'               AS "id",
                '{gender}'           AS "gender",
                '{birthDate}'        AS "dob",
                '{deceasedBoolean}'  AS "deceasedBoolean",
                '{deceasedDateTime}' AS "deceasedDateTime",
                '{{name}}'           AS "name"
                FROM Patient
                WHERE '{id}' = '${id}'`,
            onPage(data) {
                if (data[0]) {
                    patient = data[0];
                }
            }
        })  
        .then(() => {
            
            if (!patient) {
                throw new Error("Patient not found")
            }

            const pt = {
                id              : patient.id,
                gender          : patient.gender,
                dob             : patient.dob,
                deceasedBoolean : patient.deceasedBoolean,
                deceasedDateTime: patient.deceasedDateTime
            }

            pt.name = getPatientDisplayName(JSON.parse(patient.name || "{}"));

            if (patient.extensions) {
                const ext = JSON.parse(patient.extensions).find(
                    e => e.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
                );

                // R4
                // if (ext && ext.extension && ext.extension[0]) {
                //     pt.afroAmerican = ext.extension[0].valueCoding.code === "2054-5";
                // }

                // R3
                if (ext && ext.valueCodeableConcept) {
                    pt.afroAmerican = ext.valueCodeableConcept.coding[0].code === "2054-5";
                }
            }

            pt.cholesterol     = Math.random() > 0.33 ? 130 + Math.random() * 190 : null;
            pt.sbp             = Math.random() > 0.33 ? 90  + Math.random() * 60  : null;
            pt.hsCRP           = Math.random() > 0.33 ? 1   + Math.random() * 8   : null;
            pt.HDL             = Math.random() > 0.33 ? 30  + Math.random() * 60  : null;
            pt.smoker          = Math.random() > 0.66 ? true : Math.random() < 0.33 ? false : undefined;
            pt.hypertensionTmt = Math.random() > 0.66 ? true : Math.random() < 0.33 ? false : undefined;
            pt.diabetic        = Math.random() > 0.66 ? true : Math.random() < 0.33 ? false : undefined;
            
            dispatch(merge({
                data   : pt,
                error  : null,
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

export function loadObservations(client, id) {
    
    const selects = [

        // hsCRP -----------------------------------------------------------
        // `SELECT
        //     'hsCRP'                                       AS observationType,
        //     resource_json ->> '$.valueQuantity.value'     AS observationValue,
        //     resource_json ->> '$.subject.reference'       AS patient,
        //     DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
        // FROM Observation
        // WHERE 
        //     resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        //     resource_json ->> '$.code.coding[0].code'   = '30522-7'`,

        // totalCholesterol ------------------------------------------------
        `SELECT
            'totalCholesterol'                                 AS observationType,
            json_extract_scalar(json, '$.valueQuantity.value') AS observationValue,
            json_extract_scalar(json, '$.subject.reference'  ) AS patient,
            json_extract_scalar(json, '$.effectiveDateTime'  ) AS effectiveDateTime
        FROM Observation
        WHERE 
            json_extract_scalar(json, '$.code.coding[0].system') = 'http://loinc.org'
            AND (
                json_extract_scalar(json, '$.code.coding[0].code') = '14647-2' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '2093-3'
            )
            AND json_extract_scalar(json, '$.id') = '${id}'`,

        // HDL -------------------------------------------------------------
        // `SELECT
        //     'HDL'                                         AS observationType,
        //     resource_json ->> '$.valueQuantity.value'     AS observationValue,
        //     resource_json ->> '$.subject.reference'       AS patient,
        //     DATE(resource_json ->> '$.effectiveDateTime') AS effectiveDateTime
        // FROM Observation
        // WHERE 
        //     resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        //     resource_json ->> '$.code.coding[0].code'   = '2085-9'`,

        // sbp -------------------------------------------------------------
        `SELECT
            'sbp'                                              AS observationType,
            json_extract_scalar(json, '$.valueQuantity.value') AS observationValue,
            json_extract_scalar(json, '$.subject.reference'  ) AS patient,
            json_extract_scalar(json, '$.effectiveDateTime'  ) AS effectiveDateTime
        FROM Observation
        WHERE 
            json_extract_scalar(json, '$.code.coding[0].system') = 'http://loinc.org'
            AND (
                json_extract_scalar(json, '$.code.coding[0].code') = '8480-6' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '8450-9' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '8451-7' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '8459-0' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '8460-8' OR
                json_extract_scalar(json, '$.code.coding[0].code') = '8461-6'
            )
            AND json_extract_scalar(json, '$.id') = '${id}'`,

        // smokingStatus ---------------------------------------------------
        // `SELECT
        //     'smokingStatus'                                           AS observationType,
        //     resource_json ->> '$.valueCodeableConcept.coding[0].code' AS observationValue,
        //     resource_json ->> '$.subject.reference'                   AS patient,
        //     DATE(resource_json ->> '$.effectiveDateTime')             AS effectiveDateTime
        // FROM Observation
        // WHERE 
        //     resource_json ->> '$.code.coding[0].system' = 'http://loinc.org' AND
        //     resource_json ->> '$.code.coding[0].code'   = '72166-2'`
    ];

    const sql = selects.join(" UNION ALL ") + " ORDER BY effectiveDateTime ASC";

    const  observations = {
        hsCRP       : [],
        cholesterol : [],
        HDL         : [],
        sbp         : [],
        smoker      : [],
    };

    return query(client, {
        sql,
        onPage(data) {
            data.forEach(observation => {
                switch (observation.observationType) {
                    case "hsCRP":
                        observations.hsCRP.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "totalCholesterol":
                        observations.cholesterol.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "HDL":
                        observations.HDL.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "sbp":
                        observations.sbp.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;
                    case "smokingStatus":
                        observations.smoker.push({
                            value: observation.observationValue,
                            date : observation.effectiveDateTime
                        });
                    break;
                    default:
                        console.warn(`Unknown observation type "${observation.observationType}"`);
                    break;
                }
            });
        }
    }).then(() => observations);
}

export default function reducer(state = initialState, action)
{
    switch (action.type) {

        case SET_LOADING:
            return { ...state, loading: !!action.payload };

        case SET_ERROR:
            return { ...state, error: action.payload };
        
        case MERGE:
            return {
                ...state,
                ...action.payload,
                data: {
                    ...state.data,
                    ...action.payload.data || {}
                }
            };

        default:
            return state;
    }
}

