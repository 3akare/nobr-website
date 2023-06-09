const express = require('express');
const route = express.Router();

const services = require('../services/render');

route.get('/', services.homeRoute);

route.get('/index', services.homeRoute);

route.get('/text-chat', services.textRoute);

route.get('/video-chat', services.videoRoute);

route.get('/legal', services.legalRoute);

module.exports = route;
