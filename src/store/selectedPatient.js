import { query, getPatientDisplayName, getAdapter } from "../lib";
import config from "../config"

const initialState = {
    loading: false,
    error  : null,
    data: {}
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

export function load(id) {
    return function (dispatch, getState) {
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

        const adapter = getAdapter(getState().settings.adapter)
        
        return query({
            sql: adapter.loadPatient(id),
            onPage(data) {
                if (data[0]) {
                    patient = data[0];
                }
            }
        }).then(() => {
            
            if (!patient) {
                throw new Error("Patient not found");
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

            return Promise.all([pt, loadObservations(pt.id, adapter)]);
        })
        .then(([pt, observations]) => {

            // Total Cholesterol (last known value)
            pt.cholesterol = observations.cholesterol;
            
            // HDL (last known value)
            pt.HDL = observations.HDL;

            // Smoking Status (last known value)
            const smokingStatus = observations.smoker;
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
            pt.sbp = observations.sbp;
            
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

export function loadObservations(id, adapter) {

    const sql = adapter.loadPatientObservations(id);

    const observations = {
        cholesterol : null,
        HDL         : null,
        sbp         : null,
        smoker      : null
    };

    return query({
        sql,
        onPage(data) {
            data.forEach(observation => {

                // totalCholesterol
                if (config.observationCodes.totalCholesterol.includes(observation.code)) {
                    observations.cholesterol = parseFloat(observation.observationValue);
                }

                // HDL
                else if (config.observationCodes.HDL.includes(observation.code)) {
                    observations.HDL = parseFloat(observation.observationValue);
                }

                // Systolic Blood Pressure from component
                else if (config.observationCodes.BP.includes(observation.code)) {
                    observations.sbp = parseFloat(observation.observationValue);
                }

                // smokingStatus
                else if (config.observationCodes.smokingStatus.includes(observation.code)) {
                    observations.smoker = observation.observationValue;
                }

                // This shouldn't happen
                else {
                    console.warn(`Unknown observation type "${observation.code}"`);
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

