'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Review = mongoose.model('Review');

/**
 * Globals
 */
var user, review;

/**
 * Unit tests
 */
describe('Review Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() { 
      review = new Review({
        // Add model fields
        // ...
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      return review.save(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) { 
    Review.remove().exec();
    User.remove().exec();

    done();
  });
});
