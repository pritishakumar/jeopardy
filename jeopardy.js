// import { sampleSize } from 'lodash';
// import axios from 'axios';

const BASE_URL = "http://jservice.io/api/"
const NUM_CATEGORIES = 6


// _.sampleSize(collection, [n=1])
// _.shuffle(collection)
// jservice.io/api/categories?count=100
// jservice.io/api/category?id=11532 

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {

    const resp = await axios.get(`${BASE_URL}categories?count=100`);
    return _.sampleSize(resp.data, NUM_CATEGORIES);

}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const resp = await axios.get(`${BASE_URL}category?id=${catId}`)
    const title = resp.data.title;
    const clues = resp.data.clues.map(each => {
        const { question, answer } = each;
        return ({ question, answer, showing: null})
    });

    return ({ title, clues })
}

/** Creates rows for table body with proper id (C{category index}-Q{question index})
 * Returns the body text, which needs to be inserted into the game table body
 */

function rowsBuilder(){
    let tbody = ""

    for (let row = 0; row < 5; row++){
        let trow = "<tr>"
        let catNum = 0

        for (let each in categories){
            trow += `<td class="Q-tile" id="C${catNum}-Q${row}">?</td>`
            catNum++;
        }
        trow += "</tr>"
        tbody += trow;
    }
    return tbody;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    let thead = "";

    for (let each of categories){
        thead += `<th class="header-tile"> ${each.title}</th>`
    };

    $("#categories").empty()
        .html(thead);

    let tbody = rowsBuilder();

    $("tbody").empty()
        .html(tbody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    $tile = $(evt.target)
    const cat = $tile[0].id[1];
    const quest = $tile[0].id[4];

    const fullObj = categories[cat].clues[quest];
    
    if(fullObj.showing == null){
        $tile.empty()
            .text(fullObj.question);
            categories[cat].clues[quest].showing = "question"
    } else if( fullObj.showing == "question"){
        $tile.empty()
            .text(fullObj.answer);
            categories[cat].clues[quest].showing = "answer"
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#loader").toggleClass("hidden")
    $("button").text("Loading")
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#loader").toggleClass("hidden")
    $("button").text("Start New Game")
    $("tbody").on("click", "button", setupAndStart);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    categories = [];
    showLoadingView();
    const catIds = await getCategoryIds()
    for (let each of catIds){
        let cat = await getCategory(each.id);
        categories.push(cat);
    }
    // categories = Promise.all(catIds.map(each => {
    //     const cat = await getCategory(each.id);
    //     return cat
    // }))
    fillTable();
    hideLoadingView();
    

}



/** On click of start / restart button, set up game. */
setupAndStart()

/** On page load, add event handler for clicking clues */
$("tbody").on("click", "td", handleClick);

/** Event listener on Start button to regenerate new gameboard */
$("#header").on("click", "#game-but", setupAndStart);

