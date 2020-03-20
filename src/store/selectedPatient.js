import {
    // reynoldsRiskScore,
    // last,
    // avg,
    // isSmoker,
    query,
    getPatientDisplayName,
    getPath
} from "../lib"
import moment from "moment"

const initialState = {
    loading: false,
    error  : null,
    data: {
        // id          : "patient-id",
        gender          : "male",
        dob             : "1939-08-30",
        // age         : 80,
        // deceasedBoolean : false,
        deceasedDateTime: "1989-08-30",
        name            : "John Doe",
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
    return function (dispatch) {
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
                '{{name}}'           AS "name",
                '{{extension}}'      AS "extensions"
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

            // name ------------------------------------------------------------
            pt.name = getPatientDisplayName(JSON.parse(patient.name || "{}"));

            // race ------------------------------------------------------------
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

            // on hypertension treatment (random) ------------------------------
            pt.hypertensionTmt = Math.random() > 0.66 ?
                true :
                Math.random() < 0.33 ? false : undefined;

            // diabetic (random) -----------------------------------------------
            pt.diabetic = Math.random() > 0.66 ?
                true :
                Math.random() < 0.33 ? false : undefined;

            return Promise.all([pt, loadObservations(client, pt.id)]);
        })
        .then(([pt, observations]) => {

            // Total Cholesterol (last known value)
            pt.cholesterol = getPath(observations, "cholesterol.0.value") || null;
            
            // HDL (last known value)
            pt.HDL = getPath(observations, "HDL.0.value") || null;

            // Smoking Status (last known value)
            const smokingStatus = getPath(observations, "smoker.0.value");
            if (!smokingStatus) {
                pt.smoker = undefined;
            } else {
                pt.smoker = [
                    "449868002",       // Current every day smoker
                    "428041000124106", // Current some day smoker
                    "77176002",        // Smoker, current status unknown
                    "428071000124103", // Current Heavy tobacco smoker
                    "428061000124105"  // Current Light tobacco smoker
                ].indexOf(smokingStatus) > -1;
            }

            // Systolic Blood Pressure (last known value)
            pt.sbp = getPath(observations, "sbp.0.value") || null;
            
            dispatch(merge({
                data   : pt,
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

export function loadObservations(client, id) {

    const codes = [
        '14647-2', '2093-3', // totalCholesterol
        // '30522-7',           // hsCRP
        '2085-9',            // HDL
        // '8480-6', '8450-9', '8451-7', '8459-0', '8460-8', '8461-6', // Blood pressure
        '55284-4', // Blood pressure as components
        '72166-2' // Smoking Status
    ];
    
    const sql = `SELECT
        '{code.coding[0].code}' AS code,
        '{valueQuantity.value}' AS observationValue,
        '{subject.reference}'   AS patient,
        '{effectiveDateTime}'   AS effectiveDateTime,
        '{component}'           AS component
    FROM Observation
    WHERE 
        '{subject.reference}'     = 'Patient/${id}' AND
        '{code.coding[0].system}' = 'http://loinc.org' AND
        '{code.coding[0].code}' IN('${codes.join("', '")}')`;

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

            // Sorting on the server is slow because the entire Observations
            // needs to be sorted. It is faster to sort on the client because
            // we don't have that many results
            data.sort((a, b) => moment(a.effectiveDateTime).diff(b.effectiveDateTime, "seconds"));

            data.forEach(observation => {
                switch (observation.code) {

                    // hsCRP
                    case "30522-7": 
                        observations.hsCRP.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;

                    // totalCholesterol
                    case "14647-2":
                    case "2093-3":
                        observations.cholesterol.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;

                    // HDL
                    case "2085-9":
                        observations.HDL.push({
                            value: parseFloat(observation.observationValue),
                            date : observation.effectiveDateTime
                        });
                    break;

                    // Systolic Blood Pressure from component
                    case "55284-4":
                        const component = JSON.parse(observation.component);
                        observations.sbp.push({
                            value: parseFloat(getPath(component, "0.valueQuantity.value")),
                            date : observation.effectiveDateTime
                        });
                    break;

                    // smokingStatus
                    case "72166-2":
                        observations.smoker.push({
                            value: observation.observationValue,
                            date : observation.effectiveDateTime
                        });
                    break;

                    // This shouldn't happen
                    default:
                        console.warn(`Unknown observation type "${observation.code}"`);
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

