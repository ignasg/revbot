'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    default: '',
    required: 'User name cannot be blank',
    trim: true
  },
  //youtube video id
  youtube: {
    type: String,
    default: '',
    trim: true,
    required: 'Video id cannot be blank'
  },
  content: {
    type: String,
    default: null,
    required: 'Review cannot be blank',
    trim: true
  },
});

mongoose.model('Review', ReviewSchema);
