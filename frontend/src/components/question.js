import React from 'react'

/*
 *
 * a page for one single question and all it's answers
 * url: /questions/{id}
 * questions and answers are upvotable
 * contains the following sections
 * row-1: title
 * row-2: timestamp
 * row-3: vote_counter on the left, description on the right
 * row-4: answer_button on the left, (user_image, username) on the right
 * row-5: all_answers
 *
 * one answer has the following sections
 * row-1: vote_counter on the left, description on the right
 * row-2(far-right): user_image, username
 *
*/

export default function Question() {
    return (
        <h1>page about a question</h1>
    )
}
