var base_url = $('#server_url').val();
$(document).ready(function() {
	$('#get_all').click(get_all);
	$('#download_all').click(download_all);
	$('#reset_all').click(reset_all);

});
function download_all(){
	var post_object = new Object();
	post_object.dummy = 'dummy';
	make_ajax_request(post_object,"download_data",provide_download_link);
	return;
}
function provide_download_link(result){
	var parsed_result = JSON.parse(result);
	var download_link = parsed_result.filelink
	// alert("<a href=\"" + download_link + "\">" + download_link + "</a>");
	alert(download_link);
	return;
}
function reset_confirm_callback(result){
	// alert(result);
	// return;
	if (result == null){
		return;
	}
	var password_given = result;
	
	var post_object = new Object();
	post_object.password = password_given;
	make_ajax_request(post_object,"reset_and_download_data",provide_download_link);


	return;
}
function reset_all(){
	bootbox.prompt("Are you sure to reset and download all data ? Enter Password to do so ", reset_confirm_callback); 
	return;
}
function get_all(){
	var post_object = new Object();
	post_object.top_count = 2000;
	make_ajax_request(post_object,"get_latest_opinion",update_list)
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
function get_opinion_html_text(opinion_list){
	var html = "<div class=\"list-group\"> ";
	for (i in opinion_list){
		var opinion_object = opinion_list[i];
		var heading_text = "STUDENT ID:  " + opinion_object.student_id + "   TIME : " + opinion_object.record_time + "   Opinion Value = " + opinion_object.value;
		var opinion_text = "OPINION : " + opinion_object.text;
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