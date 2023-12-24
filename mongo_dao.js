const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
    db = client.db('proj2023MongoDB')
    coll = db.collection('managers')
}).catch((error) => {
    console.log(error.message)
})

function find_all() {
    return new Promise((resolve, reject) => {
        let cursor = coll.find()
        cursor.toArray()
        .then((documents) => {
            resolve(documents)
        }).catch((error) => {
            reject(error)
        })
    })
}

function find_by_id(mid) {
    return new Promise((resolve, reject) => {
        let cursor = coll.find({ _id: mid })
        cursor.toArray()
        .then((documents) => {
            resolve(documents)
        }).catch((error) => {
            reject(error)
        })
    })
}

function add_manager(manager) {
    return new Promise((resolve, reject) => {
        coll.insertOne(manager)
        .then((documents) => {
            resolve(documents)
        }).catch((error) => {
            reject(error)
        })
    })
}

module.exports = { 
    find_all, 
    find_by_id, 
    add_manager 
}
