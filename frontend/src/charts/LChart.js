import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'; 
import { Line } from 'react-chartjs-2';
import { useState, useCallback } from 'react';
import colors from "tailwindcss/colors";
import { Context } from 'ag-grid-community';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler);

//Not too much to comment on this page. It just consumes the filtered data 
//from app.js, and displays it with (generally) default settings.

//Setting options for the chart. I wanted to keep the apperance slightly minimal to fit the rest of the page's theme.
const options = {
  responsive: true,
  tension: 0.3,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display:false,
      position: 'bottom',
      labels:{color:'#fdf2f9'},
    },
    title: {
      display: false,
      text: 'Line Chart',
      color:'#fdf2f9',
    },
  },
  scales: {
    y:
      {
        ticks:{
            color:'#fdf2f9',
            fontSize: 14
        },
      },
    x:
    {
      ticks:{
          color:'#fdf2f9',
          fontSize: 14,
          autoSkip: true,
          maxTicksLimit: 15
      }
    },
  },
};


function LChart(sentData) {
  const apiData = sentData['data']
  const [gradient, setGradient] = useState();

  //Getting the line chart on render, and creating a gradient from the context 2d on the Canvas element.
  const chartRef = useCallback(node => {
    if (node !== null) {
      const ctx = node.ctx
      var grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(217,119,6,1)');   
      grad.addColorStop(1, 'rgba(217,119,6,0)');
      setGradient(grad)
    }
  }, []);

  //simple "loading" div to display while waiting for data to get passed from app.js
  if (apiData.length === 0){
    return(<div>Loading...</div>)
  }else{

  const labels = apiData.dates
  

  // const canvas = document.getElementById('canvas') 
  // const ctx = canvas.getContext('2d')
  // var gradient = ctx.createLinearGradient(0, 0, 0, 400);
  // gradient.addColorStop(0, 'rgba(250,174,50,1)');   
  // gradient.addColorStop(1, 'rgba(250,174,50,0)');

  const data = {
    labels,
    datasets: [
      {
        label: apiData.currencies[0]+" To "+apiData.currencies[1],
        data: apiData.values,
        borderColor: colors.amber[600],
        backgroundColor: gradient,
        color: colors.amber[600],
        fill: "start"
      },
    ]
  }

  
  return (
    <Line ref={chartRef} options={options} data={data} height={300}/>
  );
  }
}

export default LChart;
