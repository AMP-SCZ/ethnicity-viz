// init global variables & switches
let barVis, pieVis;


let sharedGreen = '#28794C';
let sharedBlue = '#333577';
let sharedYellow = '#FFC900';
let sharedRed = '#AE0000';
let sharedGrey = '#D3D3D3';
let sharedLightBlue = '#6150D8';

let races=["White", "Black", "Hispanic", "Asian"];
let pieColors= {"White":sharedBlue, "Black":sharedGreen, "Hispanic":sharedYellow, "Asian":sharedRed};

// load data using promises
let promises = [d3.csv('data/enroll_data.csv'), d3.csv('data/expected_data.csv')];

Promise.all(promises)
    .then(function (dataArray) {
        
        // date pareser
        let parseDate = d3.timeParse("%Y-%m-%d");        
        
        dataArray.forEach(data=> {
            data.forEach(function(d){
                // Convert string to 'date object'
                d.date = parseDate(d.date).getTime();
                
            });
        });
        
        initMainPage(dataArray);
    })
    .catch(function (err) {
        console.log(err);
    });

    
    
// initMainPage
function initMainPage(dataArray) {
    
    // let enrollCount, totalEnroll, enrollCount1, totalEnroll1
    
    // init bar chart
    barVis = new BarVis('bar-chart', dataArray[0], dataArray[1]);
    
    // init pie chart
    pieVis = new PieVis('pie-chart', dataArray[0]);

}

function _wrangleData() {
    
/*     enrollCount, totalEnroll= count(dataArray[0])
    enrollCount1, totalEnroll1= count(dataArray[1]) */
    
    barVis.wrangleData()
    pieVis.wrangleData()
    
}

