const express = require('express')
const mysql_dao = require('./mysql_dao')
const mongo_dao = require('./mongo_dao')

const app = express()
const port = 3004

app.get('/', (req, res) => {
    mysql_dao.get_all_product()
    .then((data) => {
        res.send(data)
    }).catch((err) => {
        console.log(err)
    })
})

app.listen(port, () => {
    console.log(`\nListening on port ${port}`)
    console.log(`Go to http://localhost:${port}/`)
})