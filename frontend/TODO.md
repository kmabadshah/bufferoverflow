[*] TODO implement the /ask_question page
[*] TODO: implement the questions/{id} page
        [*] TODO: implement the voting system
        [*] TODO: implement the logic for writing answers

[*] TODO: unvote a question
[*] TODO: unvote a answer

[*] TODO: backend api for comment voting system
[*] TODO: replace webpack with snowpack
[*] TODO: cache all vote flags into redux store
[*] TODO: cache answer data
[*] TODO: process and cache question comment data
[*] TODO: question comment vote lock when logged out
[*] TODO: sort question comments based on 1) vote_count, 2) timestamp(low->high descending order, oldest first)
[*] TODO: comment vote locking
[*] TODO: unvote a comment

[*] TODO: replace mock qustion|answer|comment username with real data
[*] TODO: only authorized users should be able to edit questions,answers,comments

[*] TODO: test notification multiple clients
[*] TODO: update questions list upon receiving event
[*] TODO: update question answer upon receiving event
[*] TODO: update question comments upon receiving event
[] TODO: update question vote count upon receiving event
[] TODO: implement the notification system
[] TODO: implement answer comments
[] TODO: implement the user profile page
[] TODO: questions, answers, comments deletable by their owners
[] TODO: upgrade to HTTPS and WSS

* Whenever a client does a PUT, DELETE or POST, the server notifies
  all clients who are online.

* Enforce socket paylaod size

* use a client pool to manage active clients.
  [
    {
      username: null|`adnan`,
      ip: `192.168.1.16`,
      socket: ws(),
    },
    ...
  ] 

* messaging protocol: JSON
  {
    signal: syn|ack|fin,
    message: `PUT already_voted_questions`
  }

* If the messaging schema changes, log the client based on username(if available) and/or ip address


