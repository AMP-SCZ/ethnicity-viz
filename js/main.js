// init global variables & switches
let myLineVis, enrollData;


let sharedGreen = '#28794C';
let sharedBlue = '#333577';
let sharedYellow = '#FFC900';
let sharedRed = '#AE0000';
let sharedGrey = '#D3D3D3';
let sharedLightBlue = '#6150D8';

let races=["White", "Black", "Hispanic", "Asian"];

// load data using promises
let promises = [d3.csv('data/enroll_data.csv')];

Promise.all(promises)
    .then(function (data) {
        
        // date pareser
        let parseDate = d3.timeParse("%Y-%m-%d");        
                
		data[0].forEach(function(d){
			// Convert string to 'date object'
			d.date = parseDate(d.date).getTime();
			
		});
        
        initMainPage(data);
    })
    .catch(function (err) {
        console.log(err);
    });

// initMainPage
function initMainPage(dataArray) {

    // init line-graph
    myLineVis = new LineVis('line-graph', dataArray[0]);

}

function _wrangleData() {
    
    myLineVis.wrangleData()
    
}

