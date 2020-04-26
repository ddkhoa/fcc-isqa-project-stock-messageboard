const MongoClient = require('mongodb').MongoClient;
const CONNECTION_STRING = process.env.DB;
let client;

module.exports = {

    async setupDbConnection() {
        try {

            client = await MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true });
        } catch (error) {

            console.log("Error when connect to DB, URI : " + CONNECTION_STRING);
            console.log(error.message);
            throw (error);
        }

    },

    getClient() {
        return client;
    }

}