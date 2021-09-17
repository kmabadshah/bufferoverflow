import {db} from '../main.js'

/*
 *
 * wtc is an acronym for wrapped_in_try_catch
 * it's a simple try-catch wrapper
 * takes a function and returns the same function, but try-catch included
 * example:
 *   const do_something = wtc((str) => {
 *     return str
 *   })
 *
 *   do_something(`hello world`) === `hello world`
 *
*/
export function wtc(f) {
  const is_async = f.constructor.name === `AsyncFunction`

  if (is_async) {
    return async function() {
      try {
        return await f.apply(this, arguments)
      }
      catch(e)
      {
        console.log(`-------------ERROR_BEGIN---------`)
        console.dir(e)
        console.trace(e)
        console.log(`-------------ERROR_END---------`)

        for (let v of arguments)
        {
          if (v.constructor.name === `ServerResponse`)
          {
            v.status(500).send()
          }
        }

      }
    }
  }

  return function() {
    try {
      return f.apply(this, arguments)
    }
    catch(e)
    {
      console.log(`-------------ERROR_BEGIN---------`)
      console.dir(e)
      console.trace(e)
      console.log(`-------------ERROR_END---------`)

      for (let v of arguments)
      {
        if (v.constructor.name === `ServerResponse`)
        {
          v.status(500).send()
        }
      }

    }
  }
}




/* 
 * implementation for building websocket messages 
 * EXAMPLE:
 *  {
 *    signal: syn,
 *    action: UPDATED,
 *    table: questions
 *  }
* */
export class Message {
    constructor({signal, action, table}) {
        if (!signal) {
            throw `missing  fields in the object passed to new Message()`
        }

        const signals_enum = [`syn`, `ack`, `fin`]
        const table_names_enum = [
            `questions`, 
            `already_voted_questions`,
            `question_comments`, 
            `already_voted_question_comments`, 

            `answers`, 
            `already_voted_answers`,
            `answer_comments`, 
            `already_voted_answer_comments`
        ]
        const actions_enum = [
            `UPDATED`,
            `DELETED`,
            `CREATED`,
        ]
        
        if (!signals_enum.includes(signal)) 
            throw `invalid signal`

        if (action && !table) throw `missing field table`
        if (table && !action) throw `missing field action`
        if (action && table && !table_names_enum.includes(table))
            throw `invalid table name: ${table}`
        if (action && table && !actions_enum.includes(action))
            throw `invalid action name: ${action}`

        this.action = action
        this.table = table
        this.signal = signal
    }
}



/*
 *
 * helper function to increment/decrement the vote_count field
 * in the any of the following tables: questions, answers, question_comments
 *
 * the id for /comment/.match(table_name) === false will be table_name+'_id'
 * the id for /comment/.match(table_name) === true will be comment_id
 *
 * */
export const increment_or_decrement_table_vote_async = wtc(async (req, res, table_name_singular, flag) => {
  if (
    !table_name_singular ||
    (
      table_name_singular !== `question`
      && table_name_singular !== `answer`
      && table_name_singular !== `question_comment`
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


  let id_field_name;
  if (/comment/.test(table_name_singular))
  {
    id_field_name = `comment_id`
  }
  else
  {
    id_field_name = table_name_singular + '_id'
  }


  const row_id = req.params[id_field_name]
  let db_res = await db.oneOrNone(`
        select * from ${table_name_plural}
        where ${id_field_name}=$1
    `, [row_id])
  if (!db_res) {
    return res.status(400).send(`invalid id`)
  }

  await db.oneOrNone(`
        update ${table_name_plural}
        set vote_count = vote_count ${flag === `increment` ? `+1` : `-1`}
        where ${id_field_name}=$1
    `, [row_id])
  res.status(204).send()
})




