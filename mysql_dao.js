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

function get_all_product() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM product')
        .then((data) => {
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = { get_all_product }