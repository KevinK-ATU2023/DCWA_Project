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

    await mysql_dao.get_one_by_id_store(store_id)
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
        check("manager_id").isLength({min: 4, max: 4}).withMessage("Manager ID should be 4 characters long")
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

app.get('/products/delete/:pid', async (req, res) => {
    let product_id = req.params.pid
    let products = undefined;

    let errors = [];

    await mysql_dao.get_one_product_store_id(product_id)
    .then((data) => {
        // console.log(data)
        products = data;
    }).catch((error) => {
        console.log(error)
    })

    for (var e of products) {
        if (e.sid.length > 0 ) {
            errors.push({
                msg: `${e.pid} is currently in stores and cannot be deleted`
            })

            break;
        }
    }
    res.render("delete_product", { "errors": errors });

    if (errors.length == 0) {

        await mysql_dao.delete_product_store(product_id)
        .then((data) => {
            console.log(data)
        }).catch((error) => {
            console.log(error)
        })

        res.redirect("/products")
    }
})

app.get('/managers', async (req, res) => {
    let managers = undefined;

    await mongo_dao.find_all()
    .then((data) => {
        // console.log(data)
        managers = data
    }).catch((error) => {
        console.log(error)
    })
    console.log(managers)

    if (managers != undefined) {
        res.render("managers", { "managers":managers })
    }
})

app.get('/managers/add', (req, res) => {
    res.render("add_managers", { "errors": undefined })
})

app.post('/managers/add', 
    [
        check("mid").isLength({min: 4, max: 4}).withMessage("Manager ID must be 4 characters"),
        check("name").isLength({min: 5}).withMessage("Name must be > 5 characters"),
        check("salary").isFloat({min: 30000, max: 70000}).withMessage("Salary must be between 30,000 and 70,000")
    ]
    ,async (req, res) => {
        let managers_check = undefined; 
        let errors = validationResult(req);
        // console.log(req.body)

        let new_manager = {
            _id: req.body.mid,
            name: req.body.name,
            salary: req.body.salary
        }
        // console.log(errors.errors)

        await mongo_dao.find_by_id(new_manager._id)
        .then((data) => {
            // console.log(data);
            managers_check = data;
        }).catch((error) => {
            console.log(error)
        })

        if (managers_check.length > 0) {
            errors.errors.push({ msg: `Manager ${new_manager._id} already exists in MongoDB` })
        }
        
        errors.errors.forEach((e) => {
            console.log(e.msg)
        })
        
        if (errors.errors.length == 0) {
            await mongo_dao.add_manager(new_manager)
            .then((data) => {
                console.log(`Manager ${new_manager._id}: added to database`)
            }).catch((error) => {
                console.log(error.message)
            })

            res.redirect('/managers')
        }
        else {
            res.render("add_managers", { "errors": errors.errors })
        }
    }
)

app.listen(port, () => {
    console.log(`\nListening on port ${port}`)
    console.log(`Go to http://localhost:${port}/\n`)
    // console.log(`${__dirname}`)
})