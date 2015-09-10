//var choice = 'None';
//var label_post = 'None';
var reason = 'None';
var category = ['Meeting', 'Lecture', 'Study', 'Empty'];
var expression = ['開會', '上課', '自習/休閒', '無活動'];
var initial = false;
const GENERAL = '#33FFFF';
const CHOSEN = '#91C7FF';


// get label_post from he left side

document.addEventListener("keyup", keyup, false);
function keyup(event){
	var value = document.getElementById('reason').value;
	if(value == "") value = 'None';
	reason = value;
}
function refreshchoice(){
	reason = 'None';
	document.getElementById('reason').value = "";
}


// main part

var timestamp;
var post_lock = false;

function replace(page){
	document.write(page);
	document.close();
}

function record(){
	console.log(reason);
	if(reason == 'None' || reason == ""){
		alert('請填寫答案');
		return;
	}
	var timediff = new Date().getTime() - timestamp;
	var pic = document.getElementById('pic');
	if(post_lock == false){
		post_lock = true;
		$.post("/record/"+pic.getAttribute('value')+"/"+timediff+"/"+reason, function(response){
			if(typeof(response) == 'string') replace(response);
			setpic(response.pic, response.idx, response.ttl, response.ques);
			post_lock = false;
		});
	} else {
		alert('Please answer to the new picture.');
	}
	refreshchoice();
}

function show(s, idx, ttl){
	return '('+idx+'/'+ttl+')  '+s.substring(0,4)+'/'+s.substring(4,6)+'/'+s.substring(6,8)+' '+s.substring(9,11)+':'+s.substring(11,13);
}

// waitforcomplete and aftercomplete used to be part of setpic, 
// the separation makes the code dirty but it is the only way I find to implement non-busy waiting

function aftercomplete(picObj, newpic, newidx, ttlidx){
	document.getElementById('time').innerHTML = show(newpic, newidx, ttlidx);
	timestamp = new Date().getTime();
	
	document.getElementById("reason").focus();
	if (!initial) {
		initial = true;
		document.getElementById("reason").addEventListener('keypress', function (e) {
			var key = e.which || e.keyCode;
			if (key === 13) { // 13 is enter
				record();
			}
		});
	}
}

function waitforcomplete(picObj, newpic, newidx, ttlidx){
	if(picObj.complete) 
		aftercomplete(picObj, newpic, newidx, ttlidx);
	else setTimeout( function(){
		waitforcomplete(picObj, newpic, newidx, ttlidx);
	}, 100);
}

function setpic(newpic, newidx, ttlidx){
	//question = "Which of the following word best describes the usage of this room? 1. Meeting 2. Lecture 3. Study 4. Empty 5. Others(Please describe in your words)";
	//document.getElementById('question').innerHTML = question;
	
	picObj = document.getElementById('pic');
	picObj.setAttribute("value", newpic);
	picObj.src = "http://disa.csie.ntu.edu.tw/~janetyc/data/"+newpic.substring(0,8)+"/image_"+newpic+".jpg";
	waitforcomplete(picObj, newpic, newidx, ttlidx);
}
