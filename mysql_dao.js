const pmysql = require('promise-mysql')
let pool;

pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
}).then((p) => {
    pool = p
    // console.log(pool)
}).catch((err) => {
    console.log('POOL ERROR:\n'+err)
})

function get_all_store() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

function get_one_by_id(id) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM store where sid="${id}"`)
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

function get_one_by_manager_id(id) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM store where mgrid="${id}"`)
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

function get_all_products_and_price() {
    return new Promise((resolve, reject) => {
        pool.query("select ps.pid, p.productdesc, s.sid, s.location, ps.price from product_store ps left join product p on ps.pid = p.pid left join store s on ps.sid = s.sid;")
        .then((data) => {
            resolve(data)
        }).catch((error) => {
            reject(error)
        })
    })
}

function update_location_by_id(id, location) {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE store SET location = "${location}" where sid="${id}"`)
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

function update_managerid_by_id(id, mid) {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE store SET mgrid = "${mid}" where sid="${id}"`)
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = { 
    get_all_store, 
    get_one_by_id,
    get_one_by_manager_id,
    get_all_products_and_price, 
    update_location_by_id,
    update_managerid_by_id
}