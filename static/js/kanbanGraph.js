var Columns = [];
var Kanbans;
var CFD,CTH;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;

window.onload = function() {

    refreshDeskList();
    CFD();

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
            async: false,
            data: JSON.stringify(JSONData),
       }).done(function (cfdJson) {
                CFD.data = cfdJson; 
        });  

        $.ajax({
          type: "POST",
          url: "/KanbanToolGraphAPI/SChart/",
          crossDomain : true,
          async: false,
          data: JSON.stringify(JSONData),
        }).done(function (SpectralChartJSON) {
          CTH.data = SpectralChartJSON.sort(function(obj1, obj2) {
            if (obj1.day < obj2.day) return -1;
            if (obj1.day > obj2.day) return 1;
            return 0;
          });; 
          });
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


function CFD(){
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
        
        CFD = am4core.create("chartdiv", am4charts.XYChart);

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

// Create series
function createSeries(field, name) {
  
  // Set up series
  var series = CTH.series.push(new am4charts.ColumnSeries());
  series.name = name;
  series.dataFields.valueY = field;
  series.dataFields.categoryX = "day";
  series.sequencedInterpolation = true;
  
  // Make it stacked
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

createSeries(0, "Стандартные");
createSeries(1, "НМА");
createSeries(3, "Ошибки");
createSeries(2, "Тех.поддержка");
createSeries(4, "Проекты");

// Legend
CTH.legend = new am4charts.Legend();

})
}