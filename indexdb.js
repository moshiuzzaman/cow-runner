
  // IndexedDB
  var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
      IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
      dbVersion = 1.0;

  // Create/open database
  var request = indexedDB.open("elephantFiles", dbVersion);
  var db;
  var createObjectStore = function (dataBase) {
    dataBase.createObjectStore("elephants");
  };
var filePath=[[],[]];
var getFile = function (path,file_name,key) {
    // Create XHR
    var xhr = new XMLHttpRequest();
    var blob;
    xhr.open("GET", path, true);
    // Set the responseType to blob
    xhr.responseType = "blob";

    xhr.addEventListener("load", function () {
        if (xhr.status === 200)
        {
            blob = xhr.response;
            putElephantInDb(blob,file_name,key);

        }
    }, false);
    // Send XHR
    xhr.send();
};
var LoadFiles=()=>
{  
    var root=["./@mediapipe/face_mesh/","./@mediapipe/selfie_segmentation/"];
    var files=[["face_mesh_solution_packed_assets_loader.js","face_mesh_solution_simd_wasm_bin.js","face_mesh.binarypb","face_mesh_solution_packed_assets.data","face_mesh_solution_simd_wasm_bin.wasm"],["selfie_segmentation.tflite","selfie_segmentation_landscape.tflite","selfie_segmentation_solution_simd_wasm_bin.js","selfie_segmentation.binarypb","selfie_segmentation_solution_simd_wasm_bin.wasm"]];
    for(var i=0;i<root.length;i++){
        for(var j=0;j<files[i].length;j++)
        {
                getFile(root[i]+files[i][j],files[i][j],i+","+j);
        }
    }
    
   
}
var putElephantInDb = function (blob,file_name,key) {
    
      var transaction = db.transaction('elephants','readwrite');
      var store = transaction.objectStore('elephants');

      // Put the blob into the dabase
      var put = store.put(blob,key);

      // Retrieve the file that was just stored
      store.get(key).onsuccess = function (event) {
          var imgFile = event.target.result;
        
          var URL = window.URL || window.webkitURL;

          // Create and revoke ObjectURL
          var imgURL = URL.createObjectURL(imgFile);

          var indexes=key.split(",");
          console.log("file Name:",file_name,"File:",imgURL);
          filePath[indexes[0]][file_name]=imgURL;

          var dlLink = document.createElement('a')
          dlLink.download =file_name;
          dlLink.href =imgURL
          dlLink.dataset.downloadurl = ['', dlLink.download, dlLink.href].join(
            ':'
          )
          document.body.appendChild(dlLink)
          //dlLink.click()
          document.body.removeChild(dlLink)


          var script = document.createElement("script");
          //script.src = imgURL+".js";
          //document.body.appendChild(script);

          // Set img src to ObjectURL
          // var imgobj = new Image();
          // imgobj.onload =()=>{
          //   console.log("image loaded");
          // };
          // imgobj.src = imgURL;
          // console.log(imgobj);
          // document.body.appendChild(imgobj);
         
          
          // Revoking ObjectURL
          //URL.revokeObjectURL(script);
      };
  };

  request.onerror = function (event) {
      console.log("Error creating/accessing IndexedDB database");
  };

  request.onsuccess = function (event) {
      console.log("Success creating/accessing IndexedDB database");
      db = request.result;

      db.onerror = function (event) {
          console.log("Error creating/accessing IndexedDB database");
      };
      
      // Interim solution for Google Chrome to create an objectStore. Will be deprecated
      if (db.setVersion) {
          if (db.version != dbVersion) {
              var setVersion = db.setVersion(dbVersion);
              setVersion.onsuccess = function () {
                  createObjectStore(db);
                  LoadFiles();
              };
          }
          else {
            LoadFiles();
          }
      }
      else {
        LoadFiles();
      }
  }

  
  // For future use. Currently only in latest Firefox versions
  request.onupgradeneeded = function (event) {
      createObjectStore(event.target.result);
  };
