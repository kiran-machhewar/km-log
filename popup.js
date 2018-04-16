"use strict";
var sflog = {};
sflog.startDebugger = function(){
   console.log('Debugger is started'); 
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getSessionId"}, function(response) {      
      if(response.sessionId){
        sflog.domain = response.domain;
        sflog.makeAPICalls(response.sessionId);
      }
    });
  });  
}

sflog.sendMessage = function(message){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id,message, function(response) {      
           console.log('Recevied respone',response);
        });
    }); 
}
sflog.makeAPICalls = function( sessionId){
  console.log('Session id in popup.js is -->'+sessionId);
 
  var xhr = new XMLHttpRequest();
  xhr.open("GET", sflog.domain+encodeURI("/services/data/v41.0/tooling/query?q=Select+Id+FroM+ApexLog+WHERE+LogUser.Name+like'%"+sflog.userName+"%'+Order+By+StartTime+DESC+LIMIT+20"), true);
  xhr.setRequestHeader('Authorization','Bearer '+sessionId);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.onreadystatechange = function() {

    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      console.log(resp);

      if(resp.records.length){
        sflog.searchInLogs(resp.records,sessionId,0);
      }
      
    }
  }
  xhr.send();

}

sflog.searchInLogs = function(logs,sessionId,index){  
    var xhr = new XMLHttpRequest();
    xhr.open("GET", sflog.domain+logs[index].attributes.url+'/Body', true);
    xhr.setRequestHeader('Authorization','Bearer '+sessionId);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        // JSON.parse does not evaluate the attacker's scripts.
        console.log('Got the body of log-->'+index);
        let logsDiv = document.getElementById('logs');
        if(index == 0){
            logsDiv.innerHTML = '';
        }
        debugger;
        let found= xhr.responseText.search(new RegExp(sflog.searchKey, "i"));
        if(found > -1){

            sflog.showLogLinkToUser(logs[index].attributes.url.split('ApexLog/')[1]);
        }
        if(index < logs.length){
            sflog.searchInLogs(logs,sessionId,++index);
        }else{
            
            console.log('Log searching is complete');
        }        
      }
    }
    xhr.send();
}

let searchButton = document.getElementById('search');
// onClick's logic below:
searchButton.onclick = function() {  
    let logsDiv = document.getElementById('logs');
    let searchKeyword = document.getElementById('searchKeyword');
    let userNameInput = document.getElementById('userName');
    
    if(!searchKeyword.value){
        logsDiv.innerHTML = 'Please enter the search keyword';  
        return false;
    }
    if(! userNameInput.value){
        logsDiv.innerHTML = 'Please enter the user name';  
        return false;
    }
    sflog.userName = userNameInput.value;
    logsDiv.innerHTML = 'Search started...';  
    sflog.searchKey = searchKeyword.value;
    sflog.startDebugger();   
    return false; 
};

sflog.showLogLinkToUser = function(logId){


    let debugURL = sflog.domain+'/p/setup/layout/ApexDebugLogDetailEdit/d?apex_log_id='+logId;
    let logsDiv = document.getElementById("logs");
    debugger;
    //code to open the latest found debug log
    sflog.sendMessage({
            'action':'OPEN_LINK',
            'url':debugURL
    });

    

    let aTag = document.createElement('a');
    aTag.setAttribute('href',debugURL);
    aTag.innerHTML = ""+logId;
    aTag.debugURL = debugURL;
    aTag.onclick = function(){
        sflog.sendMessage({
            'action':'OPEN_LINK',
            'url':this.debugURL
        });
        return false;
    }
    logsDiv.appendChild(aTag);
    logsDiv.appendChild(document.createElement('br'));
}





