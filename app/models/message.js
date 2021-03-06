'use strict';

// var Message = require('./fdsaf')
// Message.derp;

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore');

/**
 * Message Schema
 */
var MessageSchema = new Schema({
    created_on: {
        type: Date,
        default: Date.now
    },
    body: {
        type: String,
        default: '',
        trim: true
    },
    to: {
        type: String,
        default: '',
        trim: true
    },
    from: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Validations
 */
// ArticleSchema.path('title').validate(function(title) {
//     return title.length;
// }, 'Title cannot be blank');

/**
 * Statics
 */
MessageSchema.statics = {
  // Get messages from a User (phone number) that you pass in.
  getMessagesFromUser: function(userId, cb) {
    return this.find({
            $or: 
              [{ 'to':userId}, 
              {'from': userId}]
          }).exec(cb);
  },
  getMessagesFromUsers: function(userArray, cb) {
    // userArray must be an array of _just_ phone numbers.
    var arr = [];
    for(var i = 0; i < userArray.length; i++) {
      var obj = {};
      var obj2 = {};
      obj.to = userArray[i].phone_number;
      obj2.from = userArray[i].phone_number;
      arr.push(obj, obj2);
    };
    // Message has not yet been created, so no message will be retrieved.

    // Retrieve all messages where either the 'to' or the 'from' matches any phone numbers in
    // the array.
    var query = this.find({});
    query.or(arr);
    query.exec(function(err, messages) {
      if(err) {
        console.log(err);
      };

      var new_users = _.sortBy(JSON.parse(JSON.stringify(userArray)), function(obj){ 
        return obj.last_updated_on; }).reverse();

      for (var i = 0; i < new_users.length; i++) {
        var chat = [];
        new_users[i].chat = [];
        for (var j = 0; j < messages.length; j++) {
          if (new_users[i].phone_number == messages[j].to ||
            new_users[i].phone_number == messages[j].from) {
            chat.push(messages[j]);
          };
        };
        new_users[i].chat = chat;
      };
      cb(err, new_users);
    });
  }
};

mongoose.model('Message', MessageSchema);