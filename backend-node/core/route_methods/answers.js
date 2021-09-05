import {db} from '../main.js'
import pako from 'pako'
import {createGzip} from 'zlib'
import { pipeline } from 'stream'
import { promisify } from 'util'
import {Readable, Writable} from 'stream'

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



export async function increment_or_decrement_answer_vote_async(req, res, flag) {
  // flag can only be `increment` or `decrement`
  // get the answer_id
  // check if answer_id is valid
  // if not valid, send 400 with `invalid id`
  // increment/decrement the answer with answer_id
  // get the new answer obj from db
  // send 200 with answer data

  if (flag !== `increment` && flag !== `decrement`) {
    console.log(`invalid flag argument: increment_or_decrement_vote_async()`)
    return res.status(500)
  }

  const answer_id = req.params.answer_id

  let db_res = await db.oneOrNone(`
        select * from answers
        where answer_id=$1
    `, [answer_id])

  if (!db_res) {
    return res.status(400).send(`invalid id`)
  }

  await db.oneOrNone(`
        update answers
        set vote_count = vote_count ${flag === `increment` ? `+1` : `-1`}
        where answer_id=$1
    `, [answer_id])

  db_res = await db.oneOrNone(`
        select * from answers
        where answer_id=$1
    `, [answer_id])

  res.status(200).send(db_res)
}
