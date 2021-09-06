import {db} from '../main.js'


export async function already_voted_table_create_async(req, res, table_name_singular)
{
    try {
        // check if table_name_singular is valid
        if (table_name_singular !== `answer` && table_name_singular !== `question`)
        {
            console.log(`Invalid argument table_name_singular`)
            return
        }

        const table_name_plural = table_name_singular + 's'

        // check if question_id and user_id is valid
        // if not, 400 with `invalid question id` or `invalid user id`

        const {user_id, vote_flag} = req.params
        let row_id = req.params.question_id || req.params.answer_id

        if (!row_id || !user_id || !vote_flag)
        {
            return res.status(400).send(`missing fields`)
        }


        const valid_vote_flags = [`upvoted`, `downvoted`]
        if (!valid_vote_flags.includes(vote_flag)) {
            return res.status(400).send(`invalid vote flag`)
        }


        /* object_id check */
        let db_res = await db.oneOrNone(`
            select * from ${table_name_plural}
            where ${table_name_singular}_id=$1
        `, [row_id])

        if (!db_res) {
            return res.status(400).send(`invalid ${table_name_singular}_id`)
        }


        /* user_id check */
        db_res = await db.oneOrNone(`
            select * from users
            where user_id=$1
        `, [user_id])

        if (!db_res) {
            return res.status(400).send(`invalid user_id`)
        }




        // check if already exists
        const exists = await db.oneOrNone(`
            select * from already_voted_${table_name_plural}
            where user_id=$1 and ${table_name_singular}_id=$2
        `, [user_id, row_id])

        if (!exists)
        {
            // insert into table
            await db.none(`
                insert into already_voted_${table_name_plural}
                (user_id, ${table_name_singular}_id, vote_flag)
                values ($1, $2, $3)
            `, [user_id, row_id, vote_flag])
        }
        else
        {
            // update existing table
            await db.none(`
                update already_voted_${table_name_plural}
                set vote_flag=$1
                where user_id=$2 and ${table_name_singular}_id=$3
            `, [vote_flag, user_id, row_id])
        }


        db_res = await db.one(`
            select * from already_voted_${table_name_plural}
            where user_id=$1 and ${table_name_singular}_id=$2
        `, [user_id, row_id])


        res.status(200).send(db_res)
    }

    catch(e) {
        console.trace(e.stack)
    }
}


export async function already_voted_table_get_async(req, res, table_name_singular) {
    try {
        // check if table_name_singular is valid
        if (table_name_singular !== `answer` && table_name_singular !== `question`)
        {
            console.log(`Invalid argument table_name_singular`)
            return
        }

        const user_id = req.params.user_id
        const row_id = req.params.question_id || req.params.answer_id
        const table_name_plural = table_name_singular + `s`

        if (!row_id || !user_id) {
            return res.status(400).send(`missing fields`)
        }

        const db_res = await db.oneOrNone(`
            select * from already_voted_${table_name_plural}
            where ${table_name_singular}_id=$1 and user_id=$2
        `, [row_id, user_id])

        if (!db_res) {
            return res.status(200).send([])
        }

        res.status(200).send(db_res)
    }

    catch(e) {
        console.trace(e)
    }
}





