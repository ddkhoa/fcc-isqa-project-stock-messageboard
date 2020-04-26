const Thread = require("../datalayer/Thread");
const { v4: uuidv4 } = require('uuid');

module.exports = {

    createThread: async function (params) {


        const { board, text, delete_password } = params;

        // create additional fields : _id, created_on, bumped_on, reported, replies
        const _id = uuidv4();
        const created_on = new Date();
        const bumped_on = new Date();
        const reported = false;
        const replies = [];

        // request for datalayer
        const req = {
            _id, board, text, delete_password,
            created_on, bumped_on, reported, replies
        }

        const newThread = await Thread.createThread(req);

        return newThread;
    },

    getMostRecent10Threads: async function (params) {

        let { board } = params;

        // request for datalayer
        let req = {
            find: { board },
            sort: { bumped_on: -1 },
            limit: 10
        }

        let threads = await Thread.getThreads(req);

        // filter fields and most recent 3 replies
        let threadsWithMostRecent3Replies = threads.map(item => ({
            _id: item._id,
            text: item.text,
            created_on: item.created_on,
            bumped_on: item.bumped_on,
            replycount : item.replies.length,
            replies: item.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3).reverse(),
        }));

        return { threads: threadsWithMostRecent3Replies };
    },

    reportThread: async function (params) {

        let { thread_id } = params;

        // request for datalayer
        let find = {
            _id: thread_id
        }

        let update = {
            $set: {
                reported: true
            }
        }

        let req = {
            find, update
        }

        let response = await Thread.updateThread(req);
        if (response.lastErrorObject.n == 0) {

            return "no thread updated";
        }

        return "success";
    },

    deleteThread: async function (params) {

        let { thread_id, delete_password } = params;

        let thread = await Thread.getThreadById(thread_id);

        if (!thread) {

            return "thread not found";
        }

        if (thread.delete_password != delete_password) {
            return "incorrect password";
        }

        const response = await Thread.deleteThread(thread_id);

        return "success";
    },

    addReplyToThread: async function (params) {

        const { thread_id, text, delete_password } = params;

        // create additional fields : _id, created_on, bumped_on, reported, replies
        const _id = uuidv4();
        const created_on = new Date();
        const reported = false;

        // request for datalayer
        const newReply = {
            _id, text, created_on, delete_password, reported
        }
        const req = {
            find: { _id: thread_id },
            update: { $push: { replies: newReply }, $set: { bumped_on: new Date() } }
        }

        await Thread.updateThread(req);

        return;
    },

    getThreadWithAllReplies: async function (params) {

        const { thread_id } = params;

        const thread = await Thread.getThreadById(thread_id);
        
        const threadWithoutPasswordAndReported = {
            _id: thread._id,
            board: thread.board,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies
        }

        return { thread: threadWithoutPasswordAndReported };
    },

    reportReply: async function (params) {

        const { thread_id, reply_id } = params;

        const thread = await Thread.getThreadById(thread_id);

        if (!thread) {
            return "thread not found";
        }

        const reply = thread.replies.find(item => item._id == reply_id);

        if (!reply) {
            return "reply not found";
        }

        for (let i = 0; i < thread.replies.length; i = i + 1) {
            let item = thread.replies[i];

            if (item._id == reply_id) {
                item.reported = true;
            }
        }

        // request for datalayer
        const req = {
            find: { _id: thread_id },
            update: { $set: { replies: thread.replies } }
        }

        const response = await Thread.updateThread(req);

        return "success";
    },

    deleteReply: async function (params) {

        let { thread_id, reply_id, delete_password } = params;

        let thread = await Thread.getThreadById(thread_id);

        if (!thread) {
            return "thread not found";
        }

        const reply = thread.replies.find(item => item._id == reply_id);

        if (!reply) {
            return "reply not found";
        }

        if (reply.delete_password != delete_password) {
            return "incorrect password";
        }

        for (let i = 0; i < thread.replies.length; i = i + 1) {
            let item = thread.replies[i];

            if (item._id == reply_id) {
                item.text = "[deleted]";
            }
        }

        // request for datalayer
        const req = {
            find: { _id: thread_id },
            update: { $set: { replies: thread.replies } }
        }

        const response = await Thread.updateThread(req);

        return "success";
    },
}