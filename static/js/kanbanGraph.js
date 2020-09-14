var Columns = [];
let deskTypesWorkItem;
let deskGloabal;
var Kanbans;
let CumulativeChart, SpectralChart, ControlChart,ThroughputChart;

let Typeperiod = [
  { Id:0,Name:"День"},
  { Id:1,Name:"Неделя"},
  { Id:2,Name:"Месяц"},
  { Id:3,Name:"Квартал"},
]


window.KanbanDesk;
window.onload = function() {

    refreshDeskList();
    
    initDesk($("#DeskList option:selected").val());
    window.KanbanDesk = new KanbanDesk($("#DeskList option:selected").val());
    window.KanbanDesk.GetDeskDataFromServer();
    const init = new Promise( (resolve, reject)=> {
      while (true) {
        if (Array.isArray(deskTypesWorkItem)){
          return resolve
        }
      }
    });

    init.then(
      Diagrams()
    );
    
    $("#DeskList").change(function() {
      initDesk($("#DeskList option:selected").val());
      window.KanbanDesk = new KanbanDesk($("#DeskList option:selected").val());
      window.KanbanDesk.GetDeskDataFromServer()
    })
    

  $("#btnRefreshCFD").click(function(){
    let JSONData =
    {
        "Startdate":new Date($("#DateStart").val()),
        "Enddate": new Date($("#DateEnd").val()),
        "Desk" : $("#DeskList option:selected").val(),
        "StartId":deskGloabal.Startstage.toString(),
        "EndId":deskGloabal.Endstage.toString()
    }
    $.ajax({
        type: "POST",
        url: "/KanbanToolGraphAPI/CFD/",
        crossDomain : true,
        async: true,
        data: JSON.stringify(JSONData),
    }).done(function (cfdJson) {
      CumulativeChart.NewSeries(deskGloabal.Stages);
      CumulativeChart.Graph.data = cfdJson;

    });  
  });
  $("#btnShowExperement").click(function(){
    CumulativeChart.showExperements();
  });

  $("#btnShowExperementTPC").click(function(){
    ThroughputChart.showExperements();
  });

  $("#btnTaksForView").click(function(){
    
    let workItem = new WorkItem(); 
    workItem.Id = document.getElementById("idTaksForView").value;
    workItem.StartModalWindow();
  });

  $("#btnRefreshCC").click(function(){
    let JSONData ={
    "Startdate":new Date($("#DateStartCC").val()),
        "Enddate": new Date($("#DateEndCC").val()),
        "Stages" : $('#StagesCC').val().toString(),
        "Desk" : $("#DeskList option:selected").val(),
        "StartId":deskGloabal.Startstage.toString(),
        "EndId":deskGloabal.Endstage.toString()
    }

    $.ajax({
      type: "POST",
      url: "/KanbanToolGraphAPI/controlchart/",
      crossDomain : true,
      async: true,
      data: JSON.stringify(JSONData),
    }).done(function (Json) {
          ControlChart.NewSeries(deskTypesWorkItem);
          ControlChart.Graph.data = Json; 
          const info = document.getElementById("infoCC");
          info.innerHTML = `Всего элементов: <b> ${Json.length} </b>`;
          checkedTrend($("#showTrend").is(':checked'))
          
          
    }); 

  });
   
  $("#btnRefreshSC").click(function(){
    let StagesSC = $('#StagesSC').val().toString();
    let JSONData =
    {
        "Startdate":new Date($("#DateStartSC").val()),
        "Enddate": new Date($("#DateEndSC").val()),
        "Desk" : $("#DeskList option:selected").val(),
        "Stages" : StagesSC,
        "StartId":deskGloabal.Startstage.toString(),
        "EndId":  deskGloabal.Endstage.toString()
    }

   $.ajax({
      type: "POST",
      url: "/KanbanToolGraphAPI/SChart/",
      crossDomain : true,
      async: true,
      data: JSON.stringify(JSONData),
    }).done(function (SpectralChartJSON) {
      let newArray = [],newArrayTasks = [];;
      for (var key in SpectralChartJSON.dataChart) {
        newArray.push(SpectralChartJSON.dataChart[key]);
      }
      for (var key in SpectralChartJSON.dataTask) {
        newArrayTasks.push(SpectralChartJSON.dataTask[key]);
      }
      SpectralChart.Graph.data = newArray.sort(function(obj1, obj2) {
        if (obj1.day < obj2.day) return -1;
        if (obj1.day > obj2.day) return 1;
        return 0;
      });
      SpectralChart.NewSeries(deskTypesWorkItem)
      SpectralChart.Graph.dataTasks = SpectralChartJSON.dataTask;
      const info = document.getElementById("infoSC");
      info.innerHTML = `Всего элементов: <b> ${newArrayTasks.length} </b>`;

      checkedPercentils($("#showPercentils").is(':checked'));  
  }); 
});
  $("#btnRefreshTPC").click(function(){
    let JSONData = {
        "Enddate": new Date($("#DateEndTPC").val()),
        "Startdate":new Date($("#DateStartTPC").val()),
        "Desk" : $("#DeskList option:selected").val(),
        "StartId":deskGloabal.Startstage.toString(),
        "EndId":  deskGloabal.Endstage.toString(),
        "Typeperiod":$("#TypeperiodTPC option:selected").val()
        }
      
    $.ajax({
        type: "POST",
      url: "/KanbanToolGraphAPI/TPChart/",
      crossDomain : true,
      async: true,
      data: JSON.stringify(JSONData),
    }).done(function (Data) { 
      
      let newArray = [],newArrayTasks = [];
      for (var key in Data.dataChart) {
        newArray.push(Data.dataChart[key]);
      }

      for (var key in Data.dataTask) {
        newArrayTasks.push(Data.dataTask[key]);
      }

      ThroughputChart.Graph.data = newArray.sort(function(obj1, obj2) {
        if (obj1.Data < obj2.Data) return -1;
        if (obj1.Data > obj2.Data) return 1;
        return 0;
      });
      ThroughputChart.Graph.dataTasks = newArrayTasks;
      ThroughputChart.dateAxis.axisRanges.clear();
      ThroughputChart.NewSeries(deskTypesWorkItem)
      

      const info = document.getElementById("infoTPC");
      info.innerHTML = `Всего элементов: <b> ${newArrayTasks.length} </b>`;
      
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

  for (var i = SpectralChart.Graph.xAxes.values[0].axisRanges.length; i > 0; i--) { 
    SpectralChart.Graph.xAxes.values[0].axisRanges.removeValue(SpectralChart.Graph.xAxes.values[0].axisRanges.values[i-1]);
  }

  if (typeof ev === "boolean"){
    cheked = ev;
  }else{
    cheked = ev.checked;
  }
  
  if ( cheked ) {
    showPercentils(SpectralChart.Graph.data);
  }
 
}

function showPercentils(data){
  myMap = new Map();
  newData = [];
  SpectralChart.Graph.series.values.forEach(function (value, index,array){
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
  if (document.getElementById("FirstPercentil").value != ""){
    showPercentil85 = new Persentil(
      document.getElementById("FirstPercentil").value + "%",
    parseInt(document.getElementById("FirstPercentil").value)/100,
    newData); 
  }
  if (document.getElementById("SecondPercentil").value != ""){
    showPercentil50 = new Persentil(
      document.getElementById("SecondPercentil").value + "%",
      parseInt(document.getElementById("SecondPercentil").value)/100,
      newData); 
  }
  if (document.getElementById("ThirdPercentil").value != ""){
    showPercentil95 = new Persentil(
      document.getElementById("ThirdPercentil").value+"%",
      parseInt(document.getElementById("ThirdPercentil").value)/100,
      newData); 
  }
}

function checkedTrend(ev){

  let seriesForDelete = new Array();
  ControlChart.Graph.series.values.forEach(function (row, index) {
    if (row.typeSeries == "trend"){
      seriesForDelete.push(row);
    }
  });

  seriesForDelete.forEach(function (row, index) {
    ControlChart.Graph.series.removeIndex(
      ControlChart.Graph.series.indexOf(row)
    ).dispose();
  });

  if (typeof ev === "boolean"){
    cheked = ev;
  }else{
    cheked = ev.checked;
  }

  if ( cheked ) {
    showTrend(ControlChart.Graph.data);
  }
  
}

function showTrend(Json){
  dataArray = new Array ();
  deskTypesWorkItem.forEach((el)=>{
    dataArray.push({
      id:el.Id,
      name:el.Name,
      color:el.Color,
      data:new Array()});  
  });
  

  Json.forEach(function (row, index){
      let dataRow = {X:parseInt(row["id"+row.typetask + "_x"]),Y:parseInt(row["id"+row.typetask + "_y"])}
      element = dataArray.find(function(element, index, array){
        if (element.id == row.typetask){
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
        let select ="";
        DeskList.forEach(function(element) {

          if (window.defaultDesk==element.Id) {
            select = `selected="selected"`;
          }else{
            select = ``;
          }

          $("#DeskList").append(`<option ${select} value="${element.Id}">${element.Name}</option>`);

        });
    });  
}


function Diagrams(){
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_animated);

        CumulativeChart = new CumulativeFlowDiagramm("CFD");
        SpectralChart = new SpectralChartGraph("SChart");
        ControlChart = new ControlChartGraph("ControlChart");
        ThroughputChart = new ThroughputChartGraph("ThroughputChart");
        
//*********************************************
//Control Chart
//

}); // end am4core.ready()

}

function startViewTask(id){
 let workItem = new WorkItem(); 
 workItem.Id = id;
 workItem.StartModalWindow();
}

function rgba2hex(orig) {
  var a, isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (rgb && rgb[4] || "").trim(),
    hex = rgb ?
    (rgb[1] | 1 << 8).toString(16).slice(1) +
    (rgb[2] | 1 << 8).toString(16).slice(1) +
    (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 01;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  //hex = hex + a;

  return "#"+hex;
}

function initDesk(DeskId){
  $.ajax({
		type: "GET",
		url: "/KanbanToolAPI/desk/"+DeskId,
		crossDomain : true,
		data: "",
    async: false
	}).done(function (desk) {
		if( desk.errorId != undefined && desk.errorId == "401" ){
			window.location.replace("/login")
			return
    }
    deskGloabal = desk;
    deskTypesWorkItem = desk.TypeWorkItems;
    StagesSelect = document.getElementById("StagesSC");
    StagesSelect.innerHTML="";

    StagesCCSelect = document.getElementById("StagesCC");
    StagesCCSelect.innerHTML="";    
    if (Array.isArray(deskGloabal.Stages)) {
      deskGloabal.Stages.sort((a, b)=>{
          return a.Order - b.Order;
      });
      deskGloabal.Stages.forEach((element)=>{
        StagesSelect.insertAdjacentHTML("beforeend",`<option value="${element.Id}" >${element.Name}</option>`);
        StagesCCSelect.insertAdjacentHTML("beforeend",`<option value="${element.Id}" >${element.Name}</option>`);
      });
    }

    Select = document.getElementById("TypeperiodTPC");
    Select.innerHTML="";
    
    Typeperiod.forEach((element)=>{
      Select.insertAdjacentHTML("beforeend",`<option value="${element.Id}" >${element.Name}</option>`);
    });


  });
}

class KanbanToolAnaliseBoard{
  constructor () {
    this.currentBoard = "";
    this.deskTypesWorkItem="";
    this.Div = "";
    this.Graphs = {};
  }

}
/////////////////////////////////////
//
//
//  Spectral Chart
//
//
class SpectralChartGraph {
  constructor (SChart){
    this.Graph = am4core.create(SChart, am4charts.XYChart);
    this.categoryAxis = this.Graph.xAxes.push(new am4charts.CategoryAxis());
    this.categoryAxis.dataFields.category = "day";
    this.categoryAxis.renderer.grid.template.location = 0;


    var dateAxis = this.Graph.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 5;
        dateAxis.startLocation = 0.5;
        dateAxis.endLocation = 0.5;
        dateAxis.baseInterval = {
          timeUnit: "day",
          count: 1
        };

        dateAxis.dateFormats.setKey("day", "[font-size: 12px]dd");
        dateAxis.periodChangeDateFormats.setKey("day", "[bold]w ");
        dateAxis.periodChangeDateFormats.setKey("week", "[bold]MM ");
        dateAxis.skipEmptyPeriods = true; 

        dateAxis.groupData = true;
        dateAxis.groupIntervals.setAll([
            { timeUnit: "day", count: 1 },
            { timeUnit: "week", count: 1 },
            { timeUnit: "month", count: 1 }
          ]);


    this.Graph.cursor = new am4charts.XYCursor();
    
    this.Graph.cursor.xAxis = dateAxis;
    this.Graph.scrollbarX = new am4core.Scrollbar();
    this.Graph.scrollbarY = new am4core.Scrollbar();
    var valueAxis = this.Graph.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;
    valueAxis.extraMax = 0.5; 
    valueAxis.calculateTotals = true;
    // Legend
    this.Graph.legend = new am4charts.Legend();
    this.Graph.exporting.menu = new am4core.ExportMenu();
    this.Graph.exporting.menu.align = "left";
    this.Graph.exporting.menu.verticalAlign = "top";
    // Create series
    
    deskTypesWorkItem.forEach((element) => {
      this.createSeries("id"+element.Id,rgba2hex(element.Color), element.Name);  
    });

  }

  createSeries = (field,color, name)=> {
    // Set up series
    var series = this.Graph.series.push(new am4charts.ColumnSeries());
    series.id = field;
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "day";
    series.sequencedInterpolation = true;
    series.stacked = true;
    series.fill = am4core.color(color)
    series.strokeWidth = 0;
    // Configure columns
    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
    
    // Add label
    var labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;

    labelBullet.events.on("doublehit", (ev)=> {
      const div = $(".taskList");
      div.empty();
      const ShowWorkItemsType = new Map();
      this.Graph.series.values.forEach(function (value, index,array){
        ShowWorkItemsType.set(value.id, !value._isHidden);
      });
      for (var key in this.Graph.dataTasks) {
        if (this.Graph.dataTasks[key].value === parseInt(ev.target.dataItem.categoryX) && ShowWorkItemsType.get('id'+this.Graph.dataTasks[key].typeTask)){
          let span = document.createElement("a");
          span.className = "rowWithTask";
          span.innerText = key;
          const workItem = new WorkItem();
          workItem.Id = key;

          span.addEventListener("click",()=>{
            $(".rowWithTask").removeClass("activeRow");
            workItem.StartModalWindow();
            span.classList.add("activeRow");
          });
          div.append(span);
        }
      }
      $("#KanbanMore").show("slow");
    }); 

    return series;
  }
  
  NewSeries(deskTypesWorkItem) {


    while (this.Graph.series.length > 0) {
      this.Graph.series.removeIndex(0).dispose();
    }
      
    deskTypesWorkItem.forEach((element) => {
      this.createSeries("id"+element.Id,rgba2hex(element.Color), element.Name);  
    });
   
  }
}

class CumulativeFlowDiagramm{
  constructor(Div){
    this.Graph = am4core.create(Div, am4charts.XYChart);

    this.Graph.exporting.menu = new am4core.ExportMenu();
    this.Graph.exporting.menu.align = "left";
    this.Graph.exporting.menu.verticalAlign = "top";

    this.Graph.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    this.dateAxis = this.Graph.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.minGridDistance = 5;
    this.dateAxis.startLocation = 0.5;
    this.dateAxis.endLocation = 0.5;
    this.dateAxis.baseInterval = {
      timeUnit: "day",
      count: 1
    };

    this.dateAxis.dateFormats.setKey("day", "[font-size: 12px]dd");
    this.dateAxis.periodChangeDateFormats.setKey("day", "[bold]w ");
    this.dateAxis.periodChangeDateFormats.setKey("week", "[bold]MM ");
    this.dateAxis.skipEmptyPeriods = true; 

    this.dateAxis.groupData = true;
    this.dateAxis.groupIntervals.setAll([
        { timeUnit: "day", count: 1 },
        { timeUnit: "week", count: 1 },
        { timeUnit: "month", count: 1 }
      ]);
      this.Graph.colors.list = [
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
    this.Graph.cursor = new am4charts.XYCursor();
    this.Graph.cursor.xAxis = this.dateAxis;
    var valueAxis = this.Graph.yAxes.push(new am4charts.ValueAxis());
    this.Graph.scrollbarX = new am4core.Scrollbar();
    
    // Add a legend
    this.Graph.legend = new am4charts.Legend();
    this.Graph.legend.position = "top";

    var valueAxis = this.Graph.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    
    valueAxis.extraMax = 0.5; 

    this.NewSeries(deskGloabal.Stages);
  }      

  createSeries(valueY,name,color){
    var series = this.Graph.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.name = name;
    series.dataFields.valueY = valueY;
    series.tooltipHTML = "<span style='font-size:14px; color:#000000;'>"+series.name+" <b>{valueY.value}</b></span>";
    series.tooltipText = "[#000]{valueY.value}[/]";
    series.tooltip.background.fill = am4core.color("#FFF");
    series.tooltip.getStrokeFromObject = true;
    series.tooltip.background.strokeWidth = 3;
    series.tooltip.getFillFromObject = false;
    series.fillOpacity = 0.6;
    series.strokeWidth = 1;
    series.stacked = true;
  }

  NewSeries(Stages) {
    while (this.Graph.series.length > 0) {
      this.Graph.series.removeIndex(0).dispose();
    }
    this.Graph.colors.list = [
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
    Stages.sort((a, b)=>{
      return (a.Order - b.Order)*-1;
    });

    Stages.forEach((element) => {
      this.createSeries(element.Id,element.Name,"");  
    });
  }

  createRange(name,start,end){
    var range = this.dateAxis.axisRanges.create();
    range.date = start;
    range.endDate = end;
    //range.axisFill.fill = chart.colors.getIndex(7);
    range.axisFill.fillOpacity = 0.2;

    range.label.text = name;
    range.label.inside = true;
    range.label.rotation = 90;
    range.label.horizontalCenter = "right";
    range.label.verticalCenter = "bottom";
  }

  showExperements(){
    while (this.dateAxis.axisRanges.length > 0) {
      this.dateAxis.axisRanges.removeIndex(0).dispose();
    }

    window.KanbanDesk.Experements.forEach(element =>{
      let start = element.Start;
      if (new Date($("#DateStart").val()) > start){
        start = new Date($("#DateStart").val());
      }

      let end = element.End;
      if (new Date($("#DateEnd").val()) < end){
        end = new Date($("#DateEnd").val());
      }
      this.createRange(element.Name,start,end);
    });
  }
}

class ControlChartGraph{
  constructor(div){
    this.Graph = am4core.create(div, am4charts.XYChart);

    this.Graph.legend = new am4charts.Legend();
    this.Graph.exporting.menu = new am4core.ExportMenu();
    this.Graph.exporting.menu.align = "left";
    this.Graph.exporting.menu.verticalAlign = "top";

    // Create axes
    const valueAxisX = this.Graph.xAxes.push(new am4charts.ValueAxis());
    valueAxisX.title.text = 'Задача';
    valueAxisX.renderer.minGridDistance = 40;

    // Create value axis
    const valueAxisY = this.Graph.yAxes.push(new am4charts.ValueAxis());
    valueAxisY.title.text = 'Дни';

    //scrollbars
    this.Graph.scrollbarX = new am4core.Scrollbar();
    this.Graph.scrollbarY = new am4core.Scrollbar();


    // Create series
    deskTypesWorkItem.forEach((element) => {
      this.createSeries("id"+element.Id,rgba2hex(element.Color), element.Name);  
    });
}

  NewSeries(deskTypesWorkItem) {
    while (this.Graph.series.length > 0) {
      this.Graph.series.removeIndex(0).dispose();
    }

    deskTypesWorkItem.forEach((element) => {
      this.createSeries("id"+element.Id,rgba2hex(element.Color), element.Name);  
    });
  }

  createSeries(id,color,name) {
    const lineSeries = this.Graph.series.push(new am4charts.LineSeries());
    lineSeries.name = name;
    lineSeries.dataFields.valueY = id + "_y";
    lineSeries.dataFields.valueX = id + "_x";
    lineSeries.dataFields.idtask = id + "_idtask";
    lineSeries.strokeOpacity = 0;
    // Add a bullet
    const bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.tooltipText = "idTask - {idtask}, leadTime: {valueY} ";
    bullet.events.on("doublehit", function(ev) {
      startViewTask(ev.target.dataItem.idtask);
    }); 
    // Add a triangle to act as am arrow
    const arrow = bullet.createChild(am4core.Circle);
    arrow.stroke = am4core.color('rgba(0, 0, 0, 0.4)');
    arrow.horizontalCenter = "middle";
    arrow.verticalCenter = "middle";
    arrow.strokeWidth = 1;
    arrow.fill = am4core.color(color);
    arrow.direction = "top";
    arrow.width = 10;
    arrow.height = 10;
    
  }
}
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
      this.trend = ControlChart.Graph.series.push(new am4charts.LineSeries());

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
    this.range = SpectralChart.Graph.xAxes.values[0].axisRanges.create();
    this.range.category   =  this.Quartile(percentage)+ 1 ;
     
    this.range.grid.strokeOpacity = 1;
    this.range.grid.strokeDasharray = "10";
    this.range.typeSeries == "Persentil";

    this.range.label.text = name + "-" + this.Quartile(percentage) +"д.";
    this.range.grid.stroke = am4core.color("#396478");
    this.range.grid.strokeWidth = 2;
    this.range.label.location = -0.5;
    this.range.label.disabled = false;

    this.range.label.inside = true;
    this.range.label.rotation = 90;
    //this.range.label.horizontalCenter = "left";
    this.range.label.verticalCenter = "bottom";
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

class ThroughputChartGraph {
  constructor (div){
    this.Graph = am4core.create(div, am4charts.XYChart);
    this.categoryAxis = this.Graph.xAxes.push(new am4charts.CategoryAxis());
    this.categoryAxis.dataFields.category = "Data";
    this.categoryAxis.renderer.grid.template.location = 0;
    this.dateAxis =  this.categoryAxis;


    this.Graph.cursor = new am4charts.XYCursor();
    
    //scrollbars
    this.Graph.scrollbarX = new am4core.Scrollbar();
    this.Graph.scrollbarY = new am4core.Scrollbar();

    var valueAxis = this.Graph.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = false;

    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    // Legend
    this.Graph.legend = new am4charts.Legend();
    this.Graph.exporting.menu = new am4core.ExportMenu();
    this.Graph.exporting.menu.align = "left";
    this.Graph.exporting.menu.verticalAlign = "bottom";
    // Create series
    
    deskTypesWorkItem.forEach((element) => {
      this.createSeries("type"+element.Id,rgba2hex(element.Color), element.Name);  
    });

  }

  createSeries = (field,color, name)=> {
    // Set up series
    var series = this.Graph.series.push(new am4charts.ColumnSeries());
    series.id = field;
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = "Data";
    series.sequencedInterpolation = false;
    series.stacked = true;
    series.fill = am4core.color(color)
    series.strokeWidth = 0;
    // Configure columns
    series.columns.template.width = am4core.percent(60);
    //series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
    
    // Add label
    var labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;

    /*labelBullet.events.on("doublehit", (ev)=> {
      const div = $(".taskList");
      div.empty();
      const ShowWorkItemsType = new Map();
      this.Graph.series.values.forEach(function (value, index,array){
        ShowWorkItemsType.set(value.id, !value._isHidden);
      });
      for (var key in this.Graph.dataTasks) {
        if (this.Graph.dataTasks[key].value === parseInt(ev.target.dataItem.categoryX) && ShowWorkItemsType.get('id'+this.Graph.dataTasks[key].typeTask)){
          let span = document.createElement("a");
          span.className = "rowWithTask";
          span.innerText = key;
          const workItem = new WorkItem();
          workItem.Id = key;

          span.addEventListener("click",()=>{
            $(".rowWithTask").removeClass("activeRow");
            workItem.StartModalWindow();
            span.classList.add("activeRow");
          });
          div.append(span);
        }
      }
      $("#KanbanMore").show("slow");
    }); */

    return series;
  }
  
  NewSeries(deskTypesWorkItem) {


    while (this.Graph.series.length > 0) {
      this.Graph.series.removeIndex(0).dispose();
    }
      
    deskTypesWorkItem.forEach((element) => {
      this.createSeries("type"+element.Id,rgba2hex(element.Color), element.Name);  
    });
   
  }

  createRange(name,start,end){
    const range = this.dateAxis.axisRanges.create();
    range.category = start;
    range.endCategory = end;
    range.axisFill.fillOpacity = 0.2;
    range.label.location = 0.1;
    range.label.text = name;
    range.label.inside = true;
    range.label.rotation = 90;
    range.label.valign = "top";
    range.label.horizontalCenter = "left";
    
  }

  showExperements(){
   /* while (this.dateAxis.axisRanges.length > 0) {
      this.dateAxis.axisRanges.removeIndex(0).dispose();
    }*/
    this.dateAxis.axisRanges.clear();
    window.KanbanDesk.Experements.forEach(element =>{
      if (  element.End > new Date( $("#DateStartTPC").val() )  ) {

        let start = element.Start;
        if (new Date($("#DateStartTPC").val()) > start){
          start = new Date($("#DateStartTPC").val());
        }

        let end = element.End;
        if (new Date($("#DateEndTPC").val()) < end){
          end = new Date($("#DateEndTPC").val());
        }

        this.createRange(element.Name,this.TransformDateToCategory(start,$("#TypeperiodTPC option:selected").val()),this.TransformDateToCategory(end,$("#TypeperiodTPC option:selected").val()));
        
      }
      this.Graph.reinit();
    });
  }

  TransformDateToCategory(date,period){
    let value;
    
    switch (period) {
      case "1":{
        let onejan = new Date(date.getFullYear(), 0, 1);
        let week;
        week = Math.ceil( (((date - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
        if (week < 10 ){
          week = "0"+week;
        }
        value = date.getFullYear() + "/" + week
      }
      break;

      case "2":{
        let month;
        if ((date.getMonth()+1) < 10 ){
          month = "0"+(date.getMonth()+1);
        }else{
          month = date.getMonth()+1;
        }
        value = date.getFullYear() + "/" + month
      }
      break;

      case "3":{
        let quarter
        if ((date.getMonth()+1) % 3  == 0 ) {
          quarter = (date.getMonth()+1) / 3;
        }else{
          quarter =Math.trunc((date.getMonth()+1) % 3)+1;
        }
        value = date.getFullYear() + "/" + quarter
      }
      break;

      default:{
        let month,day;

        if ((date.getMonth()+1) < 10 ){
          month = "0"+(date.getMonth()+1);
        }else{
          month = date.getMonth()+1;
        }

        if ( date.getDate()  < 10 ){
          day = "0"+date.getDate();
        }else{
          day = date.getDate();
        }

        value = date.getFullYear() + "/" + month + "/" + day
      }
      break;
    }

    // неделя
    return value
  }
}