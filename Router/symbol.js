const express = require('express');
const jwt = require('jsonwebtoken');
const {Shop} = require('../model/Schema');


const access = async (user)=>{
    try {
        const data = await Shop.find();
       

        return{data:data[0]}

    } catch (error) {
        console.log(error);
    }
}


module.exports = access