/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const threadController = require("../controller/threadController");

module.exports = function (app) {

    app.route('/api/threads/:board')
        .get(async function (req, res) {

            const params = { board: req.params.board }
            const result = await threadController.getMostRecent10Threads(params);
            res.json(result);
        })

        .post(async function (req, res) {

            const params = {
                text: req.body.text,
                delete_password: req.body.delete_password,
                board: req.params.board
            }

            const result = await threadController.createThread(params);

            res.redirect(`/b/${req.params.board}`);
        })

        .put(async function (req, res) {

            const params = {
                thread_id: req.body.thread_id
            }

            const result = await threadController.reportThread(params);

            res.json(result);
        })

        .delete(async function (req, res) {

            const params = {
                thread_id: req.body.thread_id,
                delete_password: req.body.delete_password
            }

            const result = await threadController.deleteThread(params);

            res.json(result);
        })


    app.route('/api/replies/:board')
        .get(async function (req, res) {
            
            const params = { thread_id: req.query.thread_id }
            const result = await threadController.getThreadWithAllReplies(params);
            res.json(result);
        })

        .post(async function (req, res) {

            const params = {
                thread_id: req.body.thread_id,
                text: req.body.text,
                delete_password: req.body.delete_password,
            }

            await threadController.addReplyToThread(params);

            res.redirect(`/b/${req.params.board}/${req.body.thread_id}`);
        })

        .put(async function (req, res) {

            const params = {
                thread_id: req.body.thread_id,
                reply_id: req.body.reply_id
            }

            const result = await threadController.reportReply(params);

            res.json(result);
        })

        .delete(async function (req, res) {

            const params = {
                thread_id: req.body.thread_id,
                reply_id: req.body.reply_id,
                delete_password: req.body.delete_password
            }

            const result = await threadController.deleteReply(params);

            res.json(result);
        })

};
