import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useState, useCallback, useRef, useEffect} from 'react';
import '../ag-custom.css';
import colors from "tailwindcss/colors";
import { GridApi } from 'ag-grid-community';



const Grid = (sentData) => {
  const apiData = sentData['data']
  const gridRef = useRef(null);

  //Check if a save exists in local storage for the chart sorting. 
  //returns to onGridReady for the purposes of loading the saved sorting
  function loadSave(){
    const grid = JSON.parse(localStorage.getItem('grid'));
    if (grid) {
      return(grid)
    }
    return
  }
  
  //Runs every time the grid gets changed. Saves the state of the grid into local storage.
  const saveState = useCallback(() => {
    localStorage.setItem('grid', JSON.stringify(gridRef.current.api.getColumnState()));
    console.log(gridRef.current.api.getColumnState());
  }, []);

  //When the table loads, runs this to check for, and apply grid sorting settings from local storage.
  const onGridReady = useCallback(() => {
    const checkSave = loadSave()
    if (!checkSave) {
      console.log("no columns state to restore by, you must save state first");
      return;
    }
    gridRef.current.api.applyColumnState({
      state: checkSave,
      applyOrder: true,
    });
    console.log("column state restored");
  }, [])

  //simple "loading" div to display while waiting for data to get passed from app.js
  if (apiData.length === 0){
    return(<div>Loading...</div>)
  }else{
  
  // defining the columns. changing the default sort behavior on all of them to be desc first. Defaults the "Date" field to be sorted desc.
  const colDefs=[
    { field: "Date", sortingOrder:['desc','asc','null'],},
    { field: "Value", sortingOrder:['desc','asc','null'],},
    { field: "Change",
    headerName: 'Change',
    comparator: myComparator,
    sortingOrder:['desc','asc','null'],
    //color positive changes green, and negative changes red.
    cellStyle: params => {
      if (parseFloat(params.value) >= 0) {
          return {backgroundColor: "rgba(34,197,94,"+parseFloat(params.value)/10+")"};
      }
      return {backgroundColor: "rgba(239, 68, 68,"+Math.abs(parseFloat(params.value)/10)+")"};
  },
  }
  ];
  //Sort the changed rows properly. default interaction sorts the positive and negative numbers seperatley.
  function myComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    return parseFloat(valueA) - parseFloat(valueB);
  }

  // create the row data constant
  const rowData=[];
  //parse through the returned API data, and fill the rowData const, as well as create/format the changed percentages.
 for (let index = 0; index < apiData.dates.length; index++) {
  if(index === 0){
    rowData.push({Date:apiData.dates[index],Value:apiData.values[index],Change:"N/A"})
  }else{
    var change = ((apiData.values[index]-apiData.values[index-1]) * 100).toFixed(2) + '%'
    if (parseFloat(change) >= 0){change = "+"+change}
    rowData.push({Date:apiData.dates[index],Value:apiData.values[index],Change:(change)})
  }
 }
 
  return (
    // wrapping container with theme & size
    <div className='h-full'>
      <label>{apiData.currencies[0]+" To "+apiData.currencies[1]} breakdown</label>
      <div className="w-full h-full ag-theme-custom">
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            autoSizeStrategy={{type: 'fitGridWidth',defaultMinWidth: 100,}}
            ref={gridRef}
            onGridReady={onGridReady}
            onStateUpdated={saveState}
        />
      </div>
    </div>
  )
 }
}

export default Grid;
