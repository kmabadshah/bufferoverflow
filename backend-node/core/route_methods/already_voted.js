import {db} from '../main.js'

export async function already_voted_questions_create_async(req, res) {
    try {
        // check if question_id and user_id is valid
        // if not, 400 with `invalid question id` or `invalid user id`

        const {question_id, user_id, vote_flag} = req.params
        if (!question_id || !user_id || !vote_flag) {
            return res.status(400).send(`missing fields`)
        }


        const valid_vote_flags = [`upvoted`, `downvoted`]
        if (!valid_vote_flags.includes(vote_flag)) {
            return res.status(400).send(`invalid vote flag`)
        }


        let db_res = await db.oneOrNone(`
            select * from questions
            where question_id=$1
        `, [question_id])

        if (!db_res) {
            return res.status(400).send(`invalid question_id`)
        }


        db_res = await db.oneOrNone(`
            select * from users
            where user_id=$1
        `, [user_id])

        if (!db_res) {
            return res.status(400).send(`invalid user_id`)
        }




        // insert into table alread_voted_questions
        await db.none(`
            insert into already_voted_questions
            (user_id, question_id, vote_flag)
            values ($1, $2, $3)
        `, [user_id, question_id, vote_flag])


        db_res = await db.one(`
            select * from already_voted_questions
            where user_id=$1 and question_id=$2 and vote_flag=$3
        `, [user_id, question_id, vote_flag])

        res.status(200).send(db_res)
    }

    catch(e) {
        console.log(`${e.stack}`)
    }
}







export async function already_voted_questions_get_async(req, res) {
    try {
        const {question_id, user_id} = req.params

        if (!question_id || !user_id) {
            return res.status(400).send(`missing fields`)
        }

        const db_res = await db.oneOrNone(`
            select * from already_voted_questions
            where question_id=$1 and user_id=$2
        `, [question_id, user_id])

        if (!db_res) {
            return res.status(400).send(`invalid user_id or question_id`)
        }

        res.status(200).send(db_res)
    }

    catch(e) {
        console.trace(e)
    }
}

