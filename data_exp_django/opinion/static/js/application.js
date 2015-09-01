var base_url = $('#server_url').val();


$(document).ready(function() {
	$('#save_roll').click(save_roll_number);
	$('#submit_opinion').click(submit_opinion);
	$('#get_latest_opinion').click(get_latest_opinion_list);

	init_values();
	// load_graph();
	get_slided_values([1,-2,3]);
});
function init_values(){
	roll_number = getCookie("roll_number");
	if (roll_number != ""){
		$('#roll_number').val(roll_number);
		// load_graph(roll_number);
		// update_list();
	}
}
function load_graph(roll_number){
	post_object = new Object();
	post_object.student_id = roll_number;
	make_ajax_request(post_object,"get_neighbors_with_influence_values",draw_neighbor_graph);
	return;
}
function save_roll_number(){
	// alert("save roll clicked ");
	var roll_number = $('#roll_number').val();
	if (roll_number == ""){
		alert("Enter valid roll number !");
		return;
	}
	document.cookie="roll_number=" + roll_number ;
	var x = document.cookie;
	// alert(x);
	load_graph(roll_number);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}


function dummy_success(result){
	// alert('result = ' + result);
}

function make_ajax_request(object_to_pass,url_func,success_function){
	var submit_url = base_url + url_func;
	// alert("JSON DATA = " + jsonDataStr + " " + submit_url);
	$.ajax({
		type : "POST",
		url : submit_url,
		data :object_to_pass,
		success : function(result){
			success_function(result);
		},
		error : function() {
			alert("Unable to submit opinion");
		}
	});
}


function submit_opinion(){
	var text = $('#opinion_text').val();
	var value = $('#example').val();
	var student_id = $('#roll_number').val();
	if (student_id == ""){
		student_id = getCookie('roll_number');
	}
	if (student_id == ""){
		alert("Roll Number not entered cant submit data !");
		return;
	}
	
	var opinion = new Object();
	opinion.text = text;
	opinion.value = value;
	opinion.student_id = student_id;

	make_ajax_request(opinion,"add_opinion",dummy_success);
}


function get_slided_values(influence_values){
	var min = Math.min.apply(null, influence_values);
	if (min >= 0){
		return influence_values;
	}
	increment = (-1.0) * (min * 110.0 )/ 100.0 + 10.0
	slided_values = new Array(influence_values.length)
	for (i in influence_values){
		slided_values[i] = influence_values[i] + increment;
	}
	// alert(slided_values);
	return slided_values;
}
function get_key_value_list(dict){
	var key_list = new Array();
	var value_list = new Array();
	for (var key in dict) {
		  if (dict.hasOwnProperty(key)) {
	    	key_list.push(key);
	    	value_list.push(dict[key]);
	  	}
	}
	return [key_list,value_list];
}

function get_chart_html(label_list,value_list,plot_value_list){
	html_text = "<ul class=\"chart\"><li class=\"title\" title=\"Student Graphs\"></li>"
	for (i in label_list){
		line = "<li class=\"current\" title=\""+ label_list[i] +"\"><span class=\"bar\" data-number=\""+ plot_value_list[i] + "\"></span><span class=\"number\">" + Math.round(value_list[i] * 1000) / 1000 + "</span></li>";
		html_text += line;
	}
	html_text += "</ul>"
	return html_text;
}
function save_neighbor_list(neighbor_list_text){
	document.cookie = "neighbor_list=" + neighbor_list_text ;
}

function save_influence_values(influence_list,influence_value_list){
	roll_number = $('#roll_number').val();
	for (i in influence_list){
		key = roll_number + "-" + influence_list[i];
		document.cookie = key + "=" + influence_value_list[i];
	}
	return;
}

function draw_neighbor_graph(result){
	// alert("result == " + result);
	var parsed_result = JSON.parse(result);
	var neighbor_list_text = parsed_result.neighbor_list;
	save_neighbor_list(neighbor_list_text);
	var neighbor_list = JSON.parse(neighbor_list_text);
	var key_value_list = get_key_value_list(neighbor_list);
	var key_list = key_value_list[0]; // this is the list of neighbors
	var value_list = key_value_list[1]; // this is their influence values
	save_influence_values(key_list,value_list);
	var positive_value_list = get_slided_values(value_list);
	// alert("keys = " + key_list + " : values = " + value_list + " positive = " + positive_value_list);
	var chart_html = get_chart_html(key_list,value_list,positive_value_list);
	$("#neighbor_graph").html(chart_html);
	$("body").append('<script type="text/javascript" src="' + "/static/build/js/jquery.horizBarChart.min.js" + '"></script>')
	$('.chart').horizBarChart({
		  selector: '.bar',
		  speed: 3000
		});
	return;
}


function get_opinion_html_text(opinion_list){
	var html = "<div class=\"list-group\"> ";
	for (i in opinion_list){
		var opinion_object = opinion_list[i];
		var influence_key = $('#roll_number').val() + '-' + opinion_object.student_id;
		var influence_value = getCookie(influence_key);
		if (influence_value == ""){
			influence_value = 0.0;
		}
		influence_value = Math.round(influence_value * 1000) / 1000; 
		// alert(influence_key + " " + influence_value);
		var heading_text = "STUDENT ID: <strong> " + opinion_object.student_id + "</strong> Influence : <strong>" + influence_value + "</strong>  TIME : <strong>" + opinion_object.record_time + "</strong>   Opinion Value = <strong>" + opinion_object.value + "</strong>";
		var opinion_text = "OPINION : <strong>" + opinion_object.text + "</strong>";
				// a_html = "";
		var a_html = "<a href=\"#\" class=\"list-group-item\"\><h4 class=\"list-group-item-heading\">" + heading_text + "</h4>" + 
			"<p class=\"list-group-item-text\">" + opinion_text + "</p></a>"
		html += a_html;
	}
	html += "</div>";
	return html;
}

function extract_top_opinions(opinion_list){
	opinion_list_parsed = new Array();
	for (i in opinion_list){
		opinion_object = JSON.parse(opinion_list[i]);
		opinion_list_parsed.push(opinion_object);
	}
	return opinion_list_parsed;
}

function update_list(result){
	var parsed_json = JSON.parse(result);
	var opinion_list_json = parsed_json.top_opinion_list;
	var opinion_list_html = '';
	// alert(result);
	if (opinion_list_json == ''){
		opinion_list_html = '';
	}else{
		var opinion_list = JSON.parse(opinion_list_json)
		var opinion_list_parsed = extract_top_opinions(opinion_list);
		opinion_list_html = get_opinion_html_text(opinion_list_parsed);
	}
	$("#well2").html(opinion_list_html);
}

function get_latest_opinion_list(){
	// var neighbor_list_text = getCookie("neighbor_list");
	neighbor_list_text = "";
	if (neighbor_list_text == ""){
		// neighbor list not found in client
		var student_id = $('#roll_number').val();;
		if (student_id == ""){
			student_id == getCookie('roll_number');
		}
		if (student_id == ""){
			return;
		}
		var post_object = new Object();
		post_object.student_id = student_id;
		post_object.top_count = "6000";
		// alert("here = " + post_object);
		make_ajax_request(post_object,"get_top_opinion_list",update_list);
	}else{
		// neighbor list found
		var neighbor_list = JSON.parse(neighbor_list_text);
		var key_value_list = get_key_value_list(neighbor_list);
		var key_list = key_value_list[0];
		
		var post_object = new Object();
		post_object.student_id_list = key_list.join(";")	
		post_object.top_count = "4";
		// alert(post_object)
		make_ajax_request(post_object,"get_top_opinion_list",update_list);
		// alert("neighbor_list = " + key_list);
	}
	return;
}