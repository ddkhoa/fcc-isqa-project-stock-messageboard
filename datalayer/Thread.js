const connection = require("./connection");

module.exports = {

    createThread: async function (params) {
        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const response = await threadCollection.insertOne(params);
        const doc = response.ops[0];
        return doc;
    },

    getThreadByText: async function (text) {
        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const doc = await threadCollection.findOne({ text })
        return doc;
    },

    getThreadById: async function (id) {
        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const doc = await threadCollection.findOne({ _id: id })
        return doc;
    },

    updateThread: async function (params) {

        const { find, update } = params;
        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const response = await threadCollection.findOneAndUpdate(find, update);
        return response;
    },

    getThreads: async function (params) {

        const { find, sort, limit } = params;
        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const docs = await threadCollection.find(find).sort(sort).limit(limit).toArray();
        return docs;
    },

    deleteThread: async function (_id) {

        const client = connection.getClient();
        const threadCollection = client.db("thread").collection("threads");
        const response = await threadCollection.findOneAndDelete({ _id });
        return response;
    },

}