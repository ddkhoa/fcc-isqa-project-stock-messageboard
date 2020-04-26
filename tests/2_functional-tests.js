/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const Thread = require("../datalayer/Thread");

chai.use(chaiHttp);

suite('Functional Tests', function () {

    suite('API ROUTING FOR /api/threads/:board', function () {

        let thread_id = "";
        let text = "Test thread";
        let delete_password = "delthread";

        suite('POST', function () {

            test(`create new thread with text and delete_password  
            => thread object in db, redirect`, function (done) {

                chai.request(server)
                    .post('/api/threads/general')
                    .send({ text, delete_password })
                    .end(function (err, res) {

                        assert.equal(res.status, 200); // ?

                        // server return a redirect, use datalayer to check data
                        Thread.getThreadByText(text)
                            .then(thread => {

                                thread_id = thread._id;

                                assert.isObject(thread, "thread should be saved in the db");
                                assert.isString(thread._id, "thread object should contain _id (string)");
                                assert.equal(thread.text, text,
                                    "the text of thread is equal the value in request");
                                assert.equal(thread.delete_password, delete_password,
                                    "the delete_password of thread is equal the value in request");
                                assert.property(thread, "created_on", "thread object should contain created_on");
                                assert.property(thread, "bumped_on", "thread object should contain bumped_on");
                                assert.isBoolean(thread.reported, "thread object should contain reported (boolean)");
                                assert.isArray(thread.replies, "thread object should contain replies (array)");

                                done();
                            })
                    })
            })
        });

        suite('GET', function () {

            test('get threads =>  most recent 10 threads with most recent 3 replies', function (done) {

                chai.request(server)
                    .get('/api/threads/general')
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.isArray(res.body.threads, "response should contain threads array");
                        assert.isAtMost(res.body.threads.length, 10, "threads should contain at most 10 elements");
                        assert.isObject(res.body.threads[0], "element of threads should be object");
                        assert.isString(res.body.threads[0]._id, "element of threads should contain _id (string)");
                        assert.isString(res.body.threads[0].text, "element of threads should contain text (string)");

                        assert.property(res.body.threads[0], "created_on", "element of threads should contain created_on");
                        assert.property(res.body.threads[0], "bumped_on", "element of threads should contain bumped_on");
                        assert.isArray(res.body.threads[0].replies, "element of threads should contain replies (array)");
                        assert.isAtMost(res.body.threads[0].replies.length, 3, "replies should contain at most 3 elements");

                        assert.isUndefined(res.body.threads[0].delete_password, "element of threads array should not contain delete_password");
                        assert.isUndefined(res.body.threads[0].reported, "element of threads array should not contain reported");

                        done();
                    })
            })

        });

        suite('PUT', function () {

            test('report a thread with correct thread_id => success', function (done) {

                chai.request(server)
                    .put('/api/threads/general')
                    .send({ thread_id })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "success");
                        done();
                    });
            });

            test('report a thread with thread_id not exist in db => no thread updated', function (done) {

                let thread_id = "notexist";

                chai.request(server)
                    .put('/api/threads/general')
                    .send({ thread_id })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "no thread updated");
                        done();
                    });
            });
        });

        suite('DELETE', function () {

            test('delete a thread with wrong password => incorrect password', function (done) {

                let wrong_password = "ABCD";

                chai.request(server)
                    .delete('/api/threads/general')
                    .send({ thread_id, delete_password: wrong_password })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "incorrect password");
                        done();
                    });
            });

            test('delete a thread with correct delete_password => success', function (done) {

                chai.request(server)
                    .delete('/api/threads/general')
                    .send({ thread_id, delete_password })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "success");
                        done();
                    });
            });

        });
    });

    suite('API ROUTING FOR /api/replies/:board', function () {

        let thread_id = "";
        let reply_id = "";
        let reply_text = "Test message";
        let reply_delete_password = "delmessage";

        suite('POST', function () {

            test(`post a reply to thread with text, delete_password & thread id  
            => update thread object in db, redirect`, function (done) {

                let text = "Test thread 2";
                let delete_password = "delthread2";

                // create a new thread to test
                chai.request(server)
                    .post('/api/threads/general')
                    .send({ text, delete_password })
                    .end(function (err, res) {

                        Thread.getThreadByText(text)
                            .then(thread => {

                                thread_id = thread._id;

                                chai.request(server)
                                    .post('/api/replies/general')
                                    .send({ thread_id, text: reply_text, delete_password: reply_delete_password })
                                    .end(function (err, res) {

                                        Thread.getThreadByText(text)
                                            .then(thread => {

                                                let lastReplies = thread.replies[thread.replies.length - 1];
                                                reply_id = lastReplies._id;

                                                assert.isObject(thread, "thread should be updated in the db");
                                                assert.isString(lastReplies._id, "replies should contain _id (string)");
                                                assert.equal(lastReplies.text, reply_text,
                                                    "replies message should equal the value in request");
                                                assert.equal(lastReplies.delete_password, reply_delete_password,
                                                    "replies delete_password should equal the value in request");
                                                assert.isBoolean(lastReplies.reported,
                                                    "replies should contain reported (boolean)");
                                                assert.property(lastReplies, "created_on",
                                                    "replies should contain created_on");
                                                assert.notEqual(thread.created_on, thread.bumped_on,
                                                    "thread bumped on should be updated");

                                                done();
                                            })
                                    })
                            })
                    })
            })
        });

        suite('GET', function () {

            test('get thread =>  a thread object with all replies, without delete_password and reported', function (done) {

                chai.request(server)
                    .get('/api/replies/general')
                    .query({ thread_id })
                    .end(function (err, res) {
                        
                        assert.equal(res.status, 200);
                        assert.isObject(res.body.thread, "response should contain thread object");
                        assert.equal(res.body.thread._id, thread_id, "thread_id should equal the value in request");
                        assert.isString(res.body.thread.text, "thread object should contain text (string)");
                        assert.property(res.body.thread, "created_on", "thread object should contain created_on");
                        assert.property(res.body.thread, "bumped_on", "thread object should contain bumped_on");
                        assert.isArray(res.body.thread.replies, "thread object should contain replies (array)");
                        assert.isUndefined(res.body.thread.delete_password, "thread object should not contain delete_password");
                        assert.isUndefined(res.body.thread.reported, "thread object should not contain reported");

                        done();
                    })
            });
        });

        suite('PUT', function () {

            test('report a message with correct thread_id and reply_id => success', function (done) {

                chai.request(server)
                    .put('/api/replies/general')
                    .send({ thread_id, reply_id })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "success");
                        done();
                    });
            });
        });

        suite('DELETE', function () {

            test('delete a message with wrong delete_password => incorrect password', function (done) {

                let wrong_password = "delmessag"; // missing "e"

                chai.request(server)
                    .delete('/api/replies/general')
                    .send({ thread_id, reply_id, delete_password: wrong_password })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "incorrect password");
                        done();
                    });
            });

            test('delete a message with correct thread_id, reply_id and delete_password => success', function (done) {

                chai.request(server)
                    .delete('/api/replies/general')
                    .send({ thread_id, reply_id, delete_password: reply_delete_password })
                    .end(function (err, res) {

                        assert.equal(res.status, 200);
                        assert.equal(res.body, "success");
                        done();
                    });
            });
        });

    });

});
