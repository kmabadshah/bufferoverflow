import {db} from '../main.js'

// POST /comments/{question_id}
export async function comment_create_async(req, res) {
  try {
    const question_id = req.params.question_id
    const {text} = req.body

    if (!text)
    {
      return res.status(400).send(`invalid text field value`)
    }

    await db.none(`
    insert into question_comments
    (text, question_id)
    values ($1, $2)
  `, [text, question_id])

    const db_res = await db.one(`
    select * from question_comments
    where text=$1 and question_id=$2
  `, [text, question_id])

    res.status(200).send(db_res)
  }
  catch(e)
  {
    console.dir(e)
    res.status(500).send()
  }
}

// GET /comments/{question_id}
export async function comment_get_async(req, res) {
  try {
    const question_id = req.params.question_id

    const db_res = await db.any(`
      select * from question_comments
      where question_id=$1
    `, [question_id])

    res.status(200).send(db_res)
  }
  catch(e)
  {
    console.dir(e)
    res.status(500).send()
  }
}
