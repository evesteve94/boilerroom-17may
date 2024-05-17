// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Select all buttons with class "read-more"
    const buttons = document.querySelectorAll(".read-more");

    // Add click event listener to each button
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            // Extract the note ID from the data-id attribute
            const noteId = button.getAttribute("data-id");

            // Construct the URL for the corresponding note's page
            const url = `/note/${noteId}`;

            // Redirect to the note's page
            window.location.href = url;
        });
    });
});
