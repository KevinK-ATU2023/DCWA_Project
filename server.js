const express = require('express')
const app = express()
const port = 3004

app.get('/', (req, res) => {
    res.send('Hello from server')
})

app.listen(port, () => {
    console.log(`\nListening on port ${port}`)
    console.log(`Go to http://localhost:${port}/`)
})