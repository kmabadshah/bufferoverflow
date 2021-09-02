import {db} from '../main.js'

export async function answer_create_async(req, res) {
    const ans_obj = req.body

    // check if the answer exists
    // return 400 with `duplicate answer` if it does

    if (!ans_obj.text || !ans_obj.user_id || !ans_obj.question_id) {
        return res.status(400).send(`missing fields`)
    }

    let db_res = await db.oneOrNone(`
        select * from answers
        where text=$1
    `, [ans_obj.text])

    if (db_res) {
        return res.status(400).send(`duplicate answer`)
    }

    // create the answer
    await db.none(`
        insert into answers (text, user_id, question_id)
        values ($1, $2, $3)
    `, [ans_obj.text, ans_obj.user_id, ans_obj.question_id])


    // fetch the answer
    db_res = await db.one(`
        select * from answers
        where text=$1
    `, [ans_obj.text])

    res.status(200).send(db_res)
}

export async function answer_get_async(req, res) {
    const question_id = req.params.question_id

    const db_res = await db.manyOrNone(`
        select * from answers
        where question_id=$1
    `, [question_id])

    if (!db_res) {
        res.status(400).send(`invalid question_id`)
    }

    res.status(200).send(db_res)
}
