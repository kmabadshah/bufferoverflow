import {db} from '../main.js'

export async function increment_or_decrement_table_vote_async(req, res, table_name_singular, flag) {
  try {
    if (
      !table_name_singular ||
      (
        table_name_singular !== `question`
        && table_name_singular !== `answer`
        && table_name_singular !== `comment`
      )
    ) {
      console.log(`invalid table_name_singular argument: increment_or_decrement_vote_async()`)
      return res.status(500)
    }
    const table_name_plural = table_name_singular + 's'

    if (flag !== `increment` && flag !== `decrement`)
    {
      console.log(`invalid flag argument: increment_or_decrement_vote_async()`)
      return res.status(500)
    }


    const row_id = req.params[`${table_name_singular}_id`]
    let db_res = await db.oneOrNone(`
        select * from ${table_name_plural}
        where ${table_name_singular}_id=$1
    `, [row_id])

    if (!db_res) {
      return res.status(400).send(`invalid id`)
    }

    await db.oneOrNone(`
        update ${table_name_plural}
        set vote_count = vote_count ${flag === `increment` ? `+1` : `-1`}
        where ${table_name_singular}_id=$1
    `, [row_id])

    res.status(204).send()
  }

  catch(e)
  {
    console.log(`-------------ERROR_BEGIN---------`)
    console.dir(e)
    console.trace(e)
    console.log(`-------------ERROR_END---------`)
  }
}
