$(document).ready(function () {
  var messageAppReference = firebase.database();
  const $messageBoard = $('.message-board');

  $('#message-form').submit(function (event) {
    // by default a form submit reloads the DOM which will subsequently reload all our JS
    // to avoid this we preventDefault()
    event.preventDefault();

    // grab user message input
    let message = $('#message').val();

    // clear message input (for UX purposes)
    $('#message').val('');

    // create a section for messages data in your db
    let messagesReference = messageAppReference.ref('messages');

    // use the set method to save data to the messages
    messagesReference.push({
      message: message,
      votes: 0,
    });
  });

  (function getFanMessages() {
    // use reference to app database to listen for changes in messages data
    messageAppReference.ref('messages').on('value', function (results) {
      const allMessages = results.val();
      const messages = [];

      // iterate through results coming from database call; messages
      for (let msg in allMessages) {
        // get method is supposed to represent HTTP GET method
        let message = allMessages[msg].message;
        let numOfVotes = allMessages[msg].votes;

        // create message element
        let $messageListElement = $('<li></li>');

        // create delete element
        let $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');

        $deleteElement.on('click', function (e) {
          let id = $(e.target.parentNode).data('id');
          deleteMessage(id);
        });

        // create up vote element
        let $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>');
        $upVoteElement.on('click', function (e) {
          let id = $(e.target.parentNode).data('id');
          updateMessage(id, ++numOfVotes);
        });

        // create down vote element
        let $downVoteElement = $(
          '<i class="fa fa-thumbs-down pull-right"></i>'
        );
        $downVoteElement.on('click', function (e) {
          // console.log('down clicked', numOfVotes);
          let id = $(e.target.parentNode).data('id');
          updateMessage(id, --numOfVotes);
        });

        // add id as data attribute so we can refer to later for updating
        $messageListElement.attr('data-id', msg);

        // add message to li
        $messageListElement.html(message);

        // add delete element
        $messageListElement.append($deleteElement);

        // add voting elements
        $messageListElement.append($upVoteElement);
        $messageListElement.append($downVoteElement);

        // show votes
        $messageListElement.append(
          '<div class="pull-right">' + numOfVotes + '</div>'
        );
        // push element to array of messages
        messages.push($messageListElement);
      }
      // remove lis to avoid dupes
      $messageBoard.empty();
      for (let i in messages) {
        $messageBoard.append(messages[i]);
      }
    });
  })();

  function updateMessage(id, votes) {
    // find message whose objectId is equal to the id we're searching with
    var messageReference = messageAppReference.ref('messages/' + id);

    // update votes property
    messageReference.update({ votes });
  }

  function deleteMessage(id) {
    // find message whose objectId is equal to the id we're searching with
    var messageReference = messageAppReference.ref('messages/' + id);

    messageReference.remove();
  }
});
