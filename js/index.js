$.ajax({
	type: "get",
    dataType: "json",
    url: "http://www.stuzone.com/zixunminda/lab_query/src/API/time_table_api.php?openid=oULq3uHTyplVHA-DOYr8kFgg5Ndg",
   	success:function(data){
   		$(document).ready(function(){

   			
   		  
        var current_week=data.data.current_week;
       
     		var settle=(function settle(display_week){
            var copy_data= jQuery.extend(true, {}, data);
            bind_data(copy_data);
       			//过滤课程
             filter_data($('.hasCourse'),display_week);
            //跨格，填充课程，添加p标签，删除多余的td单元格
             paint($('.hasCourse'));

             //添加颜色
             add_color($('.hasCourse'),display_week);



     			return settle;
     		})(current_week);
     		resert();
   		settle(18);
   
     })
   }
})
 $("th,td").css("width",$(window).width()/7+"px")
// 将数据与单元格绑定
function bind_data(data){
	for(var i=0;i<7;i++){
		$.each(data.data.timetable[i],function(index,obj){
			var start=obj.from_section-1

			bind($(".table_wrap td:nth-of-type("+(i+1)+")").eq(start),obj);

      // 给有课的单元格添加class作为标记
    	$(".table_wrap td:nth-of-type("+(i+1)+")").eq(start).addClass('hasCourse');

		})
	}
}
function bind(td,obj){
	if(td.data('course')!=undefined||null){
    var now=td.data('course');
    now.push(obj);
    td.data('course',now);
  }else{
      var course=[];
      course.push(obj);
      td.data('course',course);
  }
}

//过滤课程
function filter_data(td,display_week){




  for(var i=0,len=td.length;i<len;i++){
    var tdCourse=td.eq(i).data('course');
 
    //如果有多余的课，移除本周不在周数范围内的课
    if(tdCourse.length>1){
      $.each(tdCourse,function(index,item){       
          if(item.from_week>display_week||item.to_week<display_week){
              tdCourse.splice(index,1);    
          }
          
      })
    }

    //如果有单双周与冲突同时存在 移除本周不上的课
    if(tdCourse.length>1){
      $.each(tdCourse,function(index,item){       
          if(item.from_week<display_week
            &&item.to_week>display_week
            &&item.special
            &&item.special%2!=display_week%2){
              tdCourse.splice(index,1);
          }
      })
    }


/*    //过滤时间太长且当周不上的课
    $.each(tdCourse,function(index,item){       
          if((item.from_week>current_week
            ||item.to_week<current_week)
            &&item.to_section-item.from_section+1>4){
              
            console.log(tdCourse.splice(index,1))
          }

      })
*/
  }
}

//跨格，填充课程，添加p标签，隐藏多余的td单元格
function paint(td){
    for(var i=0,len=td.length;i<len;i++){
      var course=td.eq(i).data('course')[0]
      var rowspan=course.to_section-course.from_section+1;
      td.eq(i).attr("rowspan",rowspan); //跨格

      var start=td.eq(i).index();
      var from_section=course.from_section;
    
       for(var j=1;j<=rowspan-1;j++){   // 隐藏跨格后多余的空格
        $(".table_wrap td:nth-of-type("+start+")").eq(from_section-1+j).hide();
      }
                                                 //填充课程信息
      td.eq(i).html("<p>"+course.name.replace(/\[\d{2}\]/," ")+course.place+course.from_week+"-"+course.to_week+"</p>");
    }

}

//添加颜色
var add_color=(function (){
  var colors=["#70b8ad","#ebd55b","#ea9ba1","#da93b5","#88ace8","#5abbe5","#cda4dd",
      "#7ad3d1","#e3a984","#d5a997","#7ed58e","#80cfd3","#ad9bc3","#9d6e5e","#e3c471"];

  return function (td,display_week){
      /*$.each(td,function(index,item){       
          if(item.data('course')[0].from_week>current_week
            ||item.data('course')[0].to_week<current_week
            ||(item.data('course')[0].special&&item.data('course')[0].special%2==display_week%2)){
              $("("+item+") p").css("background-color","red");
          }
          console.log(item.data())
      })*/

      for(var i=0,len=td.length;i<len;i++){
          var course=td.eq(i).data('course')[0];
          if(course.from_week>display_week
            ||course.to_week<display_week
            ||(course.special&&course.special%2!=display_week%2)){
              td.eq(i).children('p').css("background-color","#ccc");

          }
      }
  };

})();

//重置所有课程信息
function resert(){
    $(".table_wrap td").empty().data('course',null).attr('rowspan',1).show();
}