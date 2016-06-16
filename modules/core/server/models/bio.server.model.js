'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Bio Schema
 */
var BioSchema = new Schema({
  user: {
    type: String,
    default: '',
    required: 'User name cannot be blank',
    trim: true,
    unique: true
  },
  content: {
    type: String,
    default: '',
    required: 'Bio content cannot be blank',
    trim: true
  },
});

mongoose.model('Bio', BioSchema);
