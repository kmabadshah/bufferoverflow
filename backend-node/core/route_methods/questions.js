import {db, sockets} from '../main.js'
import {wtc, error_log, notify_active_clients} from './shared.js'

export async function question_create_async(req, res) { try {
    // get the post data BEGIN
    const question_obj = req.body
    const {title, description, user_id} = question_obj

    if (!title || !description || !user_id) {
        return res.status(400).send('missing fields')
    }


    // check if the question already exists
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
    notify_active_clients({
        signal: `syn`,
        event: `created`,
        data: {
            table: `questions`,
            question_id: db_res.question_id
        }
    })

} catch(e) {error_log(e, res)} } 








export async function question_get_async(req, res) { try {
    // make the request to database
    // check if the id is valid
    // if not valid, send 400 with `invalid id`
    // get the question
    // return the question with 200

    const question_id = req.params.question_id

    if (!question_id)
        return res.status(400).send(`invalid question_id`)

    let db_res = await db.oneOrNone(`
            select * from questions
            where question_id=$1
        `, [question_id])

    if (!db_res) {
        return res.status(400).send(`invalid id`)
    }

    res.status(200).send(db_res)

} catch(e) {error_log(e)} }








export async function question_update_async(req, res) { try {
    const question_id = req.params.question_id
    const {description} = req.body

    if (!description)
        return res.status(400).send(`invalid description`)

    await db.none(`
        update questions
        set description=$1
        where question_id=$2
        `, [description, question_id])

    res.status(204).send()
    notify_active_clients({
        signal: `syn`,
        event: `updated`,
        data: {
            table: `questions`,
            question_id: question_id
        }
    })

} catch(e) {error_log(e)} }








export async function question_get_all_async(req, res) {
    const user_id = req.params.user_id

    const db_res = await db.any(`
    select * from questions
  `)

    return res.status(200).send(db_res)
}


