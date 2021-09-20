import {db, sockets} from '../main.js'
import {wtc, notify_active_clients} from './shared.js'
import pako from 'pako'
import {createGzip} from 'zlib'
import { pipeline } from 'stream'
import { promisify } from 'util'
import {Readable, Writable} from 'stream'
import {error_log} from './shared.js'

export async function answer_create_async(req, res) { try {
    const ans_obj = req.body

    // check if the answer exists
    // return 400 with `duplicate answer` if it does
    if (!ans_obj.text || !ans_obj.user_id || !ans_obj.question_id) 
        return res.status(400).send(`missing fields`)


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

    
    notify_active_clients({
        signal: `syn`,
        table: `answers`
    })

} catch(e) { error_log(e, res) } }








export async function answer_get_async(req, res) { try {
    const question_id = req.params.question_id

    const db_res = await db.manyOrNone(`
            select * from answers
            where question_id=$1
        `, [question_id])

    if (!db_res) {
        res.status(400).send(`invalid question_id`)
    }

    res.status(200).send(db_res)

} catch(e) {error_log(e, res)} }








export async function answer_update_async(req, res) { try {
    const answer_id = req.params.answer_id
    const text = req.body.text

    if (!text) {
      req.status(200).send(`invalid text field value`)
    }

    await db.none(`
      update answers
      set text=$1
      where answer_id=$2
    `, [text, answer_id])

    res.status(204).send()
  }
  catch(e) { error_log(e, res) }
}
