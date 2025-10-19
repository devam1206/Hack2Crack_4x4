import axios from 'axios';
axios.get('http://localhost:8000/soil-data', {
    params: {
        nitrogen: 10,
        phosphorus: 5,
        potassium: 8,
        magnesium: 3,
        calcium: 7,
        manganese: 2,
        iron: 4,
        copper: 1
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error('Error fetching soil data:', error);
});