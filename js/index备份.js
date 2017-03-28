// 固定格子宽高
  $('.header td').css('height',$(window).height()*0.06+"px");
  $('.table_wrap').css('height',$(window).height()*0.94+"px");
  $('.table_wrap th,.table_wrap td').css({'height':$(window).height()/12+"px"});
  $('.table_wrap td,.header td').css('width',$(window).width()*0.1333+"px");
  $("th:even").css('background-color','#ecf3f9');
  $("th:odd").css('background-color','#f4f8fb');

  $('.detail_header').css('line-height',$('.detail_header').height()+"px")

$.ajax({
	type: "get",
    dataType: "json",
    url: "http://www.stuzone.com/zixunminda/lab_query/src/API/time_table_api.php?openid=oULq3uEYYQD22dqWtblHDBFzKEIw",
   	success:function(data){
      var add={
        teacher:"/////",
        place:"qqqq",
        from_section:"5",
        to_section:"6",
        from_week:"1",
        to_week:"16",
        name:"英语英语英语英语英语英语英[14]"
      }
      var add={
        teacher:"/////",
        place:"qqqq",
        from_section:"5",
        to_section:"6",
        from_week:"1",
        to_week:"16",
        name:"英语英语英语英语英语英语英[14]"
      }
      data.data.timetable[0][2]=add;
      data.data.timetable[2][6]=add;
                    //获取当前周
        var current_week=data.data.current_week;
         $('.week_select').find("option[value="+current_week+"]").attr("selected",true);
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
             $('.has_conflict').on("click",displayConflict);

             //点击显示详情
             $('.hasCourse').not($('.has_conflict')).on("click",displayDetails);

     			return settle;
     		})(current_week)

      $('.week_select').change(function(){
        var val = parseInt($('.week_select option:selected').val());
        resert();
        settle(val);
      })
      
    }

})
     	

     



// 将数据与单元格绑定
function bind_data(data){
  	for(var i = 0;i < 7;i++){
      if(data.data.timetable[i] != null){
    		$.each(data.data.timetable[i],function(index,obj){
    
    			var start = obj.from_section - 1;
          obj.day_in_week = i + 1;  // 当堂课在第几天

          if(data.data.adj_info.length !== 0){
            bind_adj(obj,data.data.adj_info);
          }
          
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

  //给有调课的课程添加调课信息
var bind_adj = function(obj,adj_data){
    var adj = adj_data.filter(function(){
      if($(this).origin.teacher == obj.teacher
          && $(this).origin.from_section == obj.from_section
          && $(this).origin.day_in_week == obj.day_in_week
        )
       return true;
    });
    if(adj != null){
      obj.adj = adj_data;
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
function paint(td){
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
      td.eq(i).html("<p><span>" + course.name.replace(/\[\d{2}\]/," ") + course.place + "<span></p>");
                                             //固定p标签高度
     
    }


}

//添加颜色
var add_color = (function (){
    var colors = ["#70b8ad","#ebd55b","#ea9ba1","#da93b5","#88ace8","#5abbe5","#cda4dd",
      "#7ad3d1","#e3a984","#d5a997","#7ed58e","#80cfd3","#ad9bc3","#9d6e5e","#e3c471"];
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
function resert(){
    $(".table_wrap td").empty()
      .removeData("course")
      .attr('rowspan',1)
      .removeClass("hasCourse has_conflict has_adj")
      .off('click')
      .show();
}


// 冲突课程的点击回调函数
var displayConflict =  function(event){
    var elem = event.currentTarget;

      $('.shade').fadeIn(100);
      $('.conflict_panel').css({"background-color":elem.childNodes[0].style.backgroundColor})
                          .fadeIn(100);

      var courses = $(this).data('course');
      for(var i = 0;i < courses.length; i++){
        var info = courses[i].name.replace(/\[\d{2}\]/," ") +"<br/>"+ courses[i].place,
            li = $("<li class=" + "conflict_Course>" + info + "</li>"),
            ary = [courses[i]];

        li.data('course',ary);
        $('.conflict_panel ol').append(li);
      }
     
      $('.conflict_panel li').on('click',displayDetails);
  }

  


$('.shade').on('click',function(){  // 点击遮罩层，隐藏冲突面板,清空课程信息
  $('.conflict_panel ol').empty()
  $('.shade,.conflict_panel').css('display','none');
  slide($('.no_arrange'),"Y",0,'150ms');
})

// 点击显示详情页
var displayDetails = function(event){
   slide($('.container'),"X",-$(window).width(),'200ms'); //滑至右边详情页
   var info=$(this).data('course')[0];
   
   $('.class_name').html(info.name.replace(/\[\d{2}\]/," "))
   $('.classroom .class_info').html(info.place);
   $('.week .class_info').html(info.from_week+"-"+info.to_week+"周");
   $('.section .class_info').html("周"+info.day_in_week+info.from_section+"-"+info.to_section+"节");
   $('.teacher .class_info').html(info.teacher);
}



$(".return_btn").on('click',function(){  //点击返回
  slide($('.container'),"X",0,'200ms');
})

$('#chang_week').on('click',function(event){
    slide($('.week_panel'),"Y",$('.week_panel').height(),'300ms');
})


$('#no_arrange').on('click',function(event){
  $('.shade').fadeIn(100);
    slide($('.no_arrange'),"Y",-$('.no_arrange').height(),'200ms');
})


$('.button').on('click',function(){
   $('.button_group span').fadeToggle(50);
})
 


 // 定义页面元素滑动函数
 var slide = function(elem,dir,distence,speed){ 
    var distence = distence + "px";
      elem.css("transform","translate"+dir+"("+distence+")");
      elem.css("transition",speed);
 }


 
 