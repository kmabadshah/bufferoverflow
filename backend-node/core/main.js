const express = require('express')
const axios = require('axios')
const app = express()
const port = 8000

const pgp = require('pg-promise')()
const db = pgp('postgres://awkward:awk@localhost:5432/bufferoverflow')

app.use(express.json())

// cors middleware
app.use((req, res, next) => {
    res.header({
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'PUT, GET, DELETE',
        'Access-Control-Allow-Headers': 'content-type',
    })
    next()
})

// handle outbound client requests
app.post('/cors', async(req, res) => {
    try {
        const {url, method, data} =  req.body

        if (!url || !method) {
            return res.status(400).send(`
                missing fields, must contain url, method and optional data field
            `)
        }

        const query_conf = {
            url, method
        }
        if (data) {
            query_conf['data'] = data
        }

        const query_res = await axios(query_conf)
        res.status(200).send({query_data: query_res.data, query_status: query_res.status})
    } catch(e) {
        console.log("ERROR: ", e)
    }
})

app.post('/users', async (req, res) =>  {
    try{
        // get the post data BEGIN
        const {username, image_url, profile_description} = req.body
        if (!username || !image_url || (profile_description != "" && profile_description)) {
            return res.status(400).send('missing fields')
        }
        // get the post data END



        // check if the user already exists BEGIN
        let db_res = await db.oneOrNone(`
            select * from users where username=$1
            or image_url=$2
            or profile_description=$3
        `, [username, image_url, profile_description])
        if (db_res) {
            return res.send(`user already exists`)
        }
        // check if the user already exists END



        // insert and return user BEGIN
        await db.none(`
            insert into users (username, image_url, profile_description)
            values ($1, $2, $3)
        `, [username, image_url, profile_description])

        db_res = await db.one(`
            select * from users
            where username=$1
        `, [username])

        res.status(200).send(db_res)
        // insert and return user END

    } catch(e) {
        console.log("ERROR: ", e)
    }
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
