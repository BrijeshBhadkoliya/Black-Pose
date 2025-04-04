const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcrypt');


router.get('/validate', (req, res)=>{
    res.render('validate')
})