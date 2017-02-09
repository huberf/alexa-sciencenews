var alexa = require("alexa-app");
var reddit = require('fetch-reddit');

var redditReader = new alexa.app('reddit');
redditReader.launch((req, res) => {
  res.say('I can read you the top Reddit posts for any subreddit. Try saying latest science reddit post or third futurology post').shouldEndSession(false).reprompt('I\'m ready for you query');
});
redditReader.intent('LatestPost',
  {
    "slots": {"Subreddit": "SUBREDDIT"}
  },
  (req, res) => {
    if(!req.slot('Subreddit')) {
      res.say(`You need to provide the name of a subreddit. Try saying ask reader for reddit for the latest science post.`);
      res.send();
    }
    console.log('Checking subreddit ' + req.slot('Subreddit').split(" ").join(""));
    reddit.fetchPosts('r/' + req.slot("Subreddit").split(" ").join("")).then( data => {
      var posts = data.posts;
      res.say(`The latest post in the ${req.slot('Subreddit')} subreddit is, ${posts[posts.length - 1].title}`);
      res.send();
    });
    return false;
  }
);
redditReader.intent("SpecificPost",
    {
      "slots": [{"Index": "POST_LOCATION"}, {"Subreddit": "SUBREDDIT"} ],
      "utterances": ["{Index} post"]
    },
    function(req, res) {
      if(!req.slot('Subreddit')) {
        res.say(`You need to provide the name of a subreddit. Try saying ask reader for reddit for the fifth science post.`);
        res.send();
      }
      console.log('Checking subreddit ' + req.slot('Subreddit').split(" ").join(""));
      var items = {"1st": 0, "2nd": 1, "3rd": 2, "first": 0, "second": 1, "third": 2, '4th': 3, 'fourth': 3, '5th': 4, 'fifth': 4};
      reddit.fetchPosts('r/' + req.slot("Subreddit").split(" ").join("")).then( data => {
        posts = data.posts;
        try {
          res.say("Here is the " + req.slot("Index") + " post in the " + req.slot('Subreddit') + " subreddit. " + posts[(posts.length - 1) - items[req.slot("Index")]].title);
          res.send();
        } catch(err) {
          res.say("You asked for an incorrect post number. Ask again, requesting only for the first to the fifth one.").shouldEndSession(false).reprompt('I\'m still listening');
          res.send();
        }
      });
      return false;
    }
);
redditReader.intent('AMAZON.HelpIntent',
    {},
    (req, res) => {
      res.say('You can use me to read the latest posts from any subreddit simply, saying something like the latest science reddit post or third windows phone post').shouldEndSession(false).reprompt('I\'m still listening.');
    }
);
redditReader.intent("AMAZON.StopIntent",
  {
    "slots": [],
  },
  function(request, response) {
    console.log('Stopping skill');
    response.say("Goodbye.");
  }
);
redditReader.intent("AMAZON.CancelIntent",
  {
    "slots": [],
  },
  function(request, response) {
    console.log('Cancelling skill');
    response.say("Cancelled.");
  }
);

exports.handler = redditReader.lambda();