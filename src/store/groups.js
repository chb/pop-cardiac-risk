import { query, getQuery, getAdapter } from "../lib"
import config from "../config"

const initialState = {
    loading: false,
    error  : null,
    data   : {
        cholesterol : [],
        HDL         : [],
        sbp         : []
    }
};

const MERGE = "groups/merge";

export function merge(payload) {
    return { type: MERGE, payload };
}

/**
 * Load the observations for all the patients that match the currently selected
 * filters
 * @param {*} param0 
 */
export function loadAll({ startDate, endDate, minAge, maxAge, gender }) {
    return (dispatch, getState) => {
        dispatch(merge({ loading: true, error: null, data: [] }));

        const data = {
            cholesterol : [],
            HDL         : [],
            sbp         : []
        };

        const adapter = getAdapter(getState().settings.adapter);

        const sql = adapter.loadObservations({
            startDate,
            endDate,
            minAge,
            maxAge,
            gender,
            all: getQuery().all
        });

        return query({
            sql,
            onPage(payload) {
                payload.forEach(observation => {

                    // totalCholesterol
                    if (config.observationCodes.totalCholesterol.includes(observation.code)) {
                        data.cholesterol.push({
                            value  : parseFloat(observation.observationValue),
                            date   : new Date(observation.effectiveDateTime),
                            patient: observation.patient.split("/").pop()
                        });
                    }

                    // HDL
                    else if (config.observationCodes.HDL.includes(observation.code)) {
                        data.HDL.push({
                            value  : parseFloat(observation.observationValue),
                            date   : new Date(observation.effectiveDateTime),
                            patient: observation.patient.split("/").pop()
                        });
                    }

                    // Systolic Blood Pressure from component
                    else if (config.observationCodes.BP.includes(observation.code)) {
                        const component = JSON.parse(observation.component);
                        const entry = component.find(x => x.code.coding[0].code === config.observationCodes.SBP);
                        if (entry) {    
                            data.sbp.push({
                                value  : parseFloat(entry.valueQuantity.value),
                                date   : new Date(observation.effectiveDateTime),
                                patient: observation.patient.split("/").pop()
                            });
                        }
                    }

                    // This shouldn't happen
                    else {
                        console.warn(`Unknown observation type "${observation.code}"`);
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
        
        case MERGE:
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

