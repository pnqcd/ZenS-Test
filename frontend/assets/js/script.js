const jokeText = document.getElementById('joke-text');
const likeBtn = document.getElementById('vote-up-btn');
const dislikeBtn = document.getElementById('vote-down-btn');
let curJoke = 0;

const getJoke = async () => {
    try {
        const response = await fetch('/get_joke');
        if (response.ok) {
            const joke = await response.json();
            jokeText.textContent = joke.content;
            jokeText.style.textAlign = 'start';
            curJoke = joke.id;
        } else if (response.status === 404) {
            jokeText.textContent = `That's all the jokes for today! Come back another day!`;
            jokeText.style.textAlign = 'center';
            likeBtn.disabled = true;
            dislikeBtn.disabled = true;
        }
        else {
            console.error('Error fetching joke: ', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching joke: ', error);
    }
}

const voteJoke = async (voteType) => {
    try {
        const response = await fetch('/insert_vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ joke_id: curJoke, vote_type: voteType })
        });
        if (response.ok) {
            getJoke();
        } else {
            console.error('Voting error: ', response.statusText);
        }
    } catch (error) {
        console.error('Voting error: ', error);
    }
}

likeBtn.addEventListener('click', () => {
    voteJoke(1);
})

dislikeBtn.addEventListener('click', () => {
    voteJoke(0);
})

document.addEventListener("DOMContentLoaded", function() {
    getJoke();
});