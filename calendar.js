const k = `SEeAJiXUkden6OnXyyaz3b43PIpHKoWl`;

const userCountry = document.getElementById('country-input');
const userYear = document.getElementById('year-input');
const userMonth = document.getElementById('month-input');
const userDay = document.getElementById('day-input');

let today = new Date();
userYear.value = today.getFullYear();

const $cardContainer = $('#card-container');

let cardCount = 0;
let display = false;
let countryList = [];
let holidayList = [];

handleGetCountries();

$('#today-button').on('click', useToday);
$('#reset-button').on('click', clearHolidays);
$('form').on('submit', handleGetHolidays);

function handleGetCountries() {
    $.ajax({
        url: `https://calendarific.com/api/v2/countries?&api_key=${k}`
    }).then(
        (data) => {
            countryList = data.response.countries;
            countryDropdown();
            // Automatically fetch all holidays for Kenya after populating the dropdown
            const kenyaOption = countryList.find(country => country.country_name === 'Kenya');
            if (kenyaOption) {
                userCountry.value = kenyaOption['iso-3166']; // Set the value to Kenya's ISO code
                userYear.value = today.getFullYear(); // Set current year
                handleGetHolidays({ preventDefault: () => {} }); // Call to fetch holidays for the entire year
            }
        },
        (error) => {
            console.log('bad request', error);
        }
    );
}

function countryDropdown() {
    let fragment = document.createDocumentFragment();
    countryList.forEach(country => {
        let opt = document.createElement('option');
        opt.innerHTML = country.country_name;
        opt.value = country['iso-3166'];
        opt.className = 'none';
        fragment.appendChild(opt);
    });
    userCountry.appendChild(fragment);
}

function handleGetHolidays(evt) {
    if (evt) evt.preventDefault();

    // Validate inputs
    if (userCountry.value === 'Please Choose a Country') {
        alert('You must choose a country first!')
        return;
    } else if (!userYear.value) {
        alert('You must choose a year first!')
        return;
    }

    // Fetch holidays for the entire year
    $.ajax({
        url: `https://calendarific.com/api/v2/holidays?&api_key=${k}&country=${userCountry.value}&year=${userYear.value}`
    }).then(
        (data) => {
            holidayList = data.response.holidays;
            if (holidayList === undefined || holidayList.length === 0) {
                let countryName = nameFromIso(userCountry.value);
                alert(`There is no data for ${countryName} during ${userYear.value}. Please input another year.`)
            } else {
                setTimeout(() => {
                    renderHoliday();
                }, 1000);
            }
        },
        (error) => {
            console.log('bad request', error);
        }
    );
}

document.addEventListener('DOMContentLoaded', function () {
    const holidayListElement = document.getElementById('holidayList');

    function fetchHolidays(countryCode) {
        fetch(`https://date.nager.at/Api/v2/PublicHoliday/2023/${countryCode}`)
            .then(response => response.json())
            .then(data => {
                displayHolidays(data);
            })
            .catch(error => console.error('Error fetching holidays:', error));
    }

    function displayHolidays(holidays) {
        holidayListElement.innerHTML = '';
        holidays.forEach(holiday => {
            const listItem = document.createElement('li');
            listItem.className = 'holiday-item';
            listItem.textContent = `${holiday.date} - ${holiday.localName} (${holiday.name})`;
            holidayListElement.appendChild(listItem);
        });
    }

    // Fetch and display holidays for a default country (e.g., US)
    fetchHolidays('US');
});

function renderHoliday() {
    removeCards(); // Clear existing cards before rendering new ones
    holidayList.forEach(holiday => {
        createCard();

        let $cardDate = $(`#card-date-${cardCount}`);
        let $cardType = $(`#card-type-${cardCount}`);
        let $cardName = $(`#card-name-${cardCount}`);
        let $cardDesc = $(`#card-desc-${cardCount}`);

        $cardDate.text(holiday.date.iso.slice(0, 10));
        $cardType.text(holiday.primary_type);
        $cardName.text(holiday.name);
        $cardDesc.text(holiday.description);
    });
    display = true;
}

function createCard() {
    cardCount++;
    let newCard = document.createElement('section');

    newCard.setAttribute('id', `card-${cardCount}`);
    newCard.innerHTML = `<span id='card-date-${cardCount}'></span><br><br><span id='card-type-${cardCount}'></span><h3 id='card-name-${cardCount}'>New Card</h3>
    <p id='card-desc-${cardCount}'>New Desc</p>`;

    $cardContainer.append(newCard);
}

function removeCards() {
    $cardContainer.empty();
    cardCount = 0;
    display = false;
}

function clearHolidays(evt) {
    evt.preventDefault();
    removeCards();
}

function nameFromIso(iso) {
    let countryName = countryList.find(country => country['iso-3166'] === iso);
    return countryName ? countryName.country_name : 'Unknown Country';
}

function useToday(evt) {
    evt.preventDefault();
    userMonth.value = today.getMonth() + 1;
    userDay.value = today.getDate();
    userMonth.classList.remove('first-choice');
}