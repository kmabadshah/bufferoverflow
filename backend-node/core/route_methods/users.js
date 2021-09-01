import {db} from '../main.js'

export default async function create_users_conditionally(req, res) {
    /*
     *
     * create a user if not exists,
     * return existing user if exists
     *
    */

    try{
        // get the post data BEGIN
        let {username, image_url, profile_description} = req.body
        if (!username || !image_url) {
            return res.status(400).send('missing fields')
        }

        profile_description = profile_description || ""
        // get the post data END



        // check if the user already exists BEGIN
        let db_res = await db.oneOrNone(`
            select * from users where username=$1
            or image_url=$2
            or profile_description=$3
        `, [username, image_url, profile_description])
        if (db_res) {
            return res.status(200).send(db_res)
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
        res.status(500).send()
    }
}

