const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon/';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

//Document Object
const DOM = {
    // Screens & Modals
    landingPage: document.getElementById('landing-page'), // This is now the "game.html" landing page
    battleArena: document.getElementById('battle-arena'),
    pokedexModal: document.getElementById('pokedex-modal'),
    trainerModal: document.getElementById('trainer-modal'),
    marketplaceModal: document.getElementById('marketplace-modal'),
    cinematicResult: document.getElementById('cinematic-result'),
   
    // Landing Page elements (on game.html)
    startGameBtn: document.getElementById('start-game-btn'),
    openPokedexBtn: document.getElementById('open-pokedex-btn'),
    openTrainerModal: document.getElementById('open-trainer-modal2'),
    marketplaceBtn: document.getElementById('marketplace-btn'),
    playerNameInput: document.getElementById('player-name-input'),
    trainerNameDisplay: document.getElementById('trainer-name-display'),
    trainerAvatarImg: document.getElementById('trainer-avatar-img'),
    starterPreview: document.getElementById('starter-preview'),
    starterName: document.getElementById('starter-name'),

    // Wallet & Battle elements
    btcBalance: document.getElementById('btc-balance'),
    btcBalance2: document.getElementById('btc-balance-2'),
    marketBtc: document.getElementById('market-btc'),
    currentTrainerName: document.getElementById('current-trainer-name'),
    playerHealthBar: document.getElementById('player-health-bar'),
    opponentHealthBar: document.getElementById('opponent-health-bar'),
    playerPokemonImg: document.getElementById('player-pokemon-img'),
    opponentPokemonImg: document.getElementById('opponent-pokemon-img'),
    playerNameSpan: document.getElementById('player-name'),
    opponentNameSpan: document.getElementById('opponent-name'),
    actionLog: document.getElementById('action-log'),
    attackButtons: document.querySelectorAll('.control-btn:not(#main-menu-btn)'), // Exclude Main Menu button
    playerVFX: document.getElementById('player-vfx'),
    opponentVFX: document.getElementById('opponent-vfx'),
    pokemonShopList: document.getElementById('pokemon-shop-list'),
    closeModalBtns: document.querySelectorAll('.close-modal-btn'),
    closeModalBtns2: document.querySelectorAll('.close-modal-btn2'),
    mainMenuBtn: document.getElementById('main-menu-btn'),

    // PokeDex Carousel elements
    pokedexCarousel: document.getElementById('pokedex-carousel'),
    carouselPrev: document.getElementById('carousel-prev'),
    carouselNext: document.getElementById('carousel-next'),
    selectCarouselPokemon: document.getElementById('select-carousel-pokemon'),

    // Trainer Modal elements
    avatarGrid: document.getElementById('avatar-grid'),
    trainerUpload: document.getElementById('trainer-upload'),
    applyAvatar: document.getElementById('apply-avatar'),

    // Cinematic & Controls
    cinematicTitle: document.getElementById('cinematic-title'),
    cinematicSub: document.getElementById('cinematic-sub'),
    cinematicContinue: document.getElementById('cinematic-continue'),
    cinematicRematch: document.getElementById('cinematic-rematch'), // Included Rematch button
};

const STARTER_POKEMON_LIST = [
    { id: 7, name: 'Squirtle', type: 'water', hp: 100, atk: 15, spAtk: 30 },
    { id: 1, name: 'Bulbasaur', type: 'grass', hp: 110, atk: 18, spAtk: 25 },
    { id: 4, name: 'Charmander', type: 'fire', hp: 90, atk: 20, spAtk: 35 },
    { id: 25, name: 'Pikachu', type: 'electric', hp: 80, atk: 12, spAtk: 40 },
    { id: 132, name: 'Ditto', type: 'normal', hp: 150, atk: 10, spAtk: 10 },
];

const GAME_STATE = {
    playerName: DOM.playerNameInput.value,
    trainerAvatar: DOM.trainerAvatarImg.src,
    btcWallet: 0.00,
    playerPokemon: STARTER_POKEMON_LIST[0], // Squirtle by default
    opponentPokemon: { name: 'Charizard', id: 6, maxHP: 120, currentHP: 120, attack: 20, specialAttack: 40, type: 'fire' },
    isPlayerTurn: true,
    isBattleRunning: false,
    autoAttackInterval: null,
    carouselIndex: 0,
    shopInventory: [
        { id: 143, name: 'Snorlax', cost: 0.04, power: { hp: 180, atk: 15, spAtk: 20 } },
        { id: 94, name: 'Gengar', cost: 0.07, power: { hp: 100, atk: 25, spAtk: 50 } },
        { id: 150, name: 'Mewtwo', cost: 0.50, power: { hp: 200, atk: 30, spAtk: 70 } },
    ],
    // Replace the presetAvatars array with local paths
    // BOOTACAMPERS AVATARS
presetAvatars: [
    './pokeimages/avatars/Screenshot 2025-10-09 140340.png',        
    './pokeimages/avatars/Screenshot 2025-10-10 090212.png',     
    './pokeimages/avatars/Screenshot 2025-10-10 153325.png',      
    './pokeimages/avatars/Screenshot 2025-10-10 090242.png',      
],
    audioAmbience: new Audio('./pokeimages/sounds/battle-fighting-warrior-drums-372078.mp3'), 
    graphicsMode: 'high',
};

// ==========================================================
//                 2. UTILITY & UI RENDERING
// ==========================================================

/** Gets the direct URL for a Pokémon's sprite. */
function getSpriteUrl(id) {
    return `${SPRITE_BASE}${id}.png`;
}

/** Helper to show/hide modals. */
function toggleModal(modalElement, show = true) {
    modalElement.classList.toggle('show', show);
    modalElement.setAttribute('aria-hidden', !show);
}

/** Switches the active screen. */
function switchScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    screenToShow.classList.add('active');
}

/** Updates the wallet display across all screens. */
function updateWalletDisplay() {
    const balance = `${GAME_STATE.btcWallet.toFixed(2)} BTC`;
    DOM.btcBalance.textContent = balance;
    DOM.marketBtc.textContent = balance;
}

/** Updates the landing page UI with the current Pokémon. */
function renderLandingUI() {
    DOM.trainerNameDisplay.textContent = GAME_STATE.playerName;
   
    // Update starter preview
    DOM.starterPreview.src = getSpriteUrl(GAME_STATE.playerPokemon.id);
    DOM.starterName.textContent = GAME_STATE.playerPokemon.name;
   
    updateWalletDisplay();
}

/** Updates the health bar visually. */
function updateHealthBar(barElement, currentHP, maxHP) {
    const percentage = (currentHP / maxHP) * 100;
    const clampedPercentage = Math.max(0, percentage);
    barElement.style.width = `${clampedPercentage}%`;
   
    if (clampedPercentage > 20) {
        barElement.style.backgroundColor = '#0f0'; // Green
    } else {
        barElement.style.backgroundColor = 'var(--danger)'; // Red for critical
    }
}

/** Displays a message in the action log. */
function logAction(message) {
    DOM.actionLog.textContent = message;
}
/** Simple music starter */
function startBackgroundMusic() {
    GAME_STATE.audioAmbience.loop = true;
    GAME_STATE.audioAmbience.volume = 0.7; // Medium volume
    GAME_STATE.audioAmbience.play().catch(error => {
        console.log("Music will start after user clicks");
    });
}
// ==========================================================
//                 3. CAROUSEL & SELECTION LOGIC
// ==========================================================

/** Renders the Pokédex carousel slides. */
function renderCarousel() {
    DOM.pokedexCarousel.innerHTML = '';
   
    STARTER_POKEMON_LIST.forEach((pokemon, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.dataset.index = index;
       
        slide.innerHTML = `
            <img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name}" style="width:100px; height:100px;">
            <h4>${pokemon.name}</h4>
            <div class="kicker">${pokemon.type.toUpperCase()} | ATK: ${pokemon.atk}</div>
        `;
       
        DOM.pokedexCarousel.appendChild(slide);
    });
   
    updateCarousel();
}

/** Updates the visual state of the carousel (which one is centered). */
function updateCarousel() {
    const slides = DOM.pokedexCarousel.querySelectorAll('.carousel-slide');
   
    slides.forEach((slide, index) => {
        slide.classList.remove('dim');
        if (index !== GAME_STATE.carouselIndex) {
            slide.classList.add('dim');
        }
       
        // Calculate translation for centering
        const centerOffset = DOM.pokedexCarousel.offsetWidth / 2 - slides[0].offsetWidth / 2;
        const slideWidth = slides[0].offsetWidth + 10; // Slide width + gap
        const offset = centerOffset - (GAME_STATE.carouselIndex * slideWidth);
       
        DOM.pokedexCarousel.style.transform = `translateX(${offset}px)`;
    });
}

/** Cycles the carousel left or right. */
function moveCarousel(direction) {
    const total = STARTER_POKEMON_LIST.length;
    GAME_STATE.carouselIndex += direction;
   
    if (GAME_STATE.carouselIndex < 0) {
        GAME_STATE.carouselIndex = total - 1;
    } else if (GAME_STATE.carouselIndex >= total) {
        GAME_STATE.carouselIndex = 0;
    }
   
    updateCarousel();
}

/** Selects the currently centered Pokémon. */
function selectCurrentPokemon() {
    const selected = STARTER_POKEMON_LIST[GAME_STATE.carouselIndex];
    GAME_STATE.playerPokemon = {
        name: selected.name,
        id: selected.id,
        maxHP: selected.hp,
        currentHP: selected.hp,
        attack: selected.atk,
        specialAttack: selected.spAtk,
        type: selected.type,
    };
    renderLandingUI();
    toggleModal(DOM.pokedexModal, false);
}

// ==========================================================
//                 4. TRAINER AVATAR LOGIC
// ==========================================================

/** Renders the avatar selection grid. */
function renderAvatarGrid() {
    DOM.avatarGrid.innerHTML = '';
    GAME_STATE.presetAvatars.forEach(url => {
        const option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.url = url;
        option.innerHTML = `<img src="${url}" alt="Trainer Avatar">`;
       
        option.addEventListener('click', () => {
            // Highlight selected avatar
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            GAME_STATE.trainerAvatar = url;
        });

        DOM.avatarGrid.appendChild(option);
    });
}

/** Handles applying the selected or uploaded avatar. */
function applyTrainerAvatar() {
    DOM.trainerAvatarImg.src = GAME_STATE.trainerAvatar;
    toggleModal(DOM.trainerModal, false);
}

// ==========================================================
//                 5. MARKETPLACE LOGIC
// ==========================================================

/** Renders the Marketplace with available Pokémon. */
function renderMarketplace() {
    DOM.marketBtc.textContent = `${GAME_STATE.btcWallet.toFixed(2)} BTC`;
    DOM.pokemonShopList.innerHTML = '';

    GAME_STATE.shopInventory.forEach(pokemon => {
        const isCurrent = pokemon.id === GAME_STATE.playerPokemon.id;
        const canAfford = GAME_STATE.btcWallet >= pokemon.cost;
       
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <h4>${pokemon.name}</h4>
            <img src="${getSpriteUrl(pokemon.id)}" alt="${pokemon.name} Sprite">
            <div class="kicker">HP: ${pokemon.power.hp} | ATK: ${pokemon.power.atk}</div>
            <p>Cost: <strong>${pokemon.cost.toFixed(2)} BTC</strong></p>
            <button class="btn small primary buy-btn" data-id="${pokemon.id}"
                ${!canAfford ? 'disabled' : ''}
                ${isCurrent ? 'disabled' : ''}>
                ${isCurrent ? 'Current Pokémon' : (canAfford ? 'BUY' : 'Too Expensive')}
            </button>
        `;

        DOM.pokemonShopList.appendChild(card);
    });

    // Attach buy listeners after rendering
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', handleBuyPokemon);
    });
}

/** Handles the logic when a player buys a Pokémon. */
function handleBuyPokemon(e) {
    const pokemonId = parseInt(e.target.getAttribute('data-id'));
    const newPokemon = GAME_STATE.shopInventory.find(p => p.id === pokemonId);

    if (!newPokemon || GAME_STATE.btcWallet < newPokemon.cost) {
        alert("Transaction Failed: Insufficient BTC.");
        return;
    }

    // Deduct cost and update player state
    GAME_STATE.btcWallet -= newPokemon.cost;
    GAME_STATE.playerPokemon = {
        name: newPokemon.name,
        id: newPokemon.id,
        maxHP: newPokemon.power.hp,
        currentHP: newPokemon.power.hp,
        attack: newPokemon.power.atk,
        specialAttack: newPokemon.power.spAtk
    };

    alert(`Successfully purchased ${newPokemon.name} for ${newPokemon.cost.toFixed(2)} BTC!`);
    renderLandingUI();
    renderMarketplace();
}


/** Initializes the battle setup. */
function initializeBattle() {
    GAME_STATE.isBattleRunning = true;
    GAME_STATE.isPlayerTurn = true;
   
    // Reset Pokémon Health
    GAME_STATE.playerPokemon.currentHP = GAME_STATE.playerPokemon.maxHP;
    GAME_STATE.opponentPokemon.currentHP = GAME_STATE.opponentPokemon.maxHP;
   
    // Render all UI elements
    DOM.playerPokemonImg.src = getSpriteUrl(GAME_STATE.playerPokemon.id);
    DOM.opponentPokemonImg.src = getSpriteUrl(GAME_STATE.opponentPokemon.id);
    DOM.playerNameSpan.textContent = GAME_STATE.playerPokemon.name;
    DOM.opponentNameSpan.textContent = GAME_STATE.opponentPokemon.name;

    updateHealthBar(DOM.playerHealthBar, GAME_STATE.playerPokemon.currentHP, GAME_STATE.playerPokemon.maxHP);
    updateHealthBar(DOM.opponentHealthBar, GAME_STATE.opponentPokemon.currentHP, GAME_STATE.opponentPokemon.maxHP);

    lockControls(false);
    logAction(`Go, ${GAME_STATE.playerPokemon.name}!`);
    DOM.cinematicResult.classList.add('hidden'); // Ensure result screen is hidden
}

/** Disables/Enables manual controls. */
function lockControls(lock = true) {
    DOM.attackButtons.forEach(btn => btn.disabled = lock);
    DOM.mainMenuBtn.disabled = lock;
    DOM.cinematicContinue.disabled = lock; // Keep cinematic controls disabled until results show
    DOM.cinematicRematch.disabled = lock;
}

/** Applies cinematic VFX and game speed changes. */
function applyCinematicVFX(targetVFX, isSpecial) {
    const vfxType = isSpecial ? (GAME_STATE.playerPokemon.type || 'impact') : 'impact';
    const vfxElement = document.createElement('div');
    vfxElement.className = `${vfxType}-fx`;
    targetVFX.appendChild(vfxElement);
   
    // Clean up VFX element
    setTimeout(() => vfxElement.remove(), 750);

    // Cinematic effects (keep for visual flair)
    if (isSpecial) {
        DOM.battleArena.classList.add('slow-mo');
        document.body.style.transitionDuration = '1.5s';
        setTimeout(() => {
            DOM.battleArena.classList.remove('slow-mo');
            document.body.style.transitionDuration = '0s';
        }, 800);
    } else {
        DOM.battleArena.classList.add('camera-zoom');
        setTimeout(() => DOM.battleArena.classList.remove('camera-zoom'), 180);
    }
}

/** Handles a single attack. */
function performAttack(moveName, power, attacker, defender, defenderVFX, defenderHealthBar, isPlayerMove) {
    return new Promise(resolve => {
        logAction(`${attacker.name} used ${moveName}!`);
       
        const isSpecial = power > 25;
       
        // --- Implement movement animation ---
        const attackerImg = isPlayerMove ? DOM.playerPokemonImg : DOM.opponentPokemonImg;
        attackerImg.classList.add('move-forward');
        // ------------------------------------

        // Damage calculation
        const isCrit = Math.random() < 0.1;
        const critMultiplier = isCrit ? 1.5 : 1;
       
        // Simple type weakness (fire > grass, water > fire, grass > water)
        let typeMultiplier = 1;
        if (isPlayerMove) {
            if (attacker.type === 'water' && defender.type === 'fire') typeMultiplier = 2;  
            if (attacker.type === 'fire' && defender.type === 'grass') typeMultiplier = 2;  
        } else {
            if (defender.type === 'grass') typeMultiplier = 2;
            if (defender.type === 'water') typeMultiplier = 0.5;
        }

        const damage = Math.floor((power * critMultiplier * typeMultiplier) + Math.random() * 5);
       
        defender.currentHP -= damage;
        defender.currentHP = Math.max(0, defender.currentHP);

        // Apply shake to defender
        const defenderElement = defenderHealthBar.closest('.pokemon-container');
        defenderElement.classList.add('shake');

        // Apply VFX to defender *before* the attack connects (after attacker moves halfway)
        setTimeout(() => {
            applyCinematicVFX(defenderVFX, isSpecial);
        }, 150);

        setTimeout(() => {
            defenderElement.classList.remove('shake');
           
            // --- Remove movement animation and reset position ---
            attackerImg.classList.remove('move-forward');
            // --------------------------------------------------------

            updateHealthBar(defenderHealthBar, defender.currentHP, defender.maxHP);
           
            let message = `${defender.name} took ${damage} damage!`;
            if (isCrit) message += ' (Critical Hit!)';
            if (typeMultiplier === 2) message += ' (It\'s Super Effective!)';
            if (typeMultiplier === 0.5) message += ' (It\'s Not Very Effective...)';
           
            logAction(message);
            resolve();
        }, 1200);
    });
}

/** Main battle turn handler. */
async function handleBattleTurn(moveName, power) {
    if (!GAME_STATE.isPlayerTurn || !GAME_STATE.isBattleRunning) {
        return;
    }

    lockControls(true);

    const player = GAME_STATE.playerPokemon;
    const opponent = GAME_STATE.opponentPokemon;

    // 1. Player's Move
    await performAttack(moveName, parseInt(power), player, opponent, DOM.opponentVFX, DOM.opponentHealthBar, true);

    if (checkBattleEnd()) return;

    // 2. Opponent's Move (after delay)
    setTimeout(async () => {
        // Opponent AI
        const oppPower = opponent.specialAttack;
        const oppMoveName = 'Dragon Breath';

        await performAttack(oppMoveName, oppPower, opponent, player, DOM.playerVFX, DOM.playerHealthBar, false);
       
        GAME_STATE.isPlayerTurn = true;
       
        if (checkBattleEnd()) return;
       
        lockControls(false);
    }, 2800);
}

/** Checks for a winner and handles game over/win state. */
function checkBattleEnd() {
    if (!GAME_STATE.isBattleRunning) return false;

    if (GAME_STATE.opponentPokemon.currentHP <= 0) {
        handleWin();
        return true;
    } else if (GAME_STATE.playerPokemon.currentHP <= 0) {
        handleLoss();
        return true;
    }
    return false;
}

/** Handles the player winning (BTC Feature). */
function handleWin() {
    GAME_STATE.isBattleRunning = false;
    lockControls(true); // Lock controls immediately

    const btcReward = 0.01;
    GAME_STATE.btcWallet += btcReward;
    updateWalletDisplay();
   
    DOM.cinematicTitle.textContent = 'VICTORY!';
    DOM.cinematicSub.innerHTML = `+${btcReward.toFixed(2)} BTC reward!`;
    DOM.cinematicResult.classList.remove('hidden');
    DOM.cinematicContinue.disabled = false;
    DOM.cinematicRematch.disabled = false;

    // Add BTC coin VFX on the defeated opponent
    DOM.opponentVFX.innerHTML = `<div class="btc-coin-fx" style="font-size: 3em; color: var(--accent-2); animation: floatUp 3s ease-out forwards;"><i class="fab fa-bitcoin"></i></div>`;
   
    setTimeout(() => DOM.opponentVFX.innerHTML = '', 3000);
}

/** Handles the player losing. */
function handleLoss() {
    GAME_STATE.isBattleRunning = false;
    lockControls(true); // Lock controls immediately
   
    DOM.cinematicTitle.textContent = 'DEFEATED...';
    DOM.cinematicSub.innerHTML = `You blacked out. Returning to base.`;
    DOM.cinematicResult.classList.remove('hidden');
    DOM.cinematicContinue.disabled = false;
    DOM.cinematicRematch.disabled = false;
}

// ==========================================================
//                 7. EVENT LISTENERS
// ==========================================================

// --- Landing Page & Modals (on game.html) ---
DOM.playerNameInput.addEventListener('change', (e) => {
    GAME_STATE.playerName = e.target.value.trim() || "New Trainer";
    renderLandingUI();
});

DOM.openPokedexBtn.addEventListener('click', () => {
    renderCarousel();
    toggleModal(DOM.pokedexModal, true);
});

DOM.openTrainerModal.addEventListener('click', () => {
    renderAvatarGrid();
    toggleModal(DOM.trainerModal, true);
});

DOM.marketplaceBtn.addEventListener('click', () => {
    renderMarketplace();
    toggleModal(DOM.marketplaceModal, true);
});

DOM.startGameBtn.addEventListener('click', () => {
    switchScreen(DOM.battleArena);
    initializeBattle();
});

// --- Pokedex Carousel Controls ---
DOM.carouselPrev.addEventListener('click', () => moveCarousel(-1));
DOM.carouselNext.addEventListener('click', () => moveCarousel(1));
DOM.selectCarouselPokemon.addEventListener('click', selectCurrentPokemon);

// --- Trainer Modal Controls ---
DOM.applyAvatar.addEventListener('click', applyTrainerAvatar);
DOM.trainerUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            GAME_STATE.trainerAvatar = event.target.result;
            DOM.trainerAvatarImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// --- Modal Close Buttons ---
DOM.closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal')
        toggleModal(modal, false);
    });
});
DOM.closeModalBtns2.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal2 = e.target.closest('.modal2')
        toggleModal(modal2, false);
    });
});

// --- Battle Arena Events ---
DOM.attackButtons.forEach(button => {
    button.addEventListener('click', () => {
        const moveName = button.getAttribute('data-move');
        const power = button.getAttribute('data-power');
        handleBattleTurn(moveName, power);
    });
});

// Main Menu Button for Battle Controls
DOM.mainMenuBtn.addEventListener('click', () => {
    if (GAME_STATE.isBattleRunning || DOM.cinematicResult.classList.contains('hidden')) {
        logAction("Returning to Main Menu...");
        lockControls(true);
        setTimeout(() => switchScreen(DOM.landingPage), 1000);
    }
});

// Cinematic Result Controls
DOM.cinematicContinue.addEventListener('click', () => {
    DOM.cinematicResult.classList.add('hidden');
    switchScreen(DOM.landingPage); // Return to game.html's landing page
});

// --- REMATCH FUNCTIONALITY ---
DOM.cinematicRematch.addEventListener('click', () => {
    DOM.cinematicResult.classList.add('hidden');
    initializeBattle(); // Start a new battle immediately
});
// -----------------------------


// ==========================================================
//                 8. INITIALIZATION
// ==========================================================
// Start music after any user click (browser requirement)
document.addEventListener('click', function() {
    startBackgroundMusic();
}, { once: true }); // Only need to click once

// ==========================================================
//                 8. INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    switchScreen(DOM.landingPage);
    renderLandingUI();
   
    // Set initial avatar
    GAME_STATE.trainerAvatar = DOM.trainerAvatarImg.src;

    // Music will start automatically after first user click
    // No extra settings needed!

    // Apply graphics setting
    document.body.classList.toggle('low-graphics', GAME_STATE.graphicsMode === 'low');
});