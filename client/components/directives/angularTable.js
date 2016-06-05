(function  () {
  angular.module('mapApp').directive('angularTable',  
    ['$timeout', function ($timeout) {  
      function link(scope, elem, attrs)  {

       

        //for watching the changes in data
        scope.$watch('data', function (newValue, oldValue){          
          var visibileColumns = _.groupBy(scope.columns,'hide')
          scope.preferenceColumns = visibileColumns.false;         
          if(newValue && newValue.length > 0) {
            scope.refresh(newValue); //for setting page numbers and limits
            scope.createFootable(); 
            $timeout(function(){
              scope.defaultRowOpen();
              $('.footable').trigger('footable_redraw');
              transformTable();
            });           
          }
        });

        var transformTable = function() {

            //row height used for calculating the tbody height;tbody height = Min(rowHeight*numberOfRecords,windowHeight)
            var rowHeight;

            // reset display styles so column widths are correct when measured below
            angular.element(elem[0].querySelectorAll('thead, tbody, tfoot')).css('display', '');

          
           // wrap in $timeout to give table a chance to finish rendering
          $timeout(function () {
         
             // set widths of columns
            angular.forEach(elem[0].querySelectorAll('tr:first-child th'), function (thElem, i) {
              var tdElems = elem[0].querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
              var tfElems = elem[0].querySelector('tfoot tr:first-child td:nth-child(' + (i + 1) + ')');
        
              var columnWidth = tdElems ? tdElems.offsetWidth : thElem.offsetWidth;
              if (tdElems) {
                 tdElems.style.width = columnWidth + 'px';
              }
              if (thElem) {
                 thElem.style.width = columnWidth + 'px';
              }
              if (tfElems) {
                 tfElems.style.width = columnWidth + 'px';
              }
            });

             // set css styles on thead and tbody
            angular.element(elem[0].querySelectorAll('thead, tfoot')).css('display', 'block');

            var tr= angular.element(elem[0].querySelectorAll('tbody tr:first-child'));
            rowHeight = tr[0].offsetHeight;
            var reducableHeight = scope.tableOptions && scope.tableOptions.reduceTableHeight ? scope.tableOptions.reduceTableHeight : 0;
            var maxTableHeight = $(window).height() - scope.tableOptions.reduceTableHeight; 
            var hgtBasedonNumberofRecords = (rowHeight + 2) * scope.data.length; 
            var height = Math.min(maxTableHeight,hgtBasedonNumberofRecords);
            angular.element(elem[0].querySelectorAll('tbody')).css({
               'display': 'block',
               'height':  height || 'inherit',
               'overflow': 'auto'
            });
            
            // reduce width of last column by width of scrollbar
            var tbody = elem[0].querySelector('tbody');
            var scrollBarWidth = tbody.offsetWidth - tbody.clientWidth;
            if (scrollBarWidth > 0) {
              // for some reason trimming the width by 2px lines everything up better
              scrollBarWidth -= 2;
              var lastColumn = elem[0].querySelector('tbody tr:first-child td:last-child');
              lastColumn.style.width = (lastColumn.offsetWidth - scrollBarWidth) + 'px';
            }  
          });  
        }
      } 
      return {
        restrict : 'EA',
        priority: -1,
        scope: {
                data: '=',
                columns: '=',
                viewCheckbox: '=?',
                share: '&?',
                configureColumns: '&',
                rowClicked: '&',
                checkboxClicked: '&',
                tableColumnSettings: '=?',
                tableOptions: '=?',
                next: '&',
                prev: '&',
                paginate: '&',
                sort: '&',
                setFavouritePatient: '&',
                state: '=',
                patientId: '=',
                initialLimit: '&',
                paginateValue:'&',
                initialRowOpen: '&',
                rowOpen: '&',
                testNameToActivate: '&',
                linkFunctions: '&',
                rowSelected: '=?'
        },
        controller:['$scope','$timeout','$modal','myworkService','clinicalResultsService', 
          function($scope, $timeout,$modal,myworkService,clinicalResultsService) {
            $scope.showCheckbox = ($scope.viewCheckbox != null || $scope.viewCheckbox != undefined)? $scope.viewCheckbox : false;//showing the checkbox in UI
            $scope.paginationvalues = [15,25,50,100]; //default pagnation values 
            $scope.checkedRows = []; //maintains the checked rows id's
            $scope.checkedRowObjects = []; //maintains the checked row object's
            $scope.selectedDrillDownRow = [];//maintains the selected row status for viewing the drill down
            $scope.listOrderType= undefined;
            var queryParams = {};//queryParams object passed to the parent controller
            $scope.hideColumns=['phone','phone,tablet'] //hiding column's possiblities
            $scope.status = {'isopen': false};//dropdown 
            
            //default columns setting
            var tableColumnSettings =   [ 
                      {'name'   : 'phone',
                       'width'  : 830,
                       'columns': 3},

                        {'name' : 'medium',
                       'width'  : 1000,
                       'columns': 5},

                        {'name' : 'tablet',
                       'width'  : 2000,
                       'columns': 12}
              ]

            //Returns a BreakPoints JSON Object used for setting the widths in our footable and breakPoints 
            var breakPoints = {};
            var createBreakPoints = function() {
             $scope.tableColumnSettings.forEach(function(element, index){
               breakPoints[element['name']]=element['width'];
             });
            }
            

            //To set the limit and page NO and etc...
            $scope.refresh = function(data) { 
              $scope.selectedRow = $scope.rowSelected;  
              var limit = ((data.meta && data.meta.limit) || 1);
              $scope.page=Math.ceil((data && data.meta && data.meta.offset)/limit + 1);
              $scope.limit = limit;
              $scope.maxPage=Math.ceil((data && data.meta && data.meta.totalCount)/limit || 1);
              $scope.listOrderBy = data && data.meta && data.meta.extraInfo && data.meta.extraInfo.orderBy;
              $scope.listOrderType = data && data.meta && data.meta.extraInfo && data.meta.extraInfo.orderType
            }

            //incase of tablet and phone this function is called
            $scope.toggleRow = function(event) {            
              event.stopPropagation();
            //get the FooTable object from the table
              var footable = $(event.target).parents('table:first').data('footable');
              //get the row we clicked on
              var $row = $(event.target).parents('tr:first');
            //  footable.toggleDetail($row);
            }

            //row click event differents for drilldown views and normal function 
            /*Incase of drillDown views the ng-include in our table.html initate the corresponding 
            templates controller and view so we dont need to propagate our click functionality 
            to parent controller       */
          
           $scope.rowSelect = function(index,event) {  
              $scope.selectedRow = index;               
              if($scope.rowOpen != undefined){
                $scope.rowOpen({index:index})
              }    
              if(!$scope.tableOptions.drilldownview) {
                $scope.rowClicked({patient:$scope.data[index]});                               
              }
              else { 
                event.preventDefault();
                $scope.selectedDrillDownRow[index] = !$scope.selectedDrillDownRow[index]; 
              }

            }

            
            //marking him as favourite patient 
            $scope.markFavouritePatient = function(index) {              
              $scope.setFavouritePatient({index:index});
            }

            //sorting the table based on a column
            $scope.sortBy = function(column) {
              if($scope.tableOptions.isSortAvailable && (!column.calculate || column.sortBy)) 
              {
                if(column.sortBy) {
                  if(column.sortBy === $scope.listOrderBy) {
                    $scope.listOrderType  = $scope.listOrderType === 'desc' ? 'asc' : 'desc';
                  } else {
                      $scope.listOrderBy = column.sortBy;
                      $scope.listOrderType = 'desc'
                  }
                    queryParams['orderBy'] = $scope.listOrderBy;
                    queryParams['orderType'] = $scope.listOrderType;
                    $scope.sort({sortProperties:queryParams})                  
                }
                else {
                 if(column.name === $scope.listOrderBy) {
                   $scope.listOrderType  = $scope.listOrderType === 'desc' ? 'asc' : 'desc';
                 } else {
                     $scope.listOrderBy = column.name;
                     $scope.listOrderType = 'desc'
                 }
                   queryParams['orderBy'] = $scope.listOrderBy;
                   queryParams['orderType'] = $scope.listOrderType;
                   $scope.sort({sortProperties:queryParams})                   
                 }
              }
            }
             

            //paginate the result
            $scope.changePagination = function(item) {              
              $scope.paginate({count:item});
              if($scope.paginateValue !== undefined){                           
               $scope.paginateValue({counts:item});
             }
              
            }

            $scope.initialPagination = function(){
              if($scope.initialLimit !== undefined){               
               $scope.initialLimit();
              }
            }

            $scope.stopDefault = function(index,column){
              if($scope.linkFunctions !== undefined){
                $scope.linkFunctions({index:index,column:column});
               
              }
            }

            $scope.defaultRowOpen = function(){
              if($scope.initialRowOpen != undefined){
                $scope.selectedRow = $scope.initialRowOpen();                
                $scope.selectedDrillDownRow[$scope.selectedRow] = true;                
              }
            }

            //returns the hide property for the columns (setting data-hide in UI)
            $scope.checkForHide = function($index){
             var hideString = '';
             $scope.tableColumnSettings.forEach(function(element){
                if($scope.columns[$index].hide) {
                  hideString = 'all'+',';
                }
                else {
                    if($index > element['columns']) {
                      hideString = hideString + element['name'] +',';
                    }
                }
             });
             if(hideString.length>0) {
               return hideString.substring(0,hideString.length-1);
              }
             else 
               return null;
            }

            $scope.checkForIgnore = function($index) {
              if($scope.columns[$index].hide)
                return "true";
              else return "false";
            }

            //call's parent scope's next method
            $scope.nextPage = function() {             
              $scope.next();
            }
            
            //call's parent scope's prev method
            $scope.prevPage= function() {             
              $scope.prev();
            }

            //for selecting all the rows in the table
            $scope.toggleAll = function() {
              $scope.selectAll = ! $scope.selectAll;
              if($scope.selectAll == true) {
                for(var i=0;i<$scope.data.length;i++) {
                  $scope.checkedRows[i] = true;
                }
              }
              else {
                for(var i=0;i<$scope.data.length;i++) {
                  $scope.checkedRows[i] = false;
                } 
              }
              getSelectedRows();
            }

            //for selecting a row in the table
            $scope.checked = function(index) {
              event.stopPropagation();
              $scope.checkedRows[index] = !$scope.checkedRows[index];
              for(var i=0;i<$scope.data.length;i++) {
                  if($scope.checkedRows[i] != true) {
                    $scope.selectAll = false;
                    break;
                  }
                    $scope.selectAll = true;
                }

              if($scope.checkedRows[index] == false) {
                $scope.checkedRowObjects[index] = null;
              } 
              else {
                $scope.checkedRowObjects[index] = $scope.data[index];
              }
              getSelectedRows();
            }
        
            //returns array of checked Objects
            var getSelectedRows = function() {
              $scope.checkedRows.forEach(function(element, index){
                if(element == true) {
                  $scope.checkedRowObjects[index] = $scope.data[index]
                }
                else 
                  $scope.checkedRowObjects[index] = null
              });
              $scope.checkboxClicked({patient:$scope.checkedRowObjects});
            }
            
            //jQuery function() which creates the footable 
            $scope.createFootable = function(){
              $timeout(function(){
                $(function () {
                  $('.footable').footable(
                    {
                      breakpoints: breakPoints,
                      toggleSelector: '> tbody > tr > td.footable-visible.footable-last-column'
                      //toggleHTMLElement: '<i class="fa fa-plus" />'
                  });
                });
              })
            }


            var init = function() {

              if($scope.tableColumnSettings == null ||  $scope.tableColumnSettings == undefined) {
                $scope.tableColumnSettings = _.clone(tableColumnSettings);
              }
              createBreakPoints(); //used by footable.js                            
              if($scope.data != undefined) {
                $scope.refresh($scope.data);                 
              } 
                      
            }
            $scope.initialPagination();
            init();
             
          }],
        link: link,
        templateUrl: '/components/directives/table.html'
      }
    }]);
  })();



