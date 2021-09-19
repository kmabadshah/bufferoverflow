import {db, sockets} from '../main.js'

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
        try { return f.apply(this, arguments) }
        catch(e) {
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







/* utility function for error handling, optionally send 500 response as well */
export function error_log(e, res) {
    console.log(`-------------ERROR_BEGIN---------`)
    console.dir(e)
    console.trace(e)
    console.log(`-------------ERROR_END---------`)

    if (res && res.constructor.name === `ServerResponse`)
            res.status(500).send()
}






/* utility function to quickly notify all active clients about MESSAGE */
export function notify_active_clients(message) {
    if (message.constructor.name !== `Message`) 
        throw `invalid arugment type`

    sockets.forEach(sc => { if (sc.status !== `open`) return;
        sc.send(JSON.stringify(message))

        const int_val = setInterval(() => {
            // wait for `ack` signal
            // if no ack after 10 seconds, resend
            const latest_message_from_client = sc.latest_message_from_client || {}
            if (
                (latest_message_from_client.signal === `ack` 
                    && latest_message_from_client.action === message.action
                    && latest_message_from_client.table === message.table)
                || sc.status === `closed`

            ) clearInterval(int_val)

            else sc.send(JSON.stringify(message))

        }, 1000 * 10) 
    }) 
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
    constructor({signal, table}) {
        const signals_enum = [`syn`, `ack`, `fin`]

        if (!signals_enum.includes(signal)) 
            throw `invalid signal`
        if (!table)
            throw `missing parameter: table`

        this.signal = signal
        this.table = table
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




