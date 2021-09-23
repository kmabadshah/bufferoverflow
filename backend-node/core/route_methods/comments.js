import {db} from '../main.js'
import {wtc, error_log, notify_active_clients} from './shared.js'

// POST /comments/{question_id}
export const question_comment_create_async = async (req, res) => { try {
  const question_id = req.params.question_id
  const {text, user_id} = req.body

  if (!text)
    return res.status(400).send(`invalid text field value`)

  if (!user_id)
    return res.status(400).send(`invalid user_id field value`)

  // check for duplicate comment text
  let db_res = await db.oneOrNone(`
      select * from question_comments
      where text=$1
    `, [text])

  if (db_res)
    return res.status(400).send(`duplicate text field value`)

  await db.none(`
    insert into question_comments
    (text, question_id, user_id)
    values ($1, $2, $3)
  `, [text, question_id, user_id])

  db_res = await db.one(`
    select * from question_comments
    where text=$1 and question_id=$2 and user_id=$3
  `, [text, question_id, user_id])

  res.status(200).send(db_res)
  notify_active_clients({
    signal: `syn`,
    event: `created`,
    data: {
      table: `question_comments`,
      comment_id: db_res.comment_id
    }
  })

} catch(e) {error_log(e)} }





export const question_comment_get_async = wtc(async(req, res) => {
  const question_id = req.params.question_id

  const db_res = await db.any(`
      select * from question_comments
      where question_id=$1
    `, [question_id])

  res.status(200).send(db_res)
})




export const question_comment_get_one_async = wtc(async(req, res) => {
  const comment_id = req.params.comment_id

  const db_res = await db.oneOrNone(`
      select * from question_comments
      where comment_id=$1
    `, [comment_id])

  res.status(200).send(db_res)
})



export const question_comment_update_async = wtc(async(req, res) => {
  const comment_id = req.params.comment_id
  const {text} = req.body

  if (!text)
    return res.status(400).send(`invalid text field value`)

  await db.none(`
    update question_comments
    set text=$1 where comment_id=$2
  `, [text, comment_id])

  res.status(204).send()
  notify_active_clients({
    signal: `syn`,
    event: `updated`,
    data: {
      table: `question_comments`,
      comment_id: comment_id
    }
  })

})













/* ANSWER COMMENTS */
export async function answer_comment_create_async(req, res) {try {
  const answer_id = req.params.answer_id
  const {text, user_id} = req.body

  if (!text) {
    return res.status(400).send(`missing text field`)

  } else if (!user_id) {
    return res.status(400).send(`missing user_id field`)
  }

  await db.none(`
    insert into answer_comments
    (answer_id, text, user_id)
    values 
    ($1, $2, $3)
  `, [answer_id, text, user_id])

  const db_res = await db.one(`
    select * from answer_comments
    where answer_id=$1
    and text=$2
    and user_id=$3
  `, [answer_id, text, user_id])

  res.status(200).send(db_res)
  notify_active_clients({
    signal: `syn`,
    event: `created`,
    data: {
      table: `answer_comments`,
      comment_id: db_res.comment_id
    }
  })

}catch(e){error_log(e,res)}}



export async function answer_comment_get_async(req,res) {try{
  const answer_id = req.params.answer_id
  const db_res = await db.any(`
      select * from answer_comments
      where answer_id=$1
    `, [answer_id])

  res.status(200).send(db_res)

}catch(e){error_log(e,res)}}


export async function answer_comment_get_one_async(req,res) {try{
  const comment_id = req.params.comment_id
  const db_res = await db.oneOrNone(`
      select * from answer_comments
      where comment_id=$1
    `, [comment_id])

  res.status(200).send(db_res)

}catch(e){error_log(e,res)}}



export const answer_comment_update_async = wtc(async(req, res) => {
  const comment_id = req.params.comment_id
  const {text} = req.body

  if (!text)
    return res.status(400).send(`invalid text field value`)

  await db.none(`
    update answer_comments
    set text=$1 where comment_id=$2
  `, [text, comment_id])

  res.status(204).send()
  notify_active_clients({
    signal: `syn`,
    event: `updated`,
    data: {
      table: `answer_comments`,
      comment_id: comment_id
    }
  })
})

