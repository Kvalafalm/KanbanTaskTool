var Columns = [];
var Kanbans;
let CFD, CTH, ControlChart;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;
var range2 
let taskTypes =[
  {id:"id1",name:"НМА",color:"#4caf50"},
  {id:"id2",name:"Тех.поддержка",color:"#ff8800"},
  {id:"id3",name:"Ошибки",color:"#e95757"},
  {id:"id4",name:"Проекты",color:"#f68fff"},
  {id:"id5",name:"Стандартные",color:"#cccc00"},
];

class FunctionTrend {

  constructor(data,name,color) {
    this.data   = data;
    this.sumX   = 0;
    this.sumY   = 0;
    this.sumX2  = 0;
    this.sumXY  = 0;
    this.deltaA = 0;
    this.deltaB = 0;
    this.FillTable();
    this.calculateDelta();
    this.calculateDeltaA(); 
    this.calculateDeltaB();  

    //var trend = chart.series.push(new am4charts.LineSeries());
    if (this.HasOneDesicion()){
      this.trend = ControlChart.series.push(new am4charts.LineSeries());

      let bullet = this.trend.bullets.push(new am4charts.CircleBullet());
      bullet.strokeWidth = 2;
      //bullet.stroke = am4core.color(color);
      bullet.tooltipText = "Y = " + Math.round(this.deltaA*1000)/1000 + " X + "+ + Math.round(this.deltaB*1000)/1000 ;
      this.trend.typeSeries = "trend";
      this.trend.name = name;
      this.trend.dataFields.valueY = "Y";
      this.trend.dataFields.valueX = "X";
      this.trend.strokeWidth = 3;
      this.trend.stroke = am4core.color(color);
      this.trend.strokeOpacity = 0.7;
      this.trend.data = [
        { "Y": this.calculateY(data[0].X), "X": data[0].X },
        { "Y": this.calculateY(data[data.length-1].X), "X": data[data.length-1].X }
      ];
    }
    }
  

  getTrend(){
    return this.trend;
  }

  calculateY (x) {
    return this.deltaA * x + this.deltaB;
  }

  FillTable(){
    this.sumX  = 0;
    this.sumY  = 0;
    this.sumX2 = 0;
    this.sumXY = 0;
    for (let i = 0; i < this.data.length; i++) {
      this.sumX  = this.sumX  + this.data[i].X;
      this.sumY  = this.sumY  +  this.data[i].Y;
      this.sumX2 = this.sumX2 + (this.data[i].X * this.data[i].X);
      this.sumXY = this.sumXY + (this.data[i].X * this.data[i].Y);
    }
    this.n     = this.data.length;
  }

  HasOneDesicion() {
    if (this.delta >0 ){
      return true
    }else {
      return false
    }
  }

  calculateDelta() {
    this.delta = this.sumX2 * this.n - this.sumX * this.sumX
  }

  calculateDeltaA() {

    if ( this.HasOneDesicion() ){
      this.deltaA = ( this.sumXY * this.n - this.sumX * this.sumY ) / this.delta
    }

  }

  calculateDeltaB() {
    if ( this.HasOneDesicion() ){
      this.deltaB = ( this.sumX2 * this.sumY - this.sumXY * this.sumX ) / this.delta
    }
  } 

  checkDecision () {
    firstD = (this.sumX2 * this.deltaA + this.deltaB * this.sumX == this.sumXY)
    secondD = (this.sumX * this.deltaA + this.n * this.deltaB == fun.sumY)
    if (firstD && secondD) {
      return true
    }else{
      return false
    }

  }

}

class Persentil{

  constructor(name,percentage,data ) {
    this.data = data
    this.range = CTH.xAxes.values[0].axisRanges.create();
    this.range.category   =  this.Quartile(percentage)+ 1 ;
     
    this.range.grid.strokeOpacity = 1;
    this.range.grid.strokeDasharray = "10";
    this.range.typeSeries == "Persentil";

    this.range.label.text = name + "-" + this.Quartile(percentage) +"д.";
    this.range.grid.stroke = am4core.color("#396478");
    this.range.grid.strokeWidth = 2;
    this.range.label.location = -0.5;
    this.range.label.disabled = false;
    this.range.label.adapter.add("horizontalCenter", function() {
      return "middle";
    });


  }

  Quartile85() {
    return Quartile(0.85);
  }

  Quartile95() {
    return Quartile(0.85);
  }

  Quartile(q) {
    this.data=this.Array_Sort_Numbers(this.data);
    var pos = (this.data.length - 1) * q;
    var base = Math.ceil(pos);
    var rest = pos - base;
    if( (this.data[base]==undefined) ) {
      return Math.ceil(this.data[this.data.length-1]);
    } else {
      return Math.ceil(this.data[base]);
    }
  }

  Array_Sort_Numbers(inputarray){
    return inputarray.sort(function(a, b) {
      return a - b;
    });
  }
}

window.onload = function() {

    refreshDeskList();
    Diagrams();

    $("#refreshButton").click(function(){
        let JSONData =
        {
            "Startdate":new Date($("#DateStart").val()),
            "Enddate": new Date($("#DateEnd").val()),
            "Desk" : $("#DeskList option:selected").val(),
            "startId":"1",
            "endId":"8"
        }

        $.ajax({
            type: "POST",
            url: "/KanbanToolGraphAPI/CFD/",
            crossDomain : true,
            async: true,
            data: JSON.stringify(JSONData),
        }).done(function (cfdJson) {
                CFD.data = cfdJson; 
        });  

        $.ajax({
          type: "POST",
          url: "/KanbanToolGraphAPI/controlchart/",
          crossDomain : true,
          async: true,
          data: JSON.stringify(JSONData),
          }).done(function (Json) {
              ControlChart.data = Json; 
              checkedTrend($("#showTrend").is(':checked'))
        });  
        // SChart
        $.ajax({
          type: "POST",
          url: "/KanbanToolGraphAPI/SChart/",
          crossDomain : true,
          async: true,
          data: JSON.stringify(JSONData),
        }).done(function (SpectralChartJSON) {
          CTH.data = SpectralChartJSON.sort(function(obj1, obj2) {
            if (obj1.day < obj2.day) return -1;
            if (obj1.day > obj2.day) return 1;
            return 0;
          });
          checkedPercentils($("#showPercentils").is(':checked'));


        });
    });

    // Модальное окно
    $("#сloseButton").click(function(){
      $("#KanbanMore").hide("slow");
      $(".TitleBitrix24").empty();
      $(".Descripion").empty();
      $(".StageMore").empty();
      $(".BlokersMore").empty();
      $(".KanbanMoreComents").empty();
  });

}
function checkedPercentils(ev){

  /*CTH.xAxes.values[0].axisRanges.values.forEach(function(value,index,array){
    
  });*/
  for (var i = CTH.xAxes.values[0].axisRanges.length; i > 0; i--) { 
    CTH.xAxes.values[0].axisRanges.removeValue(CTH.xAxes.values[0].axisRanges.values[i-1]);
  }

  if (typeof ev === "boolean"){
    cheked = ev;
  }else{
    cheked = ev.checked;
  }
  
  if ( cheked ) {
    showPercentils(CTH.data);
  }
 
}

function showPercentils(data){
  myMap = new Map();
  newData = [];
  CTH.series.values.forEach(function (value, index,array){
    myMap.set(value.id, value._isHidden);
  });

  data.forEach(function (value, index,array){
    for (key in value){
      if (myMap.has(key) &&  !myMap.get(key) ){
        for(i=0;i <value[key];i++){
          newData.push(value["day"]);
        }
      }
    }
  });
  showPercentil85 = new Persentil("85%",0.85,newData); 
  showPercentil50 = new Persentil("50%",0.5,newData); 
  showPercentil95 = new Persentil("95%",0.95,newData); 
  
}

function checkedTrend(ev){

  let seriesForDelete = new Array();
  ControlChart.series.values.forEach(function (row, index) {
    if (row.typeSeries == "trend"){
      seriesForDelete.push(row);
    }
  });

  seriesForDelete.forEach(function (row, index) {
    ControlChart.series.removeIndex(
      ControlChart.series.indexOf(row)
    ).dispose();
  });

  if (typeof ev === "boolean"){
    cheked = ev;
  }else{
    cheked = ev.checked;
  }

  if ( cheked ) {
    showTrend(ControlChart.data);
  }
  
}

function showTrend(Json){
  dataArray = new Array ();
  dataArray.push({id:taskTypes[0].id,name:taskTypes[0].name,color:taskTypes[0].color,data:new Array()});
  dataArray.push({id:taskTypes[1].id,name:taskTypes[1].name,color:taskTypes[1].color,data:new Array()});
  dataArray.push({id:taskTypes[2].id,name:taskTypes[2].name,color:taskTypes[2].color,data:new Array()});
  dataArray.push({id:taskTypes[4].id,name:taskTypes[4].name,color:taskTypes[4].color,data:new Array()});
  dataArray.push({id:taskTypes[3].id,name:taskTypes[3].name,color:taskTypes[3].color,data:new Array()});
  

  Json.forEach(function (row, index){
      let dataRow = {X:parseInt(row["id"+row.typetask + "_x"]),Y:parseInt(row["id"+row.typetask + "_y"])}
      element = dataArray.find(function(element, index, array){
        if (element.id == ("id"+row.typetask)){
          return element;
        }
      },row);
      element.data.push(dataRow);
  });

  dataArray.forEach(function (row, index) {
    let trend = new FunctionTrend(row.data,row.name,row.color)
  });
}
function refreshDeskList(){
    
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/desklist/0",
        crossDomain : true,
        async: false,
        data: ""
   }).done(function (DeskList) {
        $("#DeskList").empty();
        let FirstEvent=true;
        DeskList.forEach(function(element) {
            if (FirstEvent){
                $("#DeskList").append('<option selected="selected" value="' + element.Id+ '">'+ element.Name + '</h3>');
                FirstEvent = false;
            }else{
                $("#DeskList").append('<option value="' + element.Id+ '">'+ element.Name + '</h3>');
            }

        });
    });  

    $( "#DeskList" ).change(function() {
        FillInKanbanDesk($("#DeskList option:selected").val());
    });
}


function Diagrams(){
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
        
        CFD = am4core.create("CFD", am4charts.XYChart);

        CFD.exporting.menu = new am4core.ExportMenu();
        CFD.exporting.menu.align = "left";
        CFD.exporting.menu.verticalAlign = "top";

        CFD.dateFormatter.inputDateFormat = "yyyy-MM-dd";
        var dateAxis = CFD.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 5;
        dateAxis.startLocation = 0.5;
        dateAxis.endLocation = 0.5;
        dateAxis.baseInterval = {
          timeUnit: "day",
          count: 1
        };

        dateAxis.dateFormats.setKey("day", "[font-size: 12px]dd");
        dateAxis.periodChangeDateFormats.setKey("day", "[bold]MM ");
        dateAxis.skipEmptyPeriods = true; 

        dateAxis.groupData = true;
        dateAxis.groupIntervals.setAll([
            { timeUnit: "day", count: 1 },
            { timeUnit: "day", count: 5 },
            { timeUnit: "month", count: 1 }
          ]);
        CFD.colors.list = [
          am4core.color("#000000"),
          am4core.color("#009999"),
          am4core.color("#00b33c"),
          am4core.color("#993300"),
          am4core.color("#344ceb"),
          am4core.color("#F9F871"),
          am4core.color("#669900"),
          am4core.color("#eb3434"),
          am4core.color("#ba0085")
        ];
        
        var valueAxis = CFD.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        
        valueAxis.extraMax = 0.5;       
        var series = CFD.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.name = "Done";
        series.dataFields.valueY = "8";
        series.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series.name+" <b>{valueY.value}</b></span>";
        series.tooltipText = "[#000]{valueY.value}[/]";
        series.tooltip.background.fill = am4core.color("#FFF");
        series.tooltip.getStrokeFromObject = true;
        series.tooltip.background.strokeWidth = 3;
        series.tooltip.getFillFromObject = false;
        series.fillOpacity = 0.6;
        series.strokeWidth = 1;
        series.stacked = true;
        
        var series2 = CFD.series.push(new am4charts.LineSeries());
        series2.name = "UAT";
        series2.dataFields.dateX = "date";
        series2.dataFields.valueY = "7";
        series2.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series2.name+" <b>{valueY.value}</b></span>";
        series2.tooltipText = "[#000]{valueY.value}[/]";
        series2.tooltip.background.fill = am4core.color("#FFF");
        series2.tooltip.getFillFromObject = false;
        series2.tooltip.getStrokeFromObject = true;
        series2.tooltip.background.strokeWidth = 1;
        series2.sequencedInterpolation = true;
        series2.fillOpacity = 0.6;
        series2.stacked = true;
        series2.strokeWidth = 1;
        
        
        var series2 = CFD.series.push(new am4charts.LineSeries());
        series2.name = "Ready to deploy";
        series2.dataFields.dateX = "date";
        series2.dataFields.valueY = "17";
        series2.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series2.name+" <b>{valueY.value}</b></span>";
        series2.tooltipText = "[#000]{valueY.value}[/]";
        series2.tooltip.background.fill = am4core.color("#FFF");
        series2.tooltip.getFillFromObject = false;
        series2.tooltip.getStrokeFromObject = true;
        series2.tooltip.background.strokeWidth = 1;
        series2.sequencedInterpolation = true;
        series2.fillOpacity = 0.6;
        series2.stacked = true;
        series2.strokeWidth = 1;
        
        
        var series3 = CFD.series.push(new am4charts.LineSeries());
        series3.name = "Тестирование";
        series3.dataFields.dateX = "date";
        series3.dataFields.valueY = "6";
        series3.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series3.name+" <b>{valueY.value}</b></span>";
        series3.tooltipText = "[#000]{valueY.value}[/]";
        series3.tooltip.background.fill = am4core.color("#FFF");
        series3.tooltip.getFillFromObject = false;
        series3.tooltip.getStrokeFromObject = true;
        series3.tooltip.background.strokeWidth = 1;
        series3.sequencedInterpolation = true;
        series3.fillOpacity = 0.6;
        series3.defaultState.transitionDuration = 1000;
        series3.stacked = true;
        series3.strokeWidth = 1;
        
        
        var series4 = CFD.series.push(new am4charts.LineSeries());
        series4.name = "Разработка готово";
        series4.dataFields.dateX = "date";
        series4.dataFields.valueY = "5";
        series4.sequencedInterpolation = true;
        series4.fillOpacity = 0.6;
        series4.defaultState.transitionDuration = 1000;
        series4.stacked = true;
        series4.strokeWidth = 1;
        series4.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series4.name+" <b>{valueY.value}</b></span>";
        series4.tooltipText = "[#000]{valueY.value}[/]";
        series4.tooltip.background.fill = am4core.color("#FFF");
        series4.tooltip.getFillFromObject = false;
        series4.tooltip.getStrokeFromObject = true;
        series4.tooltip.background.strokeWidth = 3;
        
        var series5 = CFD.series.push(new am4charts.LineSeries());
        series5.name = "Разработка в работе";
        series5.dataFields.dateX = "date";
        series5.dataFields.valueY = "4";
        series5.sequencedInterpolation = true;
        series5.fillOpacity = 0.6;
        series5.defaultState.transitionDuration = 1000;
        series5.stacked = true;
        series5.strokeWidth = 1;
        series5.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series5.name+" <b>{valueY.value}</b></span>";
        series5.tooltipText = "[#000]{valueY.value}[/]";
        series5.tooltip.background.fill = am4core.color("#FFF");
        series5.tooltip.getFillFromObject = false;
        series5.tooltip.getStrokeFromObject = true;
        series5.tooltip.background.strokeWidth = 3;
        
        var series6 = CFD.series.push(new am4charts.LineSeries());
        series6.name = "Анализ готово";
        series6.dataFields.dateX = "date";
        series6.dataFields.valueY = "3";
        series6.sequencedInterpolation = true;
        series6.fillOpacity = 0.6;
        series6.defaultState.transitionDuration = 1000;
        series6.stacked = true;
        series6.strokeWidth = 1;
        series6.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series6.name+" <b>{valueY.value}</b></span>";
        series6.tooltipText = "[#000]{valueY.value}[/]";
        series6.tooltip.background.fill = am4core.color("#FFF");
        series6.tooltip.getFillFromObject = false;
        series6.tooltip.getStrokeFromObject = true;
        series6.tooltip.background.strokeWidth = 3;
        
        var series7 = CFD.series.push(new am4charts.LineSeries());
        series7.name = "Анализ в работе";
        series7.dataFields.dateX = "date";
        series7.dataFields.valueY = "2";
        series7.sequencedInterpolation = true;
        series7.fillOpacity = 0.6;
        series7.defaultState.transitionDuration = 1000;
        series7.stacked = true;
        series7.strokeWidth = 1;
        series7.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series7.name+" <b>{valueY.value}</b></span>";
        series7.tooltipText = "[#000]{valueY.value}[/]";
        series7.tooltip.background.fill = am4core.color("#FFF");
        series7.tooltip.getFillFromObject = false;
        series7.tooltip.getStrokeFromObject = true;
        series7.tooltip.background.strokeWidth = 3;
        
        var series8 = CFD.series.push(new am4charts.LineSeries());
        series8.name = "В работу";
        series8.dataFields.dateX = "date";
        series8.dataFields.valueY = "1";
        series8.sequencedInterpolation = true;
        series8.fillOpacity = 0.6;
        series8.defaultState.transitionDuration = 1000;
        series8.stacked = true;
        series8.strokeWidth = 1;
        series8.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series8.name+" <b>{valueY.value}</b></span>";
        series8.tooltipText = "[#000]{valueY.value}[/]";
        series8.tooltip.background.fill = am4core.color("#FFF");
        series8.tooltip.getFillFromObject = false;
        series8.tooltip.getStrokeFromObject = true;
        series8.tooltip.background.strokeWidth = 3;
        
        CFD.cursor = new am4charts.XYCursor();
        CFD.cursor.xAxis = dateAxis;
        var valueAxis = CFD.yAxes.push(new am4charts.ValueAxis());
        CFD.scrollbarX = new am4core.Scrollbar();
        
        // Add a legend
        CFD.legend = new am4charts.Legend();
        CFD.legend.position = "top";
        
CTH = am4core.create("SChart", am4charts.XYChart);


// Add data

  CTH.colors.list = [
    am4core.color("#cccc00"),
    am4core.color("#4caf50"),
    am4core.color("#e95757"),
    am4core.color("#ff8800"),
    am4core.color("#f68fff"),
  ];

// Create axes
var categoryAxis = CTH.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "day";
categoryAxis.renderer.grid.template.location = 0;


CTH.cursor = new am4charts.XYCursor();
CTH.cursor.xAxis = dateAxis;
CTH.scrollbarX = new am4core.Scrollbar();

var valueAxis = CTH.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.disabled = true;
valueAxis.min = 0;
valueAxis.calculateTotals = true;
// Create series
function createSeries(field, name) {
  
  // Set up series
  var series = CTH.series.push(new am4charts.ColumnSeries());
  series.id = field;
  series.name = name;
  series.dataFields.valueY = field;
  series.dataFields.categoryX = "day";
  series.sequencedInterpolation = true;
  series.stacked = true;
  
  // Configure columns
  series.columns.template.width = am4core.percent(60);
  series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
  
  // Add label
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueY}";
  labelBullet.locationY = 0.5;
  
  return series;
}

createSeries("id5", "Стандартные");
createSeries("id1", "НМА");
createSeries("id3", "Ошибки");
createSeries("id2", "Тех.поддержка");
createSeries("id4", "Проекты");

// Legend
CTH.legend = new am4charts.Legend();
CTH.exporting.menu = new am4core.ExportMenu();
CTH.exporting.menu.align = "left";
CTH.exporting.menu.verticalAlign = "top";

//*********************************************
//Control Chart
//
ControlChart = am4core.create("ControlChart", am4charts.XYChart);




ControlChart.legend = new am4charts.Legend();
ControlChart.exporting.menu = new am4core.ExportMenu();
ControlChart.exporting.menu.align = "left";
ControlChart.exporting.menu.verticalAlign = "top";

// Create axes
var valueAxisX = ControlChart.xAxes.push(new am4charts.ValueAxis());
valueAxisX.title.text = 'Задача';
valueAxisX.renderer.minGridDistance = 40;

// Create value axis
var valueAxisY = ControlChart.yAxes.push(new am4charts.ValueAxis());
valueAxisY.title.text = 'Дни';

// Create series

function NewSeries(id,color,name) {
    var lineSeries = ControlChart.series.push(new am4charts.LineSeries());
    lineSeries.name = name;
    lineSeries.dataFields.valueY = id + "_y";
    lineSeries.dataFields.valueX = id + "_x";
    lineSeries.dataFields.idtask = id + "_idtask";
    lineSeries.strokeOpacity = 0;
    // Add a bullet
    var bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.tooltipText = "idTask - {idtask}, leadTime: {valueY} ";
    bullet.events.on("doublehit", function(ev) {
      getTask(ev.target.dataItem.idtask)
      //alert("Clicked on " + ev.target.dataItem.idtask + ": " + ev.target.dataItem.valueY);
    }); 
    // Add a triangle to act as am arrow
    var arrow = bullet.createChild(am4core.Circle);
    arrow.stroke = am4core.color('rgba(0, 0, 0, 0.4)');
    arrow.horizontalCenter = "middle";
    arrow.verticalCenter = "middle";
    arrow.strokeWidth = 1;
    arrow.fill = am4core.color(color);
    arrow.direction = "top";
    arrow.width = 10;
    arrow.height = 10;
}


NewSeries("id1","#4caf50", "НМА");
NewSeries("id2","#ff8800", "Тех.поддержка");
NewSeries("id3","#e95757", "Ошибки");
NewSeries("id4","#f68fff", "Проекты");
NewSeries("id5","#cccc00", "Стандартные");

//scrollbars
ControlChart.scrollbarX = new am4core.Scrollbar();
ControlChart.scrollbarY = new am4core.Scrollbar();

}); // end am4core.ready()

}


function getTask (id){
  $("#KanbanMore").show("slow");
  $.ajax({
      type: "GET",
      url: "/KanbanToolAPI/task/"+ id ,
      crossDomain : true,
      data: ""

 }).done(function (Kanbans) {
  if( Kanbans.errorId != undefined && Kanbans.errorId == "401" ){
      window.location.replace("/login")
      return
  }
      //$(".taskKanbanTool").attr("id", element.Id);
      $(".TitleBitrix24").append(`<h3><a target="_blank" href="https://rer.bitrix24.ru/company/personal/user/`+ window.Bitrix24id + `/tasks/task/view/`+Kanbans.IdBitrix24+`/">№` + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</a></h3>");
      $(".Descripion").append(Kanbans.DescriptionHTML);
      let DefaultButton = `
      <button type="button" class="btn btn-link btn-xs " 
                          style="padding:1px" 
                          onclick="StartModalWindow(this)" 
                          data-toggle="modal" 
                          data-target="#exampleModal">
                              <i class="fa fa-pencil" aria-hidden="true"></i>
      </button> 
      <button type="button" class="btn btn-link btn-xs" style="padding:1px">
          <i class="fa fa-trash" aria-hidden="true"></i>
      </button> `
      Kanbans.StagesHistory.forEach(function(element) {

          const startDate = (new Date(element.Start)).toLocaleDateString();
          let endDate 
          if (element.End =="0001-01-01T00:00:00Z"){
              Stringdate = " настоящее время";
          }else{
              Stringdate = (new Date(element.End)).toLocaleDateString();
          }

          const StringSS = `
              <span id="`+element.Id+`" class="onhover"> 
                  <b>`+element.Name +'</b> c ' + startDate + ' по ' + Stringdate + ' ('+ calculationGapDatesString(element.Start,element.End) + ')'+ DefaultButton + `
              </span>` 
          $(".StageMore").append(StringSS);
      });
      Kanbans.Blokers.forEach(function(element) {


          const startDate = (new Date(element.Startdate)).toLocaleDateString();
          let endDate 
          if (element.Enddate =="0001-01-01T00:00:00Z"){
              Stringdate = " настоящее время";
          }else{
              Stringdate = (new Date(element.Enddate)).toLocaleDateString();
          }
          let decision = '';
          
          if (element.Finished) {
              decision = element.Diside;
          }else{
              //decision= `<button type="button" class="btn btn-outline-danger" onclick="Alert("Тест")">Danger</button>`
              
              //decision= ` <button type="button" class="close" aria-label="Close" id="`+element.Id+`" data-toggle="modal" data-target="#exampleModal" "><span aria-hidden="true">&times;</span></button>`;
          }
         
          const StringSS = '<span id="'+element.Id +'" class="onhover"> <b>'+ element.Description +'</b> c ' + startDate + ' по ' 
          + Stringdate + ' ('+ calculationGapDatesString(element.Startdate,element.Enddate) + '). '
          + decision + DefaultButton + '</span>'

          $(".BlokersMore").append(StringSS);
      });
      Kanbans.Comments.forEach(function(element) {
          const date = new Date(element.POST_DATE)
          $(".KanbanMoreComents").append(`<div class="comments"><div class="CMauthor">`+ element.AUTHOR_NAME + `
           <span style="position: absolute;
                                  right: 41%;
                                  font-weight: normal;
                                  font-size: smaller;" 
          > `+ date.toLocaleDateString() +' ' +   date.toLocaleTimeString() + `
              </span>
              </div>
              <div class="CMdescription">`+ element.POST_MESSAGE_HTML +`
              </div>
          </div>`)
      });
  });
}

function calculationGapDatesString(StartDateIn, EndDateIn) {
  let StartDate = new Date(StartDateIn);
  let EndDate;
  if (EndDateIn =="0001-01-01T00:00:00Z") {
      EndDate = new Date();
  }else{
      EndDate = new Date(EndDateIn);
  }
  let times = Math.ceil(Math.abs(EndDate.getTime() - StartDate.getTime()) / (1000 * 60));
  if (Math.floor(times/(60*24)) > 0){
      Result = Math.floor(times/(60*24)) + " д.";
  }else if(Math.floor(times/(60)) > 0 ){
      Result = Math.floor(times/(60)) + " ч.";
  }else{
      Result = Math.floor(times) + " м.";
  }
  return Result;
}