paint_td();

$.ajax({
	type: "get",
    dataType: "json",
    url: "http://www.stuzone.com/zixunminda/lab_query/src/API/time_table_api.php?openid=oULq3uEYYQD22dqWtblHDBFzKEIw",
   	success:function(data){
   		$(document).ready(function(){
       
    
   		                   //获取当前周
        var current_week=data.data.current_week;
       
     		var settle=(function settle(display_week){
              //深度复制data
            var copy_data= jQuery.extend(true, {}, data);

               //将数据与相应单元格绑定
             bind_data(copy_data);

       			//过滤课程
             filter_data($('.hasCourse'),display_week);


            //跨格，填充课程，添加p标签，删除多余的td单元格
             paint($('.hasCourse'));

             //添加颜色
             add_color($('.hasCourse'),display_week);

             //显示冲突课程
             displayConflict($('.has_conflict'));

             //点击显示详情
             displayDetails($('.hasCourse'));

     			return settle;
     		})(current_week);

    /*     resert();
         settle(2);
*/
        });
     	

     
   }
})

function paint_td(){
   $('.header td').css('height',$(window).height()*0.06+"px");
   $('.table_wrap').css('height',$(window).height()*0.94+"px");
   $('.table_wrap th,.table_wrap td').css({'height':$(window).height()/12+"px"});
   $('.table_wrap td,.header td').css('width',$(window).width()*0.1333+"px");
   $("th:even").css('background-color','#ecf3f9');
   $("th:odd").css('background-color','#f4f8fb');
}

// 将数据与单元格绑定
function bind_data(data){
  	for(var i = 0;i < 7;i++){
      if(data.data.timetable[i] != null){
    		$.each(data.data.timetable[i],function(index,obj){
    			var start = obj.from_section - 1;
          obj.day_in_week = i + 1;  // 当堂课在第几天
    			bind($(".table_wrap td:nth-of-type("+(i+1)+")").eq(start),obj);

          // 给有课的单元格添加class作为标记
        	$(".table_wrap td:nth-of-type("+(i+1)+")").eq(start).addClass('hasCourse');

    		})
      }
  	}
}


function bind(td,obj){

	if((td.data('course') != undefined) && (td.data('course') != null)){
    var course = td.data('course');
    course.push(obj);
    td.data('course',course); 
  }else{
    var course = [];  
    course.push(obj);
     td.data('course',course);
  }
} 

//过滤课程
function filter_data(td,display_week){

  for(var i = 0,len = td.length;i < len;i++){
      var tdCourse=td.eq(i).data('course');
    
      //如果有多余的课，移除本周不在周数范围内的课
      if(tdCourse.length > 1){
        for(var j = 0;j < tdCourse.length;j++){
          if(tdCourse.length > 1
             && (tdCourse[j].from_week > display_week || tdCourse[j].to_week < display_week)
          ){
               tdCourse.splice(j,1);
               j--; 
          }
        }
      }

      //如果有单双周与冲突同时存在 移除本周不上的课
      if(tdCourse.length > 1){
        for(var k = 0;k < tdCourse.length;k++){
            if(tdCourse[k].from_week < display_week
                && tdCourse[k].to_week >display_week
                && tdCourse[k].special
                && tdCourse[k].special % 2 != display_week % 2){
                  tdCourse.splice(k,1);
                  k--; 
            }
        }
      }

     if(tdCourse.length > 1){
         td.eq(i).addClass('has_conflict');
     }

  } 
}


//跨格，填充课程，添加p标签，隐藏多余的td单元格
var paint= function(td){
    for(var i = 0,len = td.length;i < len;i++){
      var course = td.eq(i).data('course')[0];
      var rowspan = course.to_section - course.from_section + 1;
      td.eq(i).attr("rowspan",rowspan); //跨格
 
      var start = td.eq(i).index();
      var from_section = course.from_section;
      for(var j = 1;j <= rowspan - 1;j++){   // 隐藏跨格后多余的空格
          $(".table_wrap td:nth-of-type("+start+")").eq(from_section - 1 + j).hide();
      }
                                                 //填充课程信息
      td.eq(i).html("<p>" + course.name.replace(/\[\d{2}\]/," ") + course.place + "</p>");
                                                //固定p标签高度
      var height_p = $(window).height()/12*rowspan -8 + "px";
      td.eq(i).children('p').css('height',height_p);

    }

}

//添加颜色
var add_color=(function (){
    var colors=["#43dfd4","#bb91f3","#d8af7b","#aed46c","#ffa600","#ff8187","#cda4dd",
                  "#7ad3d1","#e3a984","#d5a997","#7ed58e","#80cfd3","#ad9bc3","#9d6e5e","#e3c471"],
    k=0,
    names=[],
    color_info=[];
    return function (td,display_week){
        for(var i=0,len=td.length;i<len;i++){
            var course=td.eq(i).data('course')[0];
            if(course.from_week>display_week
              ||course.to_week<display_week   //不上的课显示灰色
              ||(course.special&&course.special%2!=display_week%2)){
                td.eq(i).children('p').css({"background-color":"#f2f2f2",
                                            "color":"#929292"
                                          });
            }else{                           //上的课显示彩色
              if(names.indexOf(course.name)==-1){
                td.eq(i).children('p').css('background-color',colors[k]);
                names.push(course.name);
                color_info.push({name:course.name,color:colors[k]});
                k++;
              }else{
                for(var m=0;m<color_info.length;m++){
                    if(course.name==color_info[m].name){
                    td.eq(i).children('p').css("background-color",color_info[m].color);
                    }
                }
              }
            }
        }
    };

})();

// 重置所有课程信息
var resert = function (){
    $(".table_wrap td").empty()
      .data('course',null)
      .attr('rowspan',1)
      .removeClass("hasCourse has_conflict")
      .off('click')
      .show();
}

// 给冲突的课程添加点击事件
var displayConflict = function (conflict_tds,display_week){
    conflict_tds.on('click',function(){
      var courses = $(this).data('course');
      for(var i = 0;i < courses.length;i++){   
            
      }
   })
};
// 点击显示详情页
var displayDetails = function(td){
    td.on('click',function(){
      slide(-$(window).width(),'300ms'); //滑至右边详情页
      
    })
}
 var slide = function(distence,speed){  //定义页面滑动函数
    var distence = distence + "px";
      $(".container").css("transform","translateX("+distence+")");
      $(".container").css("transition",speed);
 }