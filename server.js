const oHTTP = require('http');
const fs = require('fs');

//deklarerar våra filer
let homePage;
let noteCard;
let notesData;
let notePage;

try {
    // Läser in homepage från index.html synkront
    homePage = fs.readFileSync("index.html", "utf-8");

    // läser vår json synkront
    const data = fs.readFileSync('notes.json', 'utf-8');
    notesData = JSON.parse(data); //parse till js objekt
} catch (err) {
    console.error('Error reading files:', err);
    process.exit(1);
}

// läser in asynkront
fs.readFile("noteCard.html", "utf-8", (err, data) => {
    if (err) {
        console.error("Error reading noteCard.html:", err);
        process.exit(1);
    } else {
        noteCard = data;
        createServerIfReady();// avvaktar till allt är inläst innan servern startas
    }
});

// läser in asynkront
fs.readFile("notePage.html", "utf-8", (err, data) => {
    if (err) {
        console.error("Error reading notePage.html:", err);
        process.exit(1);
    } else {
        notePage = data;
        createServerIfReady(); // avvaktar till allt är inläst innan servern startas
    }
});

// funktion som startar servern när all väsentlig data är tillgänglig
function createServerIfReady() {
    if (homePage && noteCard && notePage && notesData) {
        // generar html för varje note
        const notesArray = notesData.map((_note) => {
            //truncate om innehåll är för långt
            let noteContent = _note.content;
            if (noteContent.length > 20) {
                noteContent = noteContent.slice(0, 20) + "...";
            }

            //erätter alla placeholder med json värden (alltså data(data))
            let output = noteCard.replace("{{%TITLE%}}", _note.title);
            output = output.replace("{{%CONTENT%}}", noteContent);
            output = output.replace("{{%DATE%}}", _note.date);
            output = output.replace("{{%AUTHOR%}}", _note.author);
            output = output.replace("{{%ID%}}", _note.id); // Add note ID
            return output;
        });

        // skapar servern när allt är inläst/uppdaterat
        createServer(notesArray);
    }
}


// startar servern efter allt är inläst och all data är processed
function createServer(notesArray) {
    const server = oHTTP.createServer((_request, _response) => {
        let path = _request.url; 

        if (path === "/" || path.toLowerCase() === "/home") {
            _response.writeHead(200, { "Content-Type": "text/html" });
            //ersätter vår placegolder med alla notecards (join = sätter ihop alla)
            _response.write(homePage.replace("{{%CONTENT%}}", notesArray.join("")));
            _response.end();
        } 
        else if (path.startsWith('/note/')) { // route för spec. note
            const noteId = parseInt(path.split('/')[2]); // hämtar id från url
            // index är id -1 
            const note = notesData[noteId - 1];
            if (note) {
                //hämtar värden från spec. note och ersätter placeholders
                const noteContent = notePage
                    .replace("{{%TITLE%}}", note.title)
                    .replace("{{%CONTENT%}}", note.content)
                    .replace("{{%DATE%}}", note.date)
                    .replace("{{%AUTHOR%}}", note.author);
                _response.writeHead(200, { "Content-Type": "text/html" });
                _response.write(noteContent);
                _response.end();
            } else {
                _response.writeHead(404, { "Content-Type": "text/html" });
                _response.write("<h1>Note not found</h1>");
                _response.end();
            }
        }
        else if (path === '/notes' && _request.method === 'GET') {
            //visar får json data...
            _response.setHeader('Content-Type', 'application/json');
            _response.statusCode = 200;
            _response.end(JSON.stringify(notesData)); // Serve notesData as JSON
        } else {
            _response.setHeader('Content-Type', 'application/json');
            _response.statusCode = 404;
            _response.end(JSON.stringify({ message: 'Not Found' }));
        }
    }).listen(3000);

    console.log("Server started...");
    console.log("Enter --> localhost:3000 <-- in your browser");


}
