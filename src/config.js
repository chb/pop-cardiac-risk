export default {
    fhir: {
        // iss     : "https://smart-proxy-server.herokuapp.com/pop/presto1",
        iss     : "https://smart-proxy-server.herokuapp.com/pop/mysql-leap",
        // iss     : "http://localhost:4000/pop/presto1",
        // iss     : "http://localhost:4000/pop/mysql-mina",
        // iss     : "http://localhost:4000/pop/mysql-leap",
        clientId: "whatever",
        scope   : "system/Patient.read system/Observation.read offline_access"
    },
    sql: {
        dialect: "MySQL" // or "Presto"
    }
};
