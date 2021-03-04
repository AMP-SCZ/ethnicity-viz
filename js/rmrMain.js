let selectedPrefixes, selectedFiles

// let total, totalHisp, totalMinor

function populateSites() {
    
    let network= $('#network-name').val()
    $('#site-name').empty();
    $('#site-name').append(new Option('All', 'All', true))
    
    if (network==="All") {
        combinedSites= [networkSite['ProNET'], networkSite['PRESCIENT']].flat()
        combinedSites.sort((a,b)=> a>b?1:-1)
        combinedSites.forEach(s=> $('#site-name').append(new Option(s, s)))
        
    }
    else {
        networkSite[network].sort((a,b)=> a>b?1:-1)
        networkSite[network].forEach(s=> $('#site-name').append(new Option(s, s)))
    
    }
    
    
    getPrefixes()
    
}

function getPrefixes() {
    
    let filePrefixes=[]
    
    let network= [$('#network-name').val()]
    if (network[0]==='All') {        
        network=['ProNET','PRESCIENT']
    }
    
    network.forEach(n=> {
        networkSite[n].forEach(s=> filePrefixes.push(`data/${n}/${s}`))
    })
    
    
    selectedPrefixes=[]
    selectedSites= $('#site-name').val().length?$('#site-name').val():['All']
    
    // one or more network + few sites
    if (selectedSites[0]!=='All') {
        selectedSites.forEach(s=> {
            filePrefixes.forEach(f=> {
                if (f.includes(s)) {
                    selectedPrefixes.push(f)
                }
            })
        })
    }
    // one or more network + all sites
    else {
        selectedPrefixes= filePrefixes
    }    
    
    selectedFiles= selectedPrefixes.map(file=>
        [d3.csv(file+'_metadata.csv'), d3.csv(file+'_plan.csv')])
    
    // console.log(selectedPrefixes)
    
    
}

populateSites()

Promise.all(selectedFiles.flat()).then(obj=> {
    let dataArray=[]
    
    selectedPrefixes.forEach((p,i)=> {
        dataArray.push({
            prefix:p,
            metaData:obj[2*i],
            planData:obj[2*i+1]
        })
    })
    
    initMainPage(dataArray)
    
})


let rmrVis
function initMainPage(dataArray) {
    
    // console.log(dataArray)
    
    // init tabular report
    rmrVis = new RmrVis(dataArray)
    
}


function networkChange() {
    populateSites()
    rmrVis && rmrVis.wrangleData()
}

function siteChange() {
    getPrefixes()
    rmrVis && rmrVis.wrangleData()
}

function cohortChange() {
    rmrVis && rmrVis.updateVis()
}

/*
// ENH can we do the above block using jQuery bind/trigger?

$(document).ready(function() {
    $('#network-name').change(populateSites)
})

$(document).ready(function() {
    $('#site-name').change(getPrefixes)
})
*/


/* * * * * * * * * * * * * *
*         Carousel         *
* * * * * * * * * * * * * */

// define carousel behaviour
let carousel = $('#tableCarousel');

// prevent rotating
carousel.carousel({
    interval: false
})

// on button click switch view
function switchTableView(){
    carousel.carousel('next')
    $('#switchTable').html($('#switchTable').html().includes('Details')?'Switch to RMR View':'Switch to Details View')
}

