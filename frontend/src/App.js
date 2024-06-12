import logo from './logo.svg';
import './App.css';
import LChart from './charts/LChart';
import Grid from './charts/Grid';
import { useState, useEffect } from 'react';
import { ReactComponent as SwapArrows} from './arrow-swap.svg';

function App() {

  const [from,setFrom] = useState("USD")
  const [to,setTo] = useState("CAD")
  const [sentData, setSentData] = useState([])
  const [data, setData] = useState();
  const [storage,setStorage] = useState();
  const [currencies,setCurrencies] = useState();
  const [dateFilter,setDateFilter] = useState();
  const monthFilters = [3,6,12,24]

  //Retrieve data from the API.
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://akrizwork.pythonanywhere.com/frankfurter');
      const jsonData = await response.json();
      //set the "Data" variable with the returned data.
      setData(jsonData);
      //set the "Currencies" variable with the master list of currencies, retrieved from the API.
      //This allows the rest of the application to be automatically scalable, based on retrieved data.
      setCurrencies(jsonData.master_currency_list.map(function(x){ return x.toUpperCase(); }))
    }
    fetchData().catch(console.error);;
  }, []);
  
  //Render the data displays after data is loaded, and whenever the "from", "to", "data", or "dateFilter" fields are changed.
  //I chose to run it on all state updates to make sure all the charts feel reactive and snappy to user input.
  useEffect(() => {
    if(data){generateData()}
  }, [data,from,to,dateFilter]); // eslint-disable-line react-hooks/exhaustive-deps

//Check for saved data on page load. if it exists, set the data. otherwise set default options.
useEffect(() => {
  const items = JSON.parse(localStorage.getItem('storage'));
  if (items) {
    setFrom(items.from)
    setTo(items.to)
    generateDateFilter(items.date)
    setStorage(items);
  }else{
    setStorage({'from':'USD','to':'CAD','date':24})
  }
  }, []);

//save the "storage" variable to local storage under the name "storage"
  useEffect(() => {
    if(storage){
      localStorage.setItem('storage', JSON.stringify(storage));
    }
  }, [storage]);


  // Handling the "From" and "To" fields from the selectors. Also commiting the selections to local storage
  //from handler
  const handleFrom = (e) => {
    setFrom(e.target.id);
    setStorage({'from':e.target.id,'to':storage.to,'date':storage.date})
  }
  //to handler
  const handleTo = (e) => {
    setTo(e.target.id);
    setStorage({'from':storage.from,'to':e.target.id,'date':storage.date})
  }
  //Swap currencies around
  const swapCurrencies = (e) =>{
    const x = from
    const y = to
    setFrom(y)
    setTo(x)
    setStorage({'from':y,'to':x,'date':storage.date})
  }
  //Pass click data from the date selectors to the function that creates the date filters.
  //In the future, creating a sliding scale similar to how "Ant Charts" works would be ideal here, 
  //and would just involve sending two fields to the function, instead of one.
  //https://ant-design-charts.antgroup.com/en/examples/statistics/column/#slider
  const handleDateFilter =(e) =>{
    generateDateFilter(e.target.id)
  }
  //Function to generate the dates used for filtering. Also saving the date to the "storage" variable in local storage.
  //Changing this to work with a top/bottom range, instead of just a bottom range would be a quick enough change.
  //A better date-checking method could be made with Moment.js, but was not included in the specified stack.
  function generateDateFilter(a){
    var d = new Date();
    d.setMonth(d.getMonth() - a);
    setDateFilter(d)
    console.log(d)
    setStorage({'from':from,'to':to,'date':a})
  }
  
  //function to recieve and parse data recieved from the API in a useable way for the charts
  function generateData(){
    console.log(dateFilter);
    var formattedData = {currencies:[from,to],values:[],dates:[]}
    //fill the "formattedData" variable created aboce with the info recieved from the API.
    //It combines the "from" and "to" variables into the corresponding name in the API's returned data, and filters dates that are out of range.
    Object.keys(data.rates).forEach(function(r) {
      var date = new Date(r)
      if(date > dateFilter){
      formattedData.values.push(data.rates[r][from+"-"+to])
      formattedData.dates.push(r)
    }
    })
    setSentData(formattedData)
  }
  if(!data){
    return(<div>Loading</div>)
  }else{
  return (
    <div className="md:h-screen md:min-h-[1000px] min-h-[1200px] h-dvh bg-gray-950 text-amber-50">
      <div className="container h-full py-5 md:py-20 mx-auto min-h-[800px]">
        <div className="flex flex-col w-full h-full px-4 rounded-md bg-zinc-900">
          {/* Custom dropdown for selecting the currencies for purely cosmetic reasons. Normally I'd use Headless, but I wanted to keep it within the specified stack.*/}
          <div className='grid flex-grow grid-cols-5 py-4 mx-4 md:grid-cols-11'>
            <div className="col-span-5">
              <label className="md:font-medium text-amber-50">From:</label>
              <div className="relative group">
              <button className="py-2.5 px-3 w-full md:text-sm text-site bg-transparent border border-dimmed focus:border-b-0 border-amber-900 focus:border-brand focus:outline-none focus:ring-0 peer flex items-center justify-between rounded focus:rounded-b-none font-semibold hover:bg-zinc-950/50 hover:shadow-[0_0px_24px_6px_rgba(9,9,11,0.3)] focus:bg-zinc-950">{from}</button>
              {/* Generating the dropdown list of available currencies, built from the "Currencies" variable, created from returned data in the API */}
              <div
                className="absolute z-[99] top-[100%] left-[50%] translate-x-[-50%] rounded-md rounded-t-none overflow-hidden shadow-lg w-full peer-focus:visible peer-focus:opacity-100 opacity-0 invisible duration-200 p-1 bg-zinc-950 text-amber-600 border-amber-900 border border-dimmed border-t-0 text-xs md:text-sm">
                {currencies.map((cur, i) =>(
                 ![from, to,].includes(cur) ? 
                  <div key={i}
                  className="block w-full px-3 py-2 rounded-md cursor-pointer hover:bg-amber-300 hover:text-amber-900 hover:text-link hover:shadow-[0_0px_24px_6px_rgba(252,211,77,0.3)]" id={cur} onClick={handleFrom}>
                    {cur}
                  </div>
                : 
                <div key={i}
                className="block w-full px-3 py-2 rounded-md cursor-pointer text-zinc-400 hover:text-link">
                    {cur}
                  </div>
                ))}
              </div>
              </div>
            </div>
            
            <div className='col-span-5 text-center md:col-span-1'>
            <label className="invisible md:font-medium text-amber-50 md:visible">Swap</label>
              <button className="mx-auto w-2/4 max-w-[40px] rounded-full bg-amber-900 flex flex-row justify-center items-center hover:shadow-[0_0px_26px_3px_rgba(252,211,77,0.3)]" onClick={swapCurrencies}>
                <SwapArrows className='w-full'/>
              </button>
            </div>
            <div className='col-span-5'>
              <label className=" md:font-medium text-amber-50">To:</label>
              <div className="relative w-full group">
              <button className="py-2.5 px-3 w-full md:text-sm text-site bg-transparent border border-dimmed focus:border-b-0 border-amber-900 focus:border-brand focus:outline-none focus:ring-0 peer flex items-center justify-between rounded focus:rounded-b-none font-semibold hover:bg-zinc-950/50 hover:shadow-[0_0px_24px_6px_rgba(9,9,11,0.3)] focus:bg-zinc-950">{to}</button>
              <div
                className="absolute z-[99] top-[100%] left-[50%] translate-x-[-50%] rounded-md rounded-t-none overflow-hidden shadow-lg w-full peer-focus:visible peer-focus:opacity-100 opacity-0 invisible duration-200 p-1 bg-zinc-950 text-amber-600 border-amber-900 border border-dimmed border-t-0 text-xs md:text-sm">
                {currencies.map((cur, i) =>(
                 ![from, to,].includes(cur) ? 
                  <div key={i}
                  className="block w-full px-3 py-2 rounded-md cursor-pointer hover:bg-amber-300 hover:text-amber-900 hover:text-link hover:shadow-[0_0px_24px_6px_rgba(252,211,77,0.3)]" id={cur} onClick={handleTo}>
                    {cur}
                  </div>
                : 
                <div key={i}
                className="block w-full px-3 py-2 rounded-md cursor-pointer text-zinc-400 hover:text-link">
                    {cur}
                  </div>
                ))}
              </div>
            </div>
            </div>
            
          </div>
          <ul className="grid w-full max-w-screen-sm grid-cols-4 gap-6 mx-auto">
          {dateFilter ? monthFilters.map((m, i) =>(
            <li>
              <input type="radio" id={m} name="month_range" value={m} className="hidden peer" defaultChecked={parseInt(storage.date) === m ? true : false} onChange={handleDateFilter}/>
              <label for={m} className="block text-center w-full p-2.5 hover:bg-amber-300/60 border border-amber-900 rounded-md cursor-pointer peer-checked:bg-amber-300 peer-checked:text-zinc-900 hover:shadow-[0_0px_24px_6px_rgba(252,211,77,0.3)]">                           
                  <div className="flex items-baseline justify-center">
                      <div className="font-semibold text-md">{m}</div>
                      <div className="inline-block text-sm font-semibold align-text-bottom">&nbsp;Months</div>
                  </div>
              </label>
            </li>
          )) : <div>Loading</div>}
        </ul>
          <div className="container h-full py-4 mx-auto">
            {sentData === 0 ? <div></div> : 
            <div className='flex flex-col h-full mx-auto '>
              <div className='w-full py-4 px-2.5 rounded-md shadow-lg' style={{ position: "relative",}}>
                <LChart data={sentData}/>
              </div>
              <div className='flex-grow w-full h-full py-4'>
                <Grid data={sentData}/>
              </div>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
  }
}

export default App;
