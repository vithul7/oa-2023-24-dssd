import axios from 'axios';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const token = process.env.TOKEN;
const owner = 'SimplifyJobs';
const repo = 'Summer2024-Internships';
const perPage = 100;
const app = express();
let earliestDate = 0;

app.use(
    cors({
        origin: 'http://localhost:5500',
    })
);

const headers = {
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
};

app.get("/", (req, res) => {
    let currInterval = 0;
    let count = 0;
    const fetchData = (page, xData, yData, earliestDate) => {
        const url = `https://api.github.com/repos/${owner}/${repo}/forks?per_page=${perPage}&page=${page}`;
        axios.get(url, { headers })
            .then((response) => {
                if (page == 0) {
                    // send graph data to frontend once all pages are exhausted
                    const graphData = {
                        x: xData,
                        y: yData,
                    };

                    res.status(200).send(graphData);
                } else {
                    let hoursFromEarliest;
                    
                    ({ hoursFromEarliest, earliestDate } = convertDatesIntoHours(response, earliestDate));

                    ({currInterval, count} = createGraphData(hoursFromEarliest, xData, yData, currInterval, count));
                    // fetch the previous page using recursion
                    fetchData(page - 1, xData, yData, earliestDate);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const xData = [];
    const yData = [];
    // fetchData is recursively implemented so that the earliest date can be set from the last page of the
    // data, as the data is organized from most recent date to earliest date in the response
    axios.get(`https://api.github.com/repos/${owner}/${repo}?per_page=${perPage}&page=1`, { headers })
        .then((response) => {
            // getting the last page from the amount of forks using our perPage parameter
            const lastPage = Math.ceil(response.data.forks_count / perPage);
            fetchData(lastPage, xData, yData, 0);
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error here if needed
        });
});




const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function convertDatesIntoHours(response, earliestDate) {
    const dates = [];
    response.data.forEach(function (element) {
        dates.push(element.created_at);
    });

    const dateObjects = dates.map((dateTimeString) => new Date(dateTimeString));

    if (earliestDate == 0 && dates.length > 0) {
        // if earliest date hasn't been set (on last page), set it
        earliestDate = Math.min(...dateObjects);
    }

    // maps hours from first fork
    const hoursFromEarliest = dateObjects.map((dateObject) => {
        const timeDifference = dateObject - earliestDate;
        const hours = timeDifference / (1000 * 60 * 60 * 24 * 7);
        return Math.floor(hours);
    });
    
    return { hoursFromEarliest, earliestDate };
}

function createGraphData(hoursFromEarliest, xData, yData, currInterval, count) {
    // cut up current data into intervals so we don't plot too many data points
    const interval = Math.floor(hoursFromEarliest[0] / 6);
    let index = hoursFromEarliest.length;
    index -= 1;
    while (index >= 0) {
        xData.push(currInterval);
        while (hoursFromEarliest[index] <= currInterval && index >= 0) {
            index -= 1;
            // tracking running count for
            count += 1
        }
        yData.push(count);
        currInterval += interval;
    }

    return { currInterval, count };
}


