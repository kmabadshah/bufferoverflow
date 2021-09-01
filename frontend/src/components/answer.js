import React from 'react'

export default function Answer({answer_obj}) {
    const [answer_upvoted_or_downvoted, set_answer_upvoted_or_downvoted] = React.useState(false)

    return (
        <div className={`flex mt-40`} key={answer_obj.answer_id}>
            <div className={`flex flex-col align-center border border-red-900`}>
                {/* vote_up_icon */}
                <button onClick={handle_answer_vote_up_click}>vote_up</button>

                {/* vote_count */}
                <p className={`text-center`}>{answer_obj.vote_count}</p>

                {/* vote down icon */}
                <button onClick={handle_answer_vote_down_click}>vote_down</button>
            </div>

            {/* answer text */}
            <div className={`ml-20`}>{answer_obj.text}</div>
        </div>
    )


    async function handle_answer_vote_up_click() {
        // check if already voted
        // make the request to backend api
        // GET /increment_vote/answers/{answer_id}
        // update the local state

        if (answer_upvoted_or_downvoted) {
            return
        }

        set_answer_upvoted_or_downvoted(`upvoted`)
    }

    async function handle_answer_vote_down_click() {
        // check if already voted or vote count is zero
        // make the request to backend api
        // GET /increment_vote/answers/{answer_id}
        // update the local state

        if (answer_upvoted_or_downvoted) {
            return
        }
        set_answer_upvoted_or_downvoted(`upvoted`)
    }
}
