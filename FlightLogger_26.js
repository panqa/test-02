var skipTab=false;
$(document).ready(function(){
    //ugly hacks for ie8/xp
    Date.now = Date.now || function() { return +new Date; };
    // $.get('/admin/version',function(data){
     //   $('#version').html('v'+data);
    //});

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
             if ( this === undefined || this === null ) {
                throw new TypeError( '"this" is null or not defined' );
              }

              var length = this.length >>> 0; // Hack to convert object.length to a UInt32

              fromIndex = +start || 0;

              if (Math.abs(fromIndex) === Infinity) {
                fromIndex = 0;
              }

              if (fromIndex < 0) {
                fromIndex += length;
                if (fromIndex < 0) {
                  fromIndex = 0;
                }
              }

              for (;fromIndex < length; fromIndex++) {
                if (this[fromIndex] === obj) {
                  return fromIndex;
                }
              }

              return -1;
        };
    }
    skipTab=false;
    //set up sentry integration
    Raven.config('https://2815aa3f8b2f4b1cb4ab16c24c131958@sentry.io/82625').install();
    
    $('div.header').click(animateBird);
    
    //Handle all links in javascript so iPad's don't try to open a web browser page
    $(document).on('click','a:not(.ui-corner-all):not(.paginate_button)',function(){
        var a_href=$(this).prop('href');
        window.location=a_href;
        return false;
    });

    //attach special formatting to all date fields
    $(".futuredate").attr('maxlength','8');
    $(".date").attr('maxlength','8'); //limit the total length of all date fields

    $(document).on('keypress','.date, .futuredate',function(event){
        formatDate(this,event);
    });
    
    //check for good date on futureDate fields
    $(document).on('change','.futuredate',function(){
        if($(this).val()!='') //if empty, then not a date, obviously. Let it pass.
            forceGoodDate($(this),true)
    });

    //format uppercase fields
    $(document).on('change',".uppercase",function(){
        formatUppercase(this);
    });

    //format number fields
    $(document).on('keypress',".numsonly", function(event){
        numbersOnly(event);
    });

    $(document).on('keypress',".strictnumsonly",function(event){
        //same as numsonly, except only allow digits (no negative, decimal, or slash)
        numbersOnly(event,/[^0-9]/);
    });

    //make toggle switches toggle
    $('.toggleSwitch').iphoneStyle({resizeContainer: false,
        resizeHandle: false,
        onChange:function(elem,val){
            if(typeof(onSliderChange) == "function")
            {
                onSliderChange(elem,val);
            }
        }
    });
});

function checkLocation(field)
{
    if($(field).val()!="")
    {
        $.getJSON('/lookupLocation',{loc:$(field).val()},function(json){
                if (!json.valid)
                {
                    alert("Invalid location\n\nPlease enter a valid location code.");
                    $(field).val('');
                    $(field).focus();
                }
                else
                {
                    $(field).val(json.abrev);

                    //updateOrigin may not be defined, depending on where this is called from
                    if($(field).attr('name')=="legto" && typeof updateOrigin == 'function') {
                        updateOrigin(field)
                    }
                }
            })
    }
}

function strToTime(str)
{
    if(typeof(str)=='undefined' || str==null){
        return NaN;
    }
    
    var timeParts=str.split(":");
    if (timeParts.length!=2)
        return NaN; //not properly formatted as HH:MM

    var timeMins=parseInt(timeParts[1],10);
    var timeHours=parseInt(timeParts[0],10);

     if ( isNaN(timeMins) || isNaN(timeHours) )
        return NaN; //not parseable. Invalid characters?

    var time=new Date();
    time.setHours(timeHours);
    time.setMinutes(timeMins);

    return time;
}

function filter(selector, query)
{
    query=$.trim(query);
    query=query.replace(/ /gi,')(?=.*');
    query="(?=.*"+query+")"

    $(selector).each(function(){
        var row=$(this);
        var valueFound=row.text().search(new RegExp(query,'i'))<0
        if(valueFound)
            row.hide();
        else
            row.show();
    });
}

function moveOnMax(field,maxLen,event,verifier){
    if(skipTab){
        skipTab=false;
        return;
    }
  var autoTab=$.cookie("autoTabEnabled");
  if(autoTab==="false")
    return;
  var fieldValue=$(field).val();
  var fieldLen=fieldValue.length;

  //account for some formatting characters
  var colonArray = fieldValue.match(/:/g); //really should be either 1 or zero, but don't assume
  var numColons=colonArray?colonArray.length:0;
  fieldLen-=numColons;

  if(fieldLen >= maxLen){
    if(typeof event.which == "number" && event.which > 46)
    {
        var nextCell=$(field).closest('td').next();
        var nextField=nextCell.children('input:visible:first');
        //don't jump to read only fields
        while (nextField.length===0 || nextField.attr("readonly"))
        {
            nextCell=nextCell.next();
            if(nextCell.length===0)
                break; //no next field to tab to, based on this criteria.
            nextField=nextCell.children('input:visible:first');
        }

        //if a verifier has been given, run that and only auto-tab if it returns true
        var gotoNext=true;
        if(verifier)
            gotoNext=verifier(field);
        if(gotoNext)
        {
            nextCell.children('input:visible:first').focus().select();
            //always call the onchange function when auto-tabbing from a field
            //$(field).change();
        }

    }
  }
}

function numbersOnly(event,filter){
    if(typeof filter == 'undefined')
        filter=/[^0-9\/\-\.]/;

    var object=$(event.target);
    var keyPressed=(event.keyCode||event.which);
    var valid_key=true;
    if(typeof event.which == "number" && event.which < 32) //delete, tab, etc
        return true;

    var keyChar=String.fromCharCode(keyPressed);
    var curValue=object.val();

    //make sure the key pressed is valid for a number - that is, a digit from 0-9, a negative sign, or a decimal
    //we also allow / so we can use this same filter as a basis for a date filter.
    if (keyChar.match(filter)) {
       valid_key=false;
    }
    //if we got this far, then the character itself is nominally valid. Now let's make sure
    //the usage is valid. For this, we need the current value of the input.
    else if (curValue!=null) //if we can't get the value, just stop here to prevent errors. May lead to bad input, but we'll live
    {
        //First, negatives can only go at the beginning.
        if (keyChar=="-" && curValue.length!=0) //already have other characters. Can't type a -
        {
            valid_key=false;
        }
        //check for valid decimal usage
        else if(keyChar==".")
        {
            if(curValue.length==0 || curValue=='-') //can not be the first character, or right after a leading negative. Lead with a zero.
            {
                object.val(object.val()+"0");
            }
            else if(curValue.indexOf(".")!=-1) //can not have more than 1 decimal
                valid_key=false;
        }
    }

    if(!valid_key)
    {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
        return false;
    }
}

function formatDate(field,event){
    //Input Validation - only allow numbers and separators
    var keyMatch=numbersOnly(event);
    if(typeof keyMatch != 'undefined')
        return keyMatch;


    var keyChar=String.fromCharCode((event.keyCode||event.which));

    //formatting - add separators if needed
    //if they typed a separator do some special handling
    if(keyChar=="/")
    {
        //count the number of slashes already entered
        var count=field.value.match(/\//g);

        //Allow slashes to be typed, except for the following:
        //Two slashes in a row
        //More than two slashes total
        //slash as the first character
        if ( field.value.match(/\/$/) ||
             (count && count.length==2) ||
             field.value.length<1
           )
        {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false
        }
        else
            return true;
    }
    else if(keyChar=='.' || keyChar=='-') //we allowed these for numbers, but don't allow for dates
    {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
        return false
    }

    //check for situations where a slash should be automatically added
    var firstSlashPos=field.value.indexOf("/");
    var len=field.value.length;

    if(!field.value.match(/\/$/)) //don't add a slash if the field ends in one already
    {
        if( (len==2 && firstSlashPos==-1) || //third number typed, no separator - enter separator
            (len==4 && firstSlashPos==1) || //one digit month, two digit day
            (len==5 && firstSlashPos==2)
          )
            field.value=field.value+"/";
    }
}

//check for a valid date value. Return zero on good, positive for future, negative for FAR past, undefined for invalid
function verifyValidDate(value)
{
    var currentDate=new Date();
    var currentYear=currentDate.getFullYear();
    var currentYear=parseInt(currentYear.toString().substr(2,2),10);
    var cuttoffYear=currentYear+20; //if more than 20 years in the "future", assume last century.
    var currentCentury=parseInt(currentDate.getFullYear().toString().substr(0,2),10);
    var enteredYear=value.replace(/\d+\/\d+\/(\d+)$/,"$1");
    if(enteredYear==value) //replaced string equivalent to original value, no match.
        return; //invalid date, no year entered

    enteredYear=parseInt(enteredYear,10); //two or four digit year
    var date;

    if(enteredYear>1000){ //four digit year entered, just use as is
        date=new Date(value);
    }
    else if(enteredYear>=cuttoffYear){
        var century=currentCentury-1;
        var replaceStr="/"+century+"$1";
        date=new Date(value.replace(/\/(\d\d)$/,replaceStr));
    }
    else{
        var century=currentCentury;
        var replaceStr="/"+century+"$1";
        date=new Date(value.replace(/\/(\d\d)$/,replaceStr));
    }

    if(isNaN(date))
        return; //undefined. Invalid date.

    if(date>Date.now())
        return 1; //positive. Future date

    var pastDate=new Date();
    pastDate.setDate(pastDate.getDate()-365);
    if(date<pastDate ) //more than 1 year old
        return -1; //negative. "Far" past.

    return 0; //good date. Not future, not far past.
}

function forceGoodDate(field,allowFuture,warnPast)
{
    //set some default parameters
    if(typeof allowFuture=='undefined')
        var allowFuture=false;

    if(typeof warnPast=='undefined')
        var warnPast=true;


    var valid=verifyValidDate(field.val());
    if (typeof valid =='undefined')
    {
        alert("This does not appear to be a valid date. Please check your entry. Dates should be entered as mm/dd/yy");
        field.val("");
        field.focus();
        return false;
    }
    else if(valid!=0)
    {
        if(valid>0 && !allowFuture) //future date
        {
            alert("Time travel not allowed! Please enter a date that is not in the future.");
            field.val("");
            field.focus();
            return false;
        }

        if(valid<0) //far past date
        {
            var allow=true; //allow by default, unless they say not to. They may not even be asked
            if(warnPast)
                allow=confirm("This date appears to be rather far in the past. Are you sure you entered it correctly?");

            if(!allow)
            {
                field.val("");
                field.focus();
                return false;
            }
            else
                return true;
        }
        //future date, but future allowed
        return false;
    }
    else
        return true;
}

function caffinateLinks()
{
    return; //do nothing
    $('a').each(function()
            {
                if($(this).attr('href')!='#')
                {
                    var a_href=$(this).attr('href');
                    $(this).click(function(){window.location=a_href;return false;});
                    $(this).attr('href','#');
                }
            }
        );
}


function formatUppercase(field)
{
    field.value=field.value.toUpperCase();
}

function searchDropdown(searchStr,ddObj) {
    var index = ddObj.getElementsByTagName("option");
    for(var i = 0; i < index.length; i++)
    {
        if(index[i].firstChild.nodeValue.toLowerCase().substring(0,searchStr.length) == searchStr.toLowerCase())
        {
            index[i].selected = true;
            break;
        }
    }
}

function getISODateTime(d){
    // padding function
    var s = function(a,b){return(1e15+a+"").slice(-b)};

    // default date parameter
    if (typeof d === 'undefined'){
        d = new Date();
    };

    // return ISO datetime
    return d.getFullYear() + '-' +
        s(d.getMonth()+1,2) + '-' +
        s(d.getDate(),2) + 'T' +
        s(d.getHours(),2) + ':' +
        s(d.getMinutes(),2) + ':' +
        s(d.getSeconds(),2);
}

function verifyValidTime(value)
{
    if(typeof(value)==='undefined' || value===null)
        return true; //no value to evaluate, so don't throw an error. Blank is acceptable.

    var components=value.split(/:/);

    if (components.length!=2) //make sure format is HH:MM
        return false;

    var hours=parseInt(components[0],10);
    var minutes=parseInt(components[1],10); //safe since we verified length 2 above
    if (isNaN(hours))//make sure hours is a valid value
        return false;
    if (hours>23) //make sure hours is less than 24
        return false;

    if(isNaN(minutes)) //make sure minutes is a valid number
        return false;
    if(minutes>59) //make sure minutes is no more than 59
        return false;

    //if we get here, then the time is good
    return true;
}

function createClosure(func,args)
{
    switch(args.length)
    {
    case 1:
        return function(){func(args[0])};
    case 2:
        return function(){func(args[0],args[1])};
    default:
        return function(){func(args)};
    }
}

function ieScrubData(data)
{
    var expr = new RegExp('>[ \t\r\n\v\f]*<', 'g');
    return data.replace(expr,'><');
}

function currentDate()
{
    var current_date=new Date();
    var day=current_date.getDate();
    day=(day<10 ? ("0"+day):day);
    var month=current_date.getMonth()+1; //zero based, apparently
    month=(month<10 ? ("0"+month):month);
    var year=current_date.getFullYear();
    year=(year+"").slice(2);
    var date_string=month+"/"+day+"/"+year;
    return date_string;
}

function dateToString(date)
{
    var current_date=date;
    var day=current_date.getDate();
    day=(day<10 ? ("0"+day):day);
    var month=current_date.getMonth()+1; //zero based, apparently
    month=(month<10 ? ("0"+month):month);
    var year=current_date.getFullYear();
    year=(year+"").slice(2);
    var date_string=month+"/"+day+"/"+year;
    return date_string;
}

//Ok, this is just stupid fun :-)
function animateBird(){
    var rightEdge=$('.tailDiv').outerWidth(); //how far does it need to fly?
    var totalTime=rightEdge*2; //how long should it take to get there?
    var awayTime=.4*totalTime; //How much of the total time should be spent flying "away" from the viewer?
    var towardsTime=.6*totalTime; //How much of the total time should be spent flying towards the viewer?
    var imgWidth=$('#tailImg').width(); //Full-size width of the image
    var smallWidth=imgWidth*.65; //size of the image when completely "away" from the viewer

    $('#tailImg').animate({marginLeft:rightEdge+5},
                            {duration:totalTime,
                              queue:false,
                              easing: 'linear',
                              complete: function(){
                                        $('#tailImg').css('margin-left','-90px').animate({marginLeft:'10px'},500);
                                    }
                            });

    $('#tailImg').animate({width:smallWidth},
                        { duration:awayTime,
                          easing:'linear',
                          queue:false,
                          complete: function(){
                                $('#tailImg').animate({width:imgWidth},{duration:towardsTime,queue:false});
                            }
                        });
}

function showMessage(message,level){
	$('#fl_messageBox')
		.removeClass()
		.addClass("noPrint fl_messageBox "+level)
		.html(message)
		.slideDown(300);
		
	setTimeout(function(){
		$('#fl_messageBox').slideUp(300);
	},5000);
}