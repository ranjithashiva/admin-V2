angular-user-feedback
===============



A client framework to let users post feedbacks for the application
## What all it captures
1. It captures the feedback of user.
2. It captures the machine details.
3. It captures the browser details.

## How to use

### Install

Install it via bower:

    $ bower install angular-user-feedback
    
An [angular.js](https://angularjs.org/), [bootstrap.js](http://getbootstrap.com), [angular-bootstrap.js](https://angular-ui.github.io/bootstrap/) and [html2canvas.js](http://html2canvas.hertzen.com/) would be installed as a dependency automatically. If it won't for some reason, install it manually:
    
    $ bower install angular
    $ bower install bootstrap
    $ bower install angular-bootstrap
    $ bower install html2canvas

Once installation is done include the following statement in index file :

    $   <script src="bower_components/angular-user-feedback/dist/angular-user-feedback.js"></script>
    $   <script src="bower_components/html2canvas/build/html2canvas.min.js"></script>
    $   <link rel="stylesheet" href="bower_components/angular-user-feedback/dist/angular-user-feedback.css" />

Also include the bower component in your app config like 
    
    $ angular.module('appName', [
      'angular-user-feedback',

Then include the following line in your html and you should start seeing a feedback link

    $ '<feedback uiLabel="Feedback", position = "right-center"></feedback>'


Possible options for postions:

    $  right-center
    $  left-center
    $  right-bottom
    $  left-bottom

##Latest Additions
We can capture the user name, email, phone number by passing these fields as attributes in the feedback tag. Please take a look at the sample feedback tag

    $ '<feedback uiLabel="Feedback", position = "right-center", username="app.user.username", username="app.user.email", phone-number="app.user.phoneNumber"></feedback>'


The API to send the feedback to the server can be overridden in your applicaiton's app.js, 
###Steps to configure feedbackConfigurations
1. Configure postFeedbackurl
    app.config(function(feedbackConfigProvider) {
        feedbackConfigProvider.setPostFeedbackUrl('/api/feedbacks');
    })
2. configure categories
    app.config(function(feedbackConfigProvider) {
        feedbackConfigProvider.setCategories(['category1, 'category2', 'category2']);
    })

