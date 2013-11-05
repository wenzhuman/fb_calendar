
var layOutDay = function layOutDay(inpuTestEvents) {
	inputEvents = inpuTestEvents;
	//sort the events according to their start times
	inputEvents.sort(function(s,t){
		return s.start>=t.start;
	});
	var eventGroups = groupEvents(inputEvents);
	var userEvents = extractEventsFromGroups(eventGroups);
	drawEvents(userEvents);
}
/**
this function divide the input events in to different group.
each group doesn't overlap with each other
all the events that one event overlaps with are in the same group
for example if event A is in group One if B overlaps with A, B must
be in group One. If C overlaps with A, C also in group One.
B and C may or may not overlap.
@method groupEvents
@param [Object]  Object{start,end}
@return [Object] Object{start,end,memberEvents}
				 start:the earliest start time in the group
				 end: the latest end time of all the events in the group	
				 memberEvents is all the events that in the group,[Object] 
				 Object{eventStart,eventEnd,overLaps,column}
				 overLap:the maximum number of overlap events in one group
				 colum: which colum the event will be drawn.
**/
function groupEvents(inputEvents){
	var groups =[];
	for(var i = 0; i < inputEvents.length; i++){

		var groupEvent = {eventStart:inputEvents[i].start, eventEnd:inputEvents[i].end, overLaps:1, column:1};
		//the index of group that the event start time resides in
		var findStartGroup = -1;
		//the index of group of the event end time resides in
		var findEndGroup = -1;

		for(var j = 0; j < groups.length; j++){
			if(groupEvent.eventStart>=groups[j].start&&groupEvent.eventStart<=groups[j].end){
				findStartGroup = j;
			}

			if(groupEvent.eventEnd>=groups[j].start&&groupEvent.eventEnd<=groups[j].end){
				findEndGroup = j;
			}
		};
		//if there is no group for one event, create one group for it
		if(findStartGroup<0&&findEndGroup<0){
			var newGroup = {start:groupEvent.eventStart,end:groupEvent.eventEnd,memberEvents:[groupEvent]};
			groups.push(newGroup);
		}
		//if only the start of the event is inside one group, add the event,update the end of the group
		if(findStartGroup>=0&&findEndGroup<0){
			groups[findStartGroup].end = groupEvent.eventEnd;
			groups[findStartGroup].memberEvents.push(groupEvent);
		}
		//if only the end of the event is inside one group, add the event,update the start of the group
		if(findStartGroup<0&&findEndGroup>=0){
			groups[findStartGroup].start = groupEvent.eventStart;
			groups[findStartGroup].memberEvents.push(groupEvent);
		}
		
		if(findStartGroup>=0&&findEndGroup>=0){
			//if both the start and end of the event are in the same group,just add the event
			if(findStartGroup==findEndGroup){
				groups[findStartGroup].memberEvents.push(groupEvent);
			}
			
			else{
				//if both the start and end of the event are in different groups,add the event,and merge the groups in between
				for(i = findStartGroup+1;i<=findEndGroup;i++){
					groups[findStartGroup].memberEvents.concate(groups[findStartGroup].memberEvents);
					groups.splice(i,1);
				}
			}
		}

	}
	return groups;
}
/**
this function takes the groups of events and return all the events
with right overlaps and columns
if there is only one event in the group, draw it directly,
otherwise,calculate the overlaps and column for each event.
@param [Object]  Object{start,end,memberEvents}
@return [Object] Object{eventStart,eventEnd,overLaps,column}
**/
function extractEventsFromGroups(eventGroups){
	
	var userEvents = [];
	for (var i = 0; i < eventGroups.length; i++) {
		if(eventGroups[i].memberEvents.length == 1){
			userEvents = userEvents.concat(eventGroups[i].memberEvents);
		}
		else{
			eventsWithOverlap = addOverlapAndColum(eventGroups[i].memberEvents);
			console.log(eventsWithOverlap);
			userEvents = userEvents.concat(eventsWithOverlap);
		}
	}
	return userEvents;
}

function addOverlapAndColum(memberEvents){
	var events=[];
	var initalStart = 0;
	var currentMinStart = initalStart;
	var level = 0;
  
	while(memberEvents.length!=0){
   		level++;
   		currentMinStart = memberEvents[0].eventStart;
   		//each for loop extract all the event that doesn't overlap with each other
   		for (var i = 0 ;i<memberEvents.length;i++) {
   	    	if(memberEvents[i].eventStart>=currentMinStart){
   	    		memberEvents[i].column = level;
   	    		events.push(memberEvents[i]);
   	    		currentMinStart = memberEvents[i].eventEnd;
   	    		memberEvents.splice(i,1);
   	    		i--;
   	        }
   	    }
    }

	for(var j = 0;j<events.length;j++){
  		events[j].overLaps = level;
	}

	return events;
}
/**
 this function draw events one by one
**/
function drawEvents(events){
	var userEvents = document.getElementsByClassName("user_events")[0];
	/*the width of each event specified by the requirements*/
	var EVENTWIDTH = 600;
	for(var i = 0;i<events.length;i++){
		var addEvent = document.createElement("div");
		addEvent.className = "added_event";
		/*the top and bottom borders both take 1 pixel,according to css box
		model the content height need to minus 2*/
		addEvent.style.height = events[i].eventEnd - events[i].eventStart-2;
		/*the left border takes 4 pixels and right border take 1 pixel,according to css box
		model the content width need to minus 5*/
		addEvent.style.width = EVENTWIDTH/events[i].overLaps-5;
		addEvent.style.top = events[i].eventStart;
		addEvent.style.left = (events[i].column-1)*600/events[i].overLaps;
		var eventTitle = document.createElement("div");
		eventTitle.className = "event_title";
		eventTitle.textContent = " Sample Title ";
		var eventLocation = document.createElement("div");
		eventLocation.className = "event_location";
		eventLocation.textContent = " Sample Location  ";
		addEvent.appendChild(eventTitle);
		addEvent.appendChild(eventLocation);
		userEvents.appendChild(addEvent);
	}
}