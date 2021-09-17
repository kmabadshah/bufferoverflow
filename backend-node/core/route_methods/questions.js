import {db, sockets} from '../main.js'
import {Message, wtc} from './shared.js'

export async function question_create_async(req, res) {
    /*
     *
     * create a question if not exists,
     * return 400 and proper message is not exists
     *
     */

    // get the post data BEGIN
    const question_obj = req.body
    const {title, description, user_id} = question_obj

    if (!title || !description || !user_id) {
        return res.status(400).send('missing fields')
    }
    // get the post data END




    // check if the question already exists BEGIN
    let db_res_title = await db.oneOrNone(`
            select * from questions
            where title=$1
        `, [title])

    if (db_res_title) {
        return res.status(400).send(`duplicate title`)
    }

    let db_res_description = await db.oneOrNone(`
            select * from questions
            where description=$1
        `, [description])

    if (db_res_description) {
        return res.status(400).send(`duplicate description`)
    }
    // check if the question already exists END




    // insert and return question BEGIN
    await db.none(`
            insert into questions (title, description, user_id)
            values ($1, $2, $3)
        `, [title, description, user_id])

    const db_res = await db.one(`
            select * from questions
            where title=$1
        `, [title])


    res.status(200).send(db_res)




    // notify all active clients
    sockets.forEach(wtc(sc => {
        const message = new Message({
            signal: `syn`,
            action: `CREATED`,
            table: `questions`
        })
        sc.send(JSON.stringify(message))

        const int_val = setInterval(() => {
            // wait for `ack` signal
            // if no ack after 10 seconds, resend
            const latest_message_from_client = sc.latest_message_from_client || {}
            if (
                latest_message_from_client.signal === `ack` 
                && latest_message_from_client.action === message.action
                && latest_message_from_client.table === message.table

            ) clearInterval(int_val)

            else {
                if (sc) // not closed
                    sc.send(JSON.stringify(message))
                else // closed
                    clearInterval(int_val)
            }
        }, 1000 * 10)
    }))
}







export async function question_get_async(req, res) {
    // make the request to database
    // check if the id is valid
    // if not valid, send 400 with `invalid id`
    // get the question
    // return the question with 200

    const question_id = req.params.question_id

    let db_res = await db.oneOrNone(`
        select * from questions
        where question_id=$1
    `, [question_id])

    if (!db_res) {
        return res.status(400).send(`invalid id`)
    }

    res.status(200).send(db_res)
}








export async function question_update_async(req, res) {
    const question_id = req.params.question_id
    const {description} = req.body

    if (!description)
    {
        return res.status(400).send(`invalid description`)
    }

    await db.none(`
    update questions
    set description=$1
    where question_id=$2
  `, [description, question_id])

    return res.status(204).send()
}








export async function question_get_all_async(req, res) {
    const user_id = req.params.user_id

    const db_res = await db.any(`
    select * from questions
  `)

    return res.status(200).send(db_res)
}


