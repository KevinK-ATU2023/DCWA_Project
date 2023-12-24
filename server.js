const express = require('express')
const mysql_dao = require('./mysql_dao')
const mongo_dao = require('./mongo_dao')
const ejs = require('ejs')
const { check, validationResult } = require('express-validator')

const app = express()
const port = 3004

const body_parser = require('body-parser')
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}\\index.html`)
})

app.get('/stores', async (req, res) => {
    let stores = undefined;

    await mysql_dao.get_all_store()
    .then((data) => {
        stores = data
    }).catch((error) => {
        console.log(error)
    })

    if (stores != undefined) {
        res.render('stores', { "stores": stores })
    }
})

app.get('/stores/edit/:sid', async (req,res) => {
    let store_id = req.params.sid
    let store = undefined;

    await mysql_dao.get_one_by_id(store_id)
    .then((data) => {
        store = data
    }).catch((error) => {
        console.log(error)
    })

    if (store != undefined) {
        res.render('edit_store', { 'store': store[0], "errors":undefined })
    }
})

app.post('/stores/edit/:sid', 
    [
        check("location").isLength({min: 1}).withMessage("Please enter Location"),
        check("manager_id").isLength({min: 4}, {max: 4}).withMessage("Manager ID should be 4 characters long")
    ],
    async (req, res) => {
        let manager_id = req.body.manager_id;
        let store_id = req.params.sid;
        let location = req.body.location;
        let manager = [];
        let store = [];
        const errors = validationResult(req)
        console.log(manager_id);

        await mysql_dao.get_one_by_manager_id(manager_id)
        .then((data) => {
            store = data
        }).catch((error) => {
            console.log(error)
        })

        await mongo_dao.find_by_id(manager_id)
        .then((data) => {
            // console.log(data)
            manager = data
        }) .catch((error) => {
            console.log(error)
        })

        console.log(store)


        if (store[0].length != 0 && store[0].sid != store_id) {
            errors.errors.push({ msg: "Manager ID already managing a store" })
        }

        if (errors.errors.length > 0) {
            res.render('edit_store', { "store": store[0], "errors":errors.errors })
        }
        else {
            await mysql_dao.update_location_by_id(store_id, location)
            .then((data) => {
                console.log(data)
            }).catch((error) => {
                console.log(error)
            })
            await mysql_dao.update_managerid_by_id(store_id, manager_id)
            .then((data) => {
                console.log(data)
            }).catch((error) => {
                console.log(error)
            })
            res.redirect(`http://localhost:${port}/stores`)
        }

    } 
)

app.get('/products', async (req, res) => {
    let products = undefined;

    await mysql_dao.get_all_products_and_price()
    .then((data) => {
        // console.log(data)
        products = data;
    }).catch((error) => {
        console.log(error)
    })

    if (products != undefined) {
        res.render("products", { "products":products })
    }
})

app.get('/products/delete/:pid', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`\nListening on port ${port}`)
    console.log(`Go to http://localhost:${port}/\n`)
    // console.log(`${__dirname}`)
})