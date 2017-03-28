// 固定格子宽高

  $('.table_wrap th,.table_wrap td').css('height','0.85rem');
  $('.detail .wrap').css('height',$(window).height()-$('.detail_header').height()+"px")
  var weeks = [{
            label: '第1周',
            value: 1
        }, {
            label: '第2周',
            value: 2
        }, {
            label: '第3周',
            value: 3
        },{
            label: '第4周',

            value: 4
        }, {
            label: '第5周',
            value: 5
        },{
            label: '第6周',
            value: 6
        },{
            label: '第7周',
            value: 7
        },{
            label: '第8周',
            value: 8
        },{
            label: '第9周',
            value: 9
        },{
            label: '第10周',
            value: 10
        },{
            label: '第11周',
            value: 11
        },{
            label: '第12周',
            value: 12
        },{
            label: '第13周',
            value: 13
        },{
            label: '第14周',
            value: 14
        },{
            label: '第15周',
            value: 15
        },{
            label: '第16周',
            value: 16
        },{
            label: '第17周',
            value: 17
        },{
            label: '第18周',
            value: 18
        },{
            label: '第19周',
            value: 19
        },{
            label: '第20周',
            value: 20
        },{
            label: '第21周',
            value: 21
        }]
    

$.ajax({
	type: "get",
    dataType: "json",
    url: "http://www.stuzone.com/zixunminda/lab_query/src/API/time_table_api_test.php?openid=oULq3uHTyplVHA-DOYr8kFgg5Ndg",
   	success:function(data){
      no_arrange(data);
     /*    var add={
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
      data.data.timetable[2][6]=add;*/
                    //获取当前周
        var current_week=data.data.current_week;

        $('#showPicker span').html(current_week);  
        weeks[current_week-1].label= weeks[current_week-1].label+'(本周)';
      
     		var settle=(function settle(display_week){
              //深度复制data

            var copy_data= jQuery.extend(true, {}, data);

  
               //将数据与相应单元格绑定
             bind_data(copy_data);

       			//过滤课程
             filter_data($('.table_wrap .hasCourse'),display_week);


            //跨格，填充课程，添加p标签，删除多余的td单元格
             paint($('.table_wrap .hasCourse'),display_week);

             //添加颜色
             add_color($('.table_wrap .hasCourse'),display_week);

             //显示冲突课程
        /*     $('.has_conflict').off("click",displayConflict);*/
             $('.has_conflict').on("click",displayConflict);

          

             //点击显示详情
   /*           $('.hasCourse').not($('.has_conflict')).off("click",displayDetails);*/
             $('.hasCourse').not($('.has_conflict')).on("click",displayDetails);
                

     			return settle;
     		})(current_week)

        $('#showPicker').on('click', function () {
          weui.picker(weeks, {
            onChange: function (result){ 
               var val = parseInt(result);
               resert();
               settle(val);
               $('#showPicker span').html(result);
                $('.table_wrap th,.table_wrap td').css('height','0.85rem');
            },
            defaultValue:[current_week]
          });
        })

    
        $('.no_arrange').css('bottom',-$('.no_arrange').height()+'px');
        var table_height = $(window).height()-$('.header').height()-$('.button_group').height()+"px";
        $('.table_wrap').css('height',table_height);
    }

})

     
//添加未安排课程
function no_arrange(data){
  var courses = data.data.no_arrange;

    if(courses){
      for(var i = 0;i < courses.length;i++){
        var li = $("<li class='hasCourse no_arrange'><p><span class='name'></span><span class='teacher'></span></p></li>");
        li.children('p').children('.name').html(courses[i].name);
        li.children('p').children('.teacher').html(courses[i].teacher);
        li.data('course',[courses[i],])
        $('.no_arrange ul').append(li);
      }
    }else{
     $('.button_group li').eq(0).css('display','none')
      $('.button_group li').eq(1).css('width','100%')
    }
}


function getTime(course){

  if(typeof(course.special_time) == 'undefined'){
    var times=[{start:"8:00",end:"8:45"},{start:"8:55",end:"9:40"},
      {start:"10:00",end:"10:45"},{start:"10:55",end:"11:40"},{start:"14:10",end:"14:55"},
      {start:"15:05",end:"15:50"},{start:"16:00",end:"16:45"},{start:"16:55",end:"17:40"},
      {start:"18:40",end:"19:25"},{start:"19:30",end:"20:15"},{start:"20:20",end:"21:05"}],
       from=course.from_section-1,
       to=course.to_section-1;
    return {
            form_time:times[from].start,
            to_time:times[to].end
     }
   }else{
      console.log(course.special_time)
      return {
            form_time:course.special_time[0],
            to_time:course.special_time[1]
      }
   } 
}


// 将数据与单元格绑定
function bind_data(data){
  	for(var i = 0;i < 7;i++){
      if(data.data.timetable[i] != null){
    		$.each(data.data.timetable[i],function(index,obj){

          var time = getTime(obj);
           obj.from_time = time.form_time;
           obj.to_time = time.to_time;

    			var from = obj.from_section - 1;

          obj.day_in_week = i + 1;  // 当堂课在第几天

          if(data.data.adj_info.length !== 0){
            bind_adj(obj,data.data.adj_info);
          }
          
    			bind($(".table_wrap td:nth-of-type("+(i+1)+")").eq(from),obj);

          // 给有课的单元格添加class作为标记
        	$(".table_wrap td:nth-of-type("+(i+1)+")").eq(from).addClass('hasCourse');

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

    var adj = adj_data.filter(function(item){
      if(item.origin.teacher == obj.teacher
          && item.origin.from_section == obj.from_section
          && item.origin.day_in_week == obj.day_in_week
        )
       return true;
    });
   
    if(adj.length != 0){    
     obj.adj = adj[0];
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
                && tdCourse[k].special_week
                && tdCourse[k].special_week % 2 != display_week % 2){
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
function paint(td,display_week){
    for(var i = 0,len = td.length;i < len;i++){


      var course = td.eq(i).data('course')[0];
      var rowspan = course.to_section - course.from_section + 1;
      td.eq(i).attr("rowspan",rowspan); 
        
      var start = td.eq(i).index();
      var from_section = course.from_section;
      for(var j = 1;j <= rowspan - 1;j++){   // 隐藏跨格后多余的空格
          var hidden_td = $(".table_wrap td:nth-of-type("+start+")").eq(from_section - 1 + j);
             
          hidden_td.css('display','none');
          if(hidden_td.hasClass('hasCourse')){
             
            td.eq(i).data('course',td.eq(i).data('course').concat(hidden_td.data('course')));  
                    
          }
      }
      var courses = td.eq(i).data('course');
             //填充课程信息
      td.eq(i).html("<p><span>" + course.name.replace(/\[\d{2}\]/," ") + course.place + "<span></p>");
     
       if(courses.length>1){       //添加冲突标志
         td.eq(i).children('p').addClass('has_conflict');  
      }
      if(courses[0].adj   //添加调课标志
        &&(
          (course.adj.origin.from_week <= display_week
            &&course.adj.origin.to_week >= display_week)
          ||(course.adj.modified.from_week <= display_week
            &&course.adj.modified.to_week >= display_week)
          )

        ){
         td.eq(i).children('p').addClass('has_adj');
      }
      if(courses[0].special_week){   //添加单双周标志
         td.eq(i).children('p').addClass('special_week');
      }
                                                                                    //固定p标签高度                                       
    }
}

//添加颜色
var add_color = (function (){

    var color_info = {},
        course,
        k=0,
        colors = ["#70b8ad","#ebd55b","#ea9ba1","#da93b5","#88ace8","#5abbe5","#cda4dd","#7ad3d1",
                  "#e3a984","#d5a997","#9299be","#80cfd3","#ad9bc3","#9d6e5e","#e3c471"];

    return function (td,display_week){
        for(var i = 0,len = td.length;i < len;i++){

            course=td.eq(i).data('course')[0];

            if((!course.adj  //没有调课情况
                &&course.from_week <= display_week
                &&course.to_week >= display_week  
                &&(!course.special_week || course.special_week % 2 == display_week % 2)
                )
              ||(course.adj       //有调课的情况
                &&((course.adj.origin.from_week <= display_week
                    &&course.adj.origin.to_week >= display_week)
                   &&(course.adj.modified.from_week <= display_week
                    &&course.adj.modified.to_week >= display_week)
                  ||((course.adj.origin.from_week > display_week
                     ||course.adj.origin.to_week < display_week)
                    &&(course.from_week <= display_week
                     &&course.to_week >= display_week  
                     &&(!course.special_week || course.special_week % 2 == display_week % 2))
                    )
                  )
                )
              )
            {
                if(typeof(color_info[course.name]) != 'undefined'){      //上的课显示彩色

                  td.eq(i).children('p').css('background-color',color_info[course.name]);
                } else {
                
                  td.eq(i).children('p').css('background-color',colors[k]);
                  color_info[course.name] = colors[k++];
                }
               
            } else {                         
                td.eq(i).children('p').addClass('bushang');  //不上的课显示灰色
              }
        }      
    };

})();

// 重置所有课程信息
function resert(){
    $(".table_wrap td")
      .empty()
      .removeData("course")
      .attr('rowspan',1)
      .removeClass()
      .off('click')
      .show();
}


// 冲突课程的点击回调函数
var displayConflict =  function(event){
    var courses = $(this).data('course');
/*
    if(courses.length<2){
     return
    }*/
    var elem = event.currentTarget;
      $('.shade').fadeIn(100);
      $('.conflict_panel').fadeIn(100);

     
    /*  if( $('.conflict_panel ol li').length>=courses.length){
        return
      }*/
      for(var i = 0;i < courses.length; i++){
         var li = $("<li class='hasCourse'><p><span class='name'></span><span class='place'></span></p></li>");
         li.children('p').children('.name').html(courses[i].name);
         li.children('p').children('.place').html(courses[i].place);
         li.data('course',[courses[i],])
        $('.no_arrange ul').append(li);
        $('.conflict_panel ol').append(li);
      }
     
      $('.conflict_panel li').on('click',displayDetails);
  }

  


$('.shade').on('click',function(){  // 点击遮罩层，隐藏冲突面板,清空课程信息
  $('.conflict_panel ol').empty()
  $('.shade,.conflict_panel').css('display','none');
  slide($('.no_arrange'),"Y",0,'200ms');
})



// 点击显示详情页
var displayDetails = function(event){
   slide($('.container'),"X",- $(window).width(),'200ms'); //滑至右边详情页
   var info = $(this).data('course')[0];
  
   $('.class_name').html(info.name.replace(/\[\d{2}\]/," "))
   $('.classroom .class_info').html(info.place);
   $('.week .class_info').html(info.from_week ? info.from_week+"-"+info.to_week+"周" : "待定");
   $('.section .class_info').html("周"+info.day_in_week+"&nbsp;&nbsp;"+info.from_section+"-"+info.to_section+"节");
   $('.teacher .class_info').html(info.teacher);
   $('.time .class_info').html(info.from_time+"～"+info.to_time);

   if(typeof(info.adj)!='undefined'){
    $('.adj_info').css('display','block');
      var modified = info.adj.modified;
      $('.adj_info .place .adj_result').html(modified.place);
      $('.adj_info .section .adj_result').html("周"+modified.day_in_week+"&nbsp;&nbsp;"+modified.from_section+"-"+modified.to_section);     
      $('.adj_info .teacher .adj_result').html(modified.teacher);
      $('.adj_info .week .adj_result').html(modified.from_week+"-"+modified.to_week);
   }
   if($(this).hasClass('no_arrange')){
      $('.classroom .class_info').html("待定");
      $('.section .class_info').html("待定");     
      $('.time .class_info').html("待定");
   }
}



$(".return_btn").on('click',function(){  //点击返回
  slide($('.container'),"X",0,'200ms');
   $('.adj_info').css('display','none');
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
      elem.css("transform","translate" + dir + "(" + distence + ")");
      elem.css("transition",speed);
 }




 