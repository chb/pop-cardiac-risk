export * from "react-redux"

declare module "react-redux" {

    interface PatientsState {
        loading              : boolean;
        error                : Error | null;
        selectedPatientId    : string | null;
        patientsLoadStartTime: Date;
        patientsLoadEndTime  : Date;
        search               : string;
        sort                 : string;
        data                 : any[];
        idIndex              : {
            [id: string]: any;
        };
        observations_loading : boolean;
        observations_error   : Error | null;
    }

    // interface AuthState {
    //     currentUser: any;
    // }

    interface SettingsState {
        adapters: AdapterConfig[];
        selectedAdapter: string;
    }

    interface SmartState {
        error: Error | null;
        authorized: boolean;
        loading: boolean;
    }

    interface AdapterConfig {
        id: string;
        label: string;
        path: string;
    }

    interface SelectedPatientState {
        loading: boolean;
        error  : Error | null;
        data: object;
    }

    interface DefaultRootState {
        patients: PatientsState;
        selectedPatient: SelectedPatientState;
        groups: AuthState;
        settings: SettingsState;
        smart: SmartState;
    }


}

