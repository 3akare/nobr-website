const express = require('express');
const route = express.Router();

const services = require('../services/render');
const controller = require('../controller/controller')

route.get('/', services.homeRoute);

route.get('/index', services.homeRoute);

route.get('/text-chat', services.textRoute);

route.get('/video-chat', services.videoRoute);

route.get('/legal', services.legalRoute);

route.post('/api/users', controller.create);

route.put('/leaving-user-update/:id', controller.leavingUserUpdate);

route.put('/new-user-update/:id', controller.newUserUpdate);

route.put('/update-on-engagment/:id', controller.updateOnEngagement);

route.put('/update-on-next/:id', controller.updateOnNext);

route.post('/get-remote-users', controller.remoteUserFind);

route.post('/get-next-user', controller.getNextUser);

module.exports = route;
