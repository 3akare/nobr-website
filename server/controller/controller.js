const mongoose = require('mongoose');
let userDB = require('../model/model');

// Create a new user on Atlas
exports.create = (req, res) => {
    const user = new userDB({
        active: 'yes',
        status: '0'
    })

    user.save(user)
    .then((data) => {
        res.send(data._id)
    })
    .catch((err)=>{
        res.status(500).send({
            message: err.message || 'Some error occured while creating a create operation'
        })
    })
}

// Sets Leaving user to not active on Atlas
exports.leavingUserUpdate = (req, res) => {
    const userid = req.params.id;
    console.log(`Leaving userID is: ${userid}`);

    userDB.updateOne({_id: userid}, {$set: {active: "no", status: "0"}})
    .then((data) => {
        if(!data){
            res.status(404).send({
                message: `Cannot update user ${userid}. User Not Found`
            })
        }else{
            res.send("1 document updated");
        }
    }).catch((err) => {
        res.status(500).send({
            message: err.message || 'Error update user information'
        });
    })
}

// Sets a re-visiting user to active
exports.newUserUpdate = (req, res) => {
    const userid = req.params.id;
    console.log(`Revisited userID is: ${userid}`);

    userDB.updateOne({_id: userid}, {$set: {active: "yes"}})
    .then((data) => {
        if(!data){
            res.status(404).send({
                message: `Cannot update user ${userid}. User Not Found`
            })
        }else{
            res.send("1 document updated");
        }
    }).catch((err) => {
        res.status(500).send({
            message: err.message || 'Error update user information'
        });
    })
}

//Find a new user, that is active and isnt on a call, and isn't the local user
exports.remoteUserFind = (req, res) => {
    const nobruserID = req.body.nobruserID;
    console.log('nobrIDDD',nobruserID);
    userDB.aggregate([
        {
            $match: {
            _id: {$ne: new mongoose.Types.ObjectId(nobruserID)},
            active: "yes",
            status: "0",
            },
        },
        {$sample: {size: 1}},
    ]).limit(1)
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({
            message: error.message || 'Error occurred when retriving user information'
        })
    });
}