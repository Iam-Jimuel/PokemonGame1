document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game-initial');
    const settingsButton = document.getElementById('settings-initial');

    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            window.location.href = 'game.html'; 
        });
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Placeholder for settings modal or page
            alert('DI PA TAPOS BOY!!!.');
        });
    }
});
