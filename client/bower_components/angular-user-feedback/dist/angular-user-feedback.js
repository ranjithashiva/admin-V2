/**************************************************************************
* AngularJS-ng-feedback, v1.0.2; MIT License;
* Author: Accolite
**************************************************************************/
(function(){

    'use strict';

    angular.module('angular-user-feedback', ['ui.bootstrap'])
    .constant('feedbackConstants', {
      position: 'right-center',
      uiLabel: 'Provide Feedback',
      sendScreenshot: true,
      defaultPostFeedbackUrl: './api/feedbacks',
      defaultReadFeedbackUrl: './api/feedbacks',
      feedbackCategories: ['Suggest Enhancement', 
      'Report an Issue',
      'Liked this Application', 
      'Others/ General Feedback'
      ]
    })
    .provider(
      'feedbackConfig',['feedbackConstants', function(feedbackConstants) {
        this.config = {};

        this.initializeConfig = function() {
          this.config.postFeedbackUrl = feedbackConstants.defaultPostFeedbackUrl;
          this.config.readFeedbackUrl = feedbackConstants.defaultReadFeedbackUrl;
          this.config.feedbackCategories = feedbackConstants.feedbackCategories;
          this.config.sendScreenshot = feedbackConstants.sendScreenshot;
        }
        this.initializeConfig();
        this.setPostFeedbackUrl = function(url) {
          this.config.postFeedbackUrl = url;
        }
        this.setReadFeedbackUrl = function(url) {
          this.config.readFeedbackUrl = url;
        }
        this.getPostFeedbackUrl = function() {
          return this.config.postFeedbackUrl;
        }
        this.getReadFeedbackUrl = function() {
          return this.config.readFeedbackUrl;
        }

        this.setScreenShotFeature = function(status) {
          this.config.sendScreenshot = status;
        }
        this.canSendScreenShot = function() {
          return this.config.sendScreenshot;
        }
        this.setFeedbackCategories = function(categories) {
          this.config.feedbackCategories = categories;
        }
        this.setFeedbackCategoriesUrl = function(feedbackcategoriesurl) {
          this.config.feedbackCategoriesUrl = feedbackcategoriesurl;
        }
        this.getFeedbackCategoriesUrl = function() {
          return this.config.feedbackCategoriesUrl;
        }
        this.resetFeedbackCategories = function() {
          return this.config.feedbackCategories = feedbackConstants.feedbackCategories;
        }
        this.getFeedbackCategories = function(categories) {
          return this.config.feedbackCategories;
        }
        this.$get = function() {
          return( this );
        }
      }
    ])    
    .directive('feedback', ['$compile', function ($compile) {
      return  {
        restrict: 'EA',
        replace: false,
        scope: {
          uiLabel: '=uiLabel',
          position: '=position',
          username: '=username',
          email: '=email',
          phoneNumber: '=phoneNumber'
        },
        template: '<div ng-class="elementPosition" ng-click="popupFeedback()" class="feedback-link">' +
                  '{{displayText}}</div>',
        controller: ['$scope', '$element', '$attrs', '$modal', '$http', '$timeout', 'feedbackConstants', 'feedbackConfig', 'localStorageDetails', 'browserDetails', 'navigationTimings', 
        function ($scope, $element, $attrs, $modal, $http,  $timeout, feedbackConstants, feedbackConfig, localStorageDetails, browserDetails, navigationTimings) {
          if(!$attrs.position) {
            $scope.elementPosition = feedbackConstants.position;
          } else {
            $scope.elementPosition = $attrs.position;
          }
          if(!$attrs.uilabel) {
            $scope.displayText = feedbackConstants.uiLabel;
          } else {
            $scope.displayText = $attrs.uilabel;
          }
          console.log('$attrs', $attrs);
          console.log('$scope', $scope);
          $scope.popupFeedback = function() {
            $scope.payload = {
              data: {
                displayText: $scope.displayText,
                userName: $scope.username,
                email: $scope.email,
                phoneNumber: $scope.phoneNumber
              },
              config: {}
            };
            var modalInstance = $modal.open({
              template: '<!--Feedbackmodal--><div id = "feedback-modal" class = "modal-header">' + 
                'Provide Feedback </div>' + 
                '<div class = "feedback-panel modal-body">' + 
                  '<form name="feedbackForm">' + 
                    '<div class = "row padding-bottom-10">' +
                      '<div class = "col-xs-6">' +
                        '<div class="input-group">'+
                          '<span class="input-group-addon">Category</span>'+
                          '<select class="form-control" required ng-model="data.category" ng-options="category for category in categories"><option></option></select>' + 
                        '</div>'+
                      '</div>' +
                    '</div>' + 
                    '<div class = "row padding-bottom-10">' +
                      '<div class = "col-xs-6">' +
                        '<div class="input-group">'+
                          '<span class="input-group-addon">Email</span>'+
                          '<input type="email" class="form-control" ng-model="data.email" required placeholder="example@example.com"/><br />' + 
                        '</div>'+
                      '</div>' +
                    '</div>' + 
                    '<div class = "row padding-bottom-10">' +
                      '<div class = "col-xs-6">' +
                        '<div class="input-group">'+
                          '<span class="input-group-addon">Name</span>'+
                          '<input type="text" class="form-control" ng-model="data.userName"/><br />' + 
                        '</div>'+
                      '</div>' +

                      '<div class = "col-xs-6">' +
                        '<div class="input-group">'+
                          '<span class="input-group-addon">Phone Number</span>'+
                          '<input type="text" class="form-control" ng-model="data.phoneNumber"/><br />' + 
                        '</div>'+
                      '</div>' +
                    '</div>' +                     
                    '<div class = "row padding-bottom-10">' +
                      '<div class = "col-xs-12">' +
                        '<div class="input-group">'+
                          '<span class="input-group-addon">Comments</span>'+
                          '<textarea required type="text" class="form-control" ng-model="data.comment" / rows=3></textarea><br/>' + 
                        '</div>'+
                      '</div>'+
                    '</div>' + 
                    '<div class = "row padding-bottom-10">' +
                      '<div ng-if = "canSendScreenShot" class="col-xs-8">' +
                        '<div class="checkbox">' + 
                          '<label>' + 
                            '<input type="checkbox" ng-model="showscreenshot"  ng-click="info(true)">' + 
                              'Click to automatically attach a screenshot of this page' + 
                          '</label>' + 
                        '</div>' + 
                        '<div id="screenshot"  style="cursor:pointer;" ng-hide="!showscreenshot">' + 
                                '<div><a  data-toggle="modal"  data-target="#imageModal"  >' + 
                                 '<img src="{{data.imageData}}" alt="loading..." height="100" width="450" /> </a></div>' + 
                        '</div>' +
                      '</div>' + 
                    '</div>' + 
                    '<div class = "row padding-bottom-10">' +
                      '<div class="form-group col-xs-8"">' + 
                        '<label for="ratelabel">Rate Us:</label>   ' + 
                        '<rating ng-model="rate" max="max" on-hover="hoveringOver(value)" on-leave="overStar = null" state-on="\'glyphicon-ok-sign\'" state-off="\'glyphicon-ok-circle\'" ></rating>' + 
                        '<span class="label" ng-class="{\'label-warning\': rate<3, \'label-info\': rate>=3 && rate<7, \'label-success\': rate>=7}" >{{rate}}/{{max}}</span>' + 
                      '</div>' + 
                    '</div>' + 
                    '<div class = "feedback-buttons row padding-bottom-10">' +
                      '<button ng-click="cancel()" class="btn btn-sm btn-danger pull-right">Cancel</button>' + 
                      '<button type="submit" ng-click="ok()" ng-disabled=" feedbackForm.$invalid " class="btn btn-sm btn-primary pull-right">Submit</button>' + 
                    '</div>' + 

                  '</form> ' + 

              '</div>' + 
              '<div class = "modal-footer"> </div><!--End Feedbackmodal-->'

              ,
              controller: 'FeedBackModalCtrl',
              size: 'lg',
              resolve: {
                payload: function() {
                  return $scope.payload;
                }
              }
            });

            modalInstance.result.then(function(data) {
              var feedbackObject = {
                feedbackDetails: data,
                browserDetails : browserDetails.getBrowserOSDetails(),
                localstorageDetails : localStorageDetails.getSizes(),
                browserTimingDetails : navigationTimings.getTimes()
              };
              var req = {
               method: 'POST',
               url: feedbackConfig.getPostFeedbackUrl(),
               headers: {
                 'Content-Type': 'application/json'
               },
               data: feedbackObject
              }

              $http(req)
              .success(function() {
                console.log('Success');
              })
              .error(function(){
                console.log('Failed')
              });
              console.log(feedbackObject);
              //TODO: checks what needs to be in there.
            }, function() {});            
          }
        }]
      };
    }])
    .controller('FeedBackModalCtrl',['$scope', '$modalInstance', 'payload', 'feedbackConfig', 'browserDetails', '$timeout', '$http', function($scope, $modalInstance, payload, feedbackConfig, browserDetails, $timeout, $http) {
      $scope.browserDetails = browserDetails;
      if(feedbackConfig.getFeedbackCategoriesUrl()) {
        var req = {
         method: 'GET',
         url: feedbackConfig.getFeedbackCategoriesUrl(),
         headers: {
           'Content-Type': 'application/json'
         }
        }
        $http(req)
        .success(function(data) {
          console.log('Success');
          feedbackConfig.setFeedbackCategories(data);
          $scope.categories = feedbackConfig.getFeedbackCategories();
        })
        .error(function(){
          console.log('Failed')
        });
      } else {
        $scope.categories = feedbackConfig.getFeedbackCategories();
      }
      $scope.canSendScreenShot = feedbackConfig.canSendScreenShot();
      $scope.showscreenshot;
      $scope.max = 10;
      $scope.data = {};
      $scope.data.userName = payload.data.userName;
      $scope.data.email = payload.data.email;
      $scope.data.phoneNumber = payload.data.phoneNumber;
      $scope.rate = 1;

      $scope.displayText = payload.data.displayText;
      $scope.hoveringOver = function(value)  {
          $scope.overStar = value;
          $scope.rate = value;
      };  
      var updateImageField = function(data) {
        $scope.data.imageData= data;        
      }  

      $scope.info = function(newValue) {
        if(newValue && !$scope.data.imageData) {
          var newObject = jQuery.extend(true, {}, document.body);
          newObject = newObject.innerHtml.replace(new RegExp('<!--Feedbackmodal-->*<!--End Feedbackmodal-->'), "");
          //newObject.removeChild(oP);
          console.log(newObject);
          html2canvas(newObject.body, {
            onrendered: function(canvas) {
              var data =  canvas.toDataURL();
              $scope.data.imageData= data;
              $timeout(function(){
                $scope.$apply(function() {
                  updateImageField(data);
                });
              });
            }
          });
        }
      }

      $scope.ok = function() {
        $scope.data.rating = $scope.rate;
        $modalInstance.close($scope.data);
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }])
    .factory(
      'browserDetails',
      function( ) {
        var data = {};
        var unknown = '-';
        var BrowserAndOSDetails;
        try {
          // screen
          var screenSize = '';
          if (screen.width) {
              var width = (screen.width) ? screen.width : '';
              var height = (screen.height) ? screen.height : '';
              screenSize += '' + width + " x " + height;
          }

          //browser
          var nVer = navigator.appVersion;
          var nAgt = navigator.userAgent;
          var browser = navigator.appName;
          var version = '' + parseFloat(navigator.appVersion);
          var majorVersion = parseInt(navigator.appVersion, 10);
          var nameOffset, verOffset, ix;

          // Opera
          if ((verOffset = nAgt.indexOf('Opera')) != -1) {
              browser = 'Opera';
              version = nAgt.substring(verOffset + 6);
              if ((verOffset = nAgt.indexOf('Version')) != -1) {
                  version = nAgt.substring(verOffset + 8);
              }
          } else if ((verOffset = nAgt.indexOf('OPR')) != -1) {
              browser = 'Opera';
              version = nAgt.substring(verOffset + 4);
              if ((verOffset = nAgt.indexOf('Version')) != -1) {
                  version = nAgt.substring(verOffset + 8);
              }
          }
          // MSIE
          else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
              browser = 'Microsoft Internet Explorer';
              version = nAgt.substring(verOffset + 5);
          }
          // Chrome
          else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
              browser = 'Chrome';
              version = nAgt.substring(verOffset + 7);
          }
          // Safari
          else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
              browser = 'Safari';
              version = nAgt.substring(verOffset + 7);
              if ((verOffset = nAgt.indexOf('Version')) != -1) {
                  version = nAgt.substring(verOffset + 8);
              }
          }
          // Firefox
          else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
              browser = 'Firefox';
              version = nAgt.substring(verOffset + 8);
          }
          // MSIE 11+
          else if (nAgt.indexOf('Trident/') != -1) {
              browser = 'Microsoft Internet Explorer';
              version = nAgt.substring(nAgt.indexOf('rv:') + 3);
          }
          // Other browsers
          else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
              browser = nAgt.substring(nameOffset, verOffset);
              version = nAgt.substring(verOffset + 1);
              if (browser.toLowerCase() == browser.toUpperCase()) {
                  browser = navigator.appName;
              }
          }
          // trim the version string
          if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
          if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
          if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

          majorVersion = parseInt('' + version, 10);
          if (isNaN(majorVersion)) {
              version = '' + parseFloat(navigator.appVersion);
              majorVersion = parseInt(navigator.appVersion, 10);
          }

          // mobile version
          var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

          // cookie
          var cookieEnabled = (navigator.cookieEnabled) ? true : false;

          if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
              document.cookie = 'testcookie';
              cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
          }

          // system
          var os = unknown;
          var clientStrings = [
              {s:'Windows 3.11', r:/Win16/},
              {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
              {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
              {s:'Windows 98', r:/(Windows 98|Win98)/},
              {s:'Windows CE', r:/Windows CE/},
              {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
              {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
              {s:'Windows Server 2003', r:/Windows NT 5.2/},
              {s:'Windows Vista', r:/Windows NT 6.0/},
              {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
              {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
              {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
              {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
              {s:'Windows ME', r:/Windows ME/},
              {s:'Android', r:/Android/},
              {s:'Open BSD', r:/OpenBSD/},
              {s:'Sun OS', r:/SunOS/},
              {s:'Linux', r:/(Linux|X11)/},
              {s:'iOS', r:/(iPhone|iPad|iPod)/},
              {s:'Mac OS X', r:/Mac OS X/},
              {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
              {s:'QNX', r:/QNX/},
              {s:'UNIX', r:/UNIX/},
              {s:'BeOS', r:/BeOS/},
              {s:'OS/2', r:/OS\/2/},
              {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
          ];
          for (var id in clientStrings) {
              var cs = clientStrings[id];
              if (cs.r.test(nAgt)) {
                  os = cs.s;
                  break;
              }
          }

          var osVersion = unknown;

          if (/Windows/.test(os)) {
              osVersion = /Windows (.*)/.exec(os)[1];
              os = 'Windows';
          }

          switch (os) {
              case 'Mac OS X':
                  osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                  break;

              case 'Android':
                  osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                  break;

              case 'iOS':
                  osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                  osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                  break;
          }

          // flash (you'll need to include swfobject)
          /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
          var flashVersion = 'no check';
          if (typeof swfobject != 'undefined') {
              var fv = swfobject.getFlashPlayerVersion();
              if (fv.major > 0) {
                  flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
              }
              else  {
                  flashVersion = unknown;
              }
          }

          BrowserAndOSDetails = {
              screen: screenSize,
              browser: browser,
              browserVersion: version,
              mobile: mobile,
              os: os,
              osVersion: osVersion,
              cookies: cookieEnabled,
              flashVersion: flashVersion
          };
        } catch (e) {
          //Implement Later
        }
        data.getBrowserOSDetails = function() {
          return BrowserAndOSDetails;
        } 
        return( data );
      }
    )
    .factory(
      'localStorageDetails',
      function( ) {
        var data  = {};
        var sizes;
        try {
          (function showLocalStorageSize() {
            function stringSizeBytes(str) {
              return str.length * 2;
            }

            function toMB(bytes) {
              return bytes / 1024 / 1024;
            }

            function toKB(bytes) {
              return bytes / 1024;
            }

            function toSize(key) {
              return {
                name: key,
                size: stringSizeBytes(localStorage[key])
              };
            }

            function toSizeMB(info) {
              var size = info.size;
              info.size = toKB(size).toFixed(2) + ' KB';
              info.sizeInMb = toMB(size).toFixed(2) + ' MB';
              return info;
            }

            sizes = Object.keys(localStorage).map(toSize).map(toSizeMB);
          }());
        } catch(e) {
          //Implement Later
        }
        data.getSizes = function () {
          return sizes;
        }
        return data;
      }
    )
    .factory(
      'navigationTimings',
      function( ) {
        var data = {};
        var timings;
        try{
          (function(window) {
              'use strict';

              /**
               * Navigation Timing API helpers
               * timing.getTimes();
               **/
              timings = timings || {
                  /**
                   * Outputs extended measurements using Navigation Timing API
                   * @param  Object opts Options (simple (bool) - opts out of full data view)
                   * @return Object      measurements
                   */
                  getTimes: function(opts) {
                      var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
                      var timing = performance.timing;
                      var api = {};
                      opts = opts || {};

                      if (timing) {
                          if (opts && !opts.simple) {
                              for (var k in timing) {
                                  if (timing.hasOwnProperty(k)) {
                                      api[k] = timing[k];
                                  }
                              }
                          }


                          // Time to first paint
                          if (api.firstPaint === undefined) {
                              // All times are relative times to the start time within the
                              // same objects
                              var firstPaint = 0;

                              // Chrome
                              if (window.chrome && window.chrome.loadTimes) {
                                  // Convert to ms
                                  firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
                                  api.firstPaintTime = firstPaint - (window.chrome.loadTimes().startLoadTime * 1000);
                              }
                              // IE
                              else if (typeof window.performance.timing.msFirstPaint === 'number') {
                                  firstPaint = window.performance.timing.msFirstPaint;
                                  api.firstPaintTime = firstPaint - window.performance.timing.navigationStart;
                              }
                              // Firefox
                              // This will use the first times after MozAfterPaint fires
                              //else if (window.performance.timing.navigationStart && typeof InstallTrigger !== 'undefined') {
                              //    api.firstPaint = window.performance.timing.navigationStart;
                              //    api.firstPaintTime = mozFirstPaintTime - window.performance.timing.navigationStart;
                              //}
                              if (opts && !opts.simple) {
                                  api.firstPaint = firstPaint;
                              }
                          }

                          // Total time from start to load
                          api.loadTime = timing.loadEventEnd - timing.navigationStart;
                          // Time spent constructing the DOM tree
                          api.domReadyTime = timing.domComplete - timing.domInteractive;
                          // Time consumed prepaing the new page
                          api.readyStart = timing.fetchStart - timing.navigationStart;
                          // Time spent during redirection
                          api.redirectTime = timing.redirectEnd - timing.redirectStart;
                          // AppCache
                          api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
                          // Time spent unloading documents
                          api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
                          // DNS query time
                          api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
                          // TCP connection time
                          api.connectTime = timing.connectEnd - timing.connectStart;
                          // Time spent during the request
                          api.requestTime = timing.responseEnd - timing.requestStart;
                          // Request to completion of the DOM loading
                          api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
                          // Load event time
                          api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;
                      }

                      return api;
                  },
              };

              // By default, print the simple table
              return timings.getTimes();

          })(window);
        } catch(e) {
          //Implement Later
        }

        data.getTimes = function () {
          return timings && timings.getTimes();
        }
        return data;
      }
    );
})();



