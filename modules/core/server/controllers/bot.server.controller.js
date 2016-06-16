'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  config = require(path.resolve('./config/config'));

var Bio = mongoose.model('Bio');
var Review = mongoose.model('Review');

/**
 * Create a Bot
 */
exports.create = function (req, res) {

};

/**
 * Show the current Bot
 */
exports.read = function (req, res) {

};

/**
 * Update a Bot
 */
exports.update = function (req, res) {

};

/**
 * Delete an Bot
 */
exports.delete = function (req, res) {

};

/**
 * List of Bots
 */
exports.list = function (req, res) {

};

var extractYoutubeId = function(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : url;
};

var makeYoutubeUrl = function(videoId) {
  return 'https://www.youtube.com/watch?v=' + videoId;
}

var stringIsEmpty = function(text) {
  return !text || !/\S/.test(text);
}

var noEmptyStringReploy = 'Please enter a value with the command';

//run the bot
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: config.slackToken
})

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
  console.log('Slack bot started');
});

controller.hears(["^!help$"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
  bot.reply(message,'Try the following commands: ```!bio id``` - read a bio. Note id is without the @, ```!writebio contents``` - to post your bio, ```!reviews [full]``` - to get a list of available reviews, ```!review id|url``` - to read a review, ```!review id|url contents``` - to write a review for url');
});


controller.hears(["^!bio$", "^!bio\\s+(.*)"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
  var userName = message.match[1];
  if (stringIsEmpty(userName)) {
    return bot.reply(message,noEmptyStringReploy);
  }

  Bio.findOne({user:userName}).then(function(bio) {
    console.log(bio);
    if(!bio) {
      return bot.reply(message,'No bio found for user ' + userName);
    }
    bot.reply(message,'User ' + userName + ' bio is: ' + bio.content );

  }, function(err) {
    console.log('Error', err);
    return bot.reply(message,'Error occurred when looking up bio for user ' + userName);
  });
});

controller.hears(["^!writebio$", "^!writebio\\s+(.*)"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
  var bio = message.match[1];
  if (stringIsEmpty(bio)) {
    return bot.reply(message,noEmptyStringReploy);
  }

  bot.api.users.info({user: message.user}, function(err, info){
    if(err) {
      console.log('Error', err);
      return bot.reply(message,'Error occurred when updating up bio for user ' + bio);
    }
    if(!info || !info.user || !info.user.name) {
      console.log('Error: no user');
      return bot.reply(message,'Error occurred when updating up bio for user ' + bio);
    }

    console.log('User', info);

    var username = info.user.name;
    Bio.findOneAndUpdate({user:username}, {user:username,content:bio}, {upsert:true}, function(err, updated) {
      if(err) {
        console.log('Error saving ', err);
        return bot.reply(message,'Error occurred when updating up bio for user ');
      }
      console.log(bio);
      bot.reply(message,'User ' + username + ' bio is updated to: ' + bio );
    }, function(err) {
      console.log('Error', err);
      return bot.reply(message,'Error occurred when updating up bio for user ' + bio);
    });

  });
});


controller.hears(["^!reviews$", "^!reviews full$"],["direct_message","direct_mention","mention","ambient"],function(bot, message) {

  var msg = message.match[0];
  console.log(msg);

  bot.api.users.info({user: message.user}, function(err, info) {
    if(err) {
      console.log('Error', err);
      return bot.reply(message,'Error occurred when fetching reviews ' );
    }
    if(!info || !info.user || !info.user.name) {
      console.log('Error: no user');
      return bot.reply(message,'Error occurred when fetching reviews ' );
    }

    console.log('User', info);

    var username = info.user.name;
    Review.find({}, function(err, reviews) {
      if(err) {
        console.log('Error fetching reviews ', err);
        return bot.reply(message,'Error occurred when fetching reviews ' );
      }

      if(!reviews || !reviews.length) {
        console.log('Error fetching reviews - nothing found ');
        return bot.reply(message,'No reviews found ');
      }

      var string = reviews.map(function(review) {
        return review.youtube;
      }).join(',');

      if(msg == '!reviews full') {
        string = reviews.map(function(review) {
          return makeYoutubeUrl(review.youtube)+ ':\n' + review.content;
        }).join('\n');
      }


      bot.reply(message,'Reviews are available for these videos: ' + string );
    }, function(err) {
      console.log('Error', err);
      return bot.reply(message,'Error occurred when updating up bio for user ' );
    });
  });
});

controller.hears(["^!review","^!review\\s+([^\\s]*)\\s?(.*)$"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {

  var video_id = message.match[1];
  if (stringIsEmpty(video_id)) {
    return bot.reply(message,noEmptyStringReploy);
  }

  video_id = video_id.trim();

  var youtubeId = extractYoutubeId(video_id);

  bot.api.users.info({user: message.user}, function (err, info) {
    if (err) {
      console.log('Error', err);
      return bot.reply(message, 'Error occurred when updating review');
    }
    if (!info || !info.user || !info.user.name) {
      console.log('Error: no user');
      return bot.reply(message, 'Error occurred when updating review');
    }

    var review = message.match[2];
    if (!stringIsEmpty(review)) {
      review = review.trim();
      var username = info.user.name;
      Review.findOneAndUpdate({user: username, youtube:youtubeId}, {user: username, youtube:youtubeId, content:review}, {upsert: true}, function (err, reviewUpdated) {
        if (err) {
          console.log('Error saving ', err);
          return bot.reply(message, 'Error occurred when updating up review');
        }
        console.log(review);
        bot.reply(message, 'User ' + username + ' review for video '+ makeYoutubeUrl(youtubeId) + ' is updated to: \n' + review );
      }, function (err) {
        console.log('Error', err);
        return bot.reply(message, 'Error occurred when updating review for video ' + youtubeId);
      });

    } else {
      Review.find({youtube:youtubeId}).then(function(reviews) {
        if(!reviews) {
          return bot.reply(message,'No review found for ' + youtubeId);
        }

        console.log(reviews);

        var string = reviews.map(function(review) {
          return review.content;
        }).join('\n');
        bot.reply(message,'Reviews for video ' + makeYoutubeUrl(youtubeId) + ' are the following:\n'+ string );

      }, function(err) {
        console.log('Error', err);
        return bot.reply(message,'Error occurred when looking up reviews for video ' + youtubeId);
      });
    }
  });

});
