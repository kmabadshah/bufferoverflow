import {db} from '../main.js'

export async function user_create_conditionally_async(req, res) {
    /*
     *
     * create a user if not exists,
     * return existing user if exists
     *
    */

    try{
        // get the post data BEGIN
        let {username, image_url, profile_description, user_id} = req.body
        if (!user_id && (!username || !image_url)) {
            return res.status(400).send('missing fields')
        }

        profile_description = profile_description || ""
        // get the post data END



        // check if the user already exists BEGIN
        let db_res = await db.oneOrNone(`
            select * from users where username=$1
            or image_url=$2
            or profile_description=$3
            or user_id=$4
        `, [username, image_url, profile_description, user_id])
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

        return res.status(200).send(db_res)
        // insert and return user END
    } catch(e) {
        console.log("ERROR: ", e)
        res.status(500).send()
    }
}
