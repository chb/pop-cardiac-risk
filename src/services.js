import { query } from "./lib"


export class PatientCollection
{
    constructor()
    {
        this.data = {};
    }

    load()
    {
        const sql = `SELECT 
        p.resource_json ->> '$.id' AS id,
        p.resource_json ->> '$.gender' AS gender,
        p.resource_json ->> '$.birthDate' AS dob,
        p.resource_json ->> '$.deceasedBoolean' AS deceasedBoolean,
        p.resource_json ->> '$.deceasedDateTime' AS deceasedDateTime,
        p.resource_json ->> '$.name' AS name
        FROM Patient p LIMIT 100`;
        return query(sql).then(data => this.setData(data));
    }

    setData(data)
    {
        data.forEach(rec => this.data[rec.id] = new PatientRecord(rec));
    }
}

export default class PatientRecord
{
    constructor(data = {}) {
        this._set_name(data.name || null);
        this._set_gender(data.gender || null);
        this._set_dob(data.dob || null);
    }

    // Setters -----------------------------------------------------------------
    _set_name() {}

    _set_gender() {}

    _set_dob() {}

    // Getters -----------------------------------------------------------------
    get name() {}

    get gender() {}

    get dob() {}
}