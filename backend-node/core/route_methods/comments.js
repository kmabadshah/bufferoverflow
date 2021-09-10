import {db} from '../main.js'
import {wtc} from './shared.js'

// POST /comments/{question_id}
export const comment_create_async = wtc(async (req, res) => {
  const question_id = req.params.question_id
  const {text, user_id} = req.body

  if (!text)
  {
    return res.status(400).send(`invalid text field value`)
  }

  if (!user_id)
  {
    return res.status(400).send(`invalid user_id field value`)
  }

  // check for duplicate comment text
  let db_res = await db.oneOrNone(`
      select * from question_comments
      where text=$1
    `, [text])

  if (db_res)
  {
    return res.status(400).send(`duplicate text field value`)
  }

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
})

// GET /comments/{question_id}
export const comment_get_async = wtc(async(req, res) => {
  const question_id = req.params.question_id

  const db_res = await db.any(`
      select * from question_comments
      where question_id=$1
    `, [question_id])

  res.status(200).send(db_res)
})


// PUT /comments/{comment_id} -d {text: `something`}
export const comment_update_async = wtc(async(req, res) => {
  const comment_id = req.params.comment_id
  const {text} = req.body

  if (!text)
  {
    return res.status(400).send(`invalid text field value`)
  }

  await db.none(`
    update question_comments
    set text=$1 where comment_id=$2
  `, [text, comment_id])

  res.status(204).send()
})
