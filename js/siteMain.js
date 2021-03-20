let selectedPrefixes, selectedFiles

let start_date= "1/11/2019"
let end_date= "2/24/2021"

// Ivory
emptyColor="#EEEDE7"
// Gray
emptyColor="#868B8E"

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
    selectedSites= ['All']
    
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

getPrefixes()

Promise.all(selectedFiles.concat(d3.csv('data/combined_plan.csv')).flat()).then(obj=> {
    let dataArray=[]
        
    selectedPrefixes.forEach((p,i)=> {
        dataArray.push({
            prefix:p,
            metaData:obj[2*i],
            planData:obj[2*i+1]
        })
    })

    dataArray.push(obj[obj.length-1])
    
    initMainPage(dataArray)
    
})


let siteVis
function initMainPage(dataArray) {
    
    // console.log(dataArray)
    
    let L= dataArray.length
    let metaData= dataArray.filter((d,i)=> i<L-1)
    let combinedPlan= dataArray[L-1]
    
    
    // init site summary
    siteVis = new SiteVis('site-bar', metaData, combinedPlan)
    
}


function networkChange() {
    getPrefixes()
    siteVis && siteVis.wrangleData()
}

