export default async function makeRequest(){
  var url = makeUrl()
  var data = await fetchData(url)
  return data
}

function makeUrl (){
  var date = new Date();
  var startTime = new Date(date.getTime() - (27 * 60 * 1000));

  var startDate = {
    year: startTime.getFullYear(),
    month : (startTime.getMonth() + 1).toString().padStart(2, '0'),
    day : startTime.getDate().toString().padStart(2, '0'),
    hours : startTime.getHours().toString().padStart(2, '0'),
    minutes : startTime.getMinutes().toString().padStart(2, '0'),
  }

  var endTime = new Date(date.getTime() - (26 * 60 * 1000));
  var endDate = {
    year: endTime.getFullYear(),
    month : (endTime.getMonth() + 1).toString().padStart(2, '0'),
    day : endTime.getDate().toString().padStart(2, '0'),
    hours : endTime.getHours().toString().padStart(2, '0'),
    minutes : endTime.getMinutes().toString().padStart(2, '0'),
  }

  var url = `https://api-baltic.transparency-dashboard.eu/api/v1/export?id=current_balancing_state&start_date=${startDate.year}-${startDate.month}-${startDate.day}T${startDate.hours}%3A${startDate.minutes}&end_date=${endDate.year}-${endDate.month}-${endDate.day}T${endDate.hours}%3A${endDate.minutes}&output_time_zone=EET&output_format=json&json_header_groups=1&download=0`
  console.log(url)
  return url
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.data && data.data.timeseries && data.data.timeseries.length > 0 && data.data.timeseries[0].values && data.data.timeseries[0].values.length > 0) {

      return data.data.timeseries[0].values[0];
    } else {

      console.log('The expected value is undefined.');
      return null; 
    }
    
  } catch(error) {
    console.error('Fetching data failed:', error);
    return null
  }
}


makeRequest().then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error:', error);
});