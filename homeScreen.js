// Home Screen and Navigation Management
let currentEditingWorldId = null;

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

function showHomeScreen() {
    showScreen('homeScreen');
}

function showWorldsScreen() {
    showScreen('worldsScreen');
    renderWorldsList();
}

function showWorldEditor(worldId = null) {
    currentEditingWorldId = worldId;
    showScreen('worldEditorScreen');
    
    if (worldId) {
        loadWorldIntoEditor(worldId);
    } else {
        clearWorldEditor();
        document.getElementById('worldTitle').textContent = 'Create New World';
    }
}

function showSettings() {
    alert('Settings coming soon!\n\nFeatures:\n- Graphics Settings\n- Sound Settings\n- Control Settings\n- Account Settings');
}

function renderWorldsList() {
    const worldsList = document.getElementById('worldsList');
    const worlds = worldManager.getAllWorlds();
    
    if (worlds.length === 0) {
        worldsList.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">No worlds found. Create one to get started!</div>';
        return;
    }
    
    worldsList.innerHTML = worlds.map(world => `
        <div class="world-item" onclick="showWorldEditor('${world.id}')">
            <div class="world-item-info">
                <div class="world-item-name">${world.name}</div>
                <div class="world-item-details">
                    <span class="gamemode">${world.getGameModeIcon()} ${world.gameMode}</span>
                    <span class="difficulty">⚔️ ${world.difficulty}</span>
                    <span>Seed: ${world.seed}</span>
                    <span>Last played: ${formatDate(world.lastPlayed)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function createNewWorld() {
    const worldName = prompt('Enter world name:', 'My World');
    if (worldName && worldName.trim()) {
        const world = worldManager.createWorld(worldName.trim(), 'survival', 'normal');
        showWorldEditor(world.id);
    }
}

function loadWorldIntoEditor(worldId) {
    const world = worldManager.getWorld(worldId);
    if (world) {
        document.getElementById('worldTitle').textContent = `Editing: ${world.name}`;
        document.getElementById('worldNameInput').value = world.name;
        document.getElementById('gameModeSelect').value = world.gameMode;
        document.getElementById('difficultySelect').value = world.difficulty;
        updateWorldPreview(world);
    }
}

function clearWorldEditor() {
    document.getElementById('worldNameInput').value = '';
    document.getElementById('gameModeSelect').value = 'survival';
    document.getElementById('difficultySelect').value = 'normal';
    currentEditingWorldId = null;
}

function updateWorldPreview(world) {
    const preview = document.getElementById('worldPreview');
    const textures = {
        'survival': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/grass_block_top.png',
        'creative': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/grass_block_top.png',
        'adventure': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/stone.png'
    };
    
    const bgImage = textures[world.gameMode] || textures['survival'];
    preview.style.backgroundImage = `
        url('${bgImage}'),
        url('https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/dirt.png')
    `;
    preview.innerHTML = `<div style="color: #ffff00; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">🌍 ${world.name}</div>
        <div style="font-size: 14px; margin-top: 10px; color: #aaaaaa;">
            Mode: ${world.gameMode.toUpperCase()}<br>
            Difficulty: ${world.difficulty.toUpperCase()}<br>
            Seed: ${world.seed}
        </div>
    </div>`;
}

function saveWorld() {
    if (!currentEditingWorldId) {
        const name = document.getElementById('worldNameInput').value.trim();
        const gameMode = document.getElementById('gameModeSelect').value;
        const difficulty = document.getElementById('difficultySelect').value;
        
        if (!name) {
            alert('Please enter a world name!');
            return;
        }
        
        const world = worldManager.createWorld(name, gameMode, difficulty);
        currentEditingWorldId = world.id;
        alert(`✅ World "${name}" created successfully!`);
    } else {
        const name = document.getElementById('worldNameInput').value.trim();
        const gameMode = document.getElementById('gameModeSelect').value;
        const difficulty = document.getElementById('difficultySelect').value;
        
        if (!name) {
            alert('Please enter a world name!');
            return;
        }
        
        worldManager.updateWorld(currentEditingWorldId, {
            name: name,
            gameMode: gameMode,
            difficulty: difficulty
        });
        
        alert(`✅ World "${name}" saved successfully!`);
    }
    
    showWorldsScreen();
}

function deleteWorld() {
    if (!currentEditingWorldId) {
        alert('No world to delete!');
        return;
    }
    
    const world = worldManager.getWorld(currentEditingWorldId);
    if (!world) return;
    
    const confirmDelete = confirm(
        `Are you sure you want to delete "${world.name}"?\n\n` +
        `⚠️ This action cannot be undone!\n` +
        `Game Time: ${formatPlayTime(world.playTime)}`
    );
    
    if (confirmDelete) {
        const secondConfirm = confirm(
            `Final confirmation: Delete "${world.name}"?\n` +
            `Type "YES" in the next prompt to confirm.`
        );
        
        if (secondConfirm) {
            const userConfirm = prompt(`Type "YES" to delete "${world.name}":`);
            if (userConfirm === 'YES') {
                worldManager.deleteWorld(currentEditingWorldId);
                alert(`🗑️ World "${world.name}" has been deleted.`);
                currentEditingWorldId = null;
                showWorldsScreen();
                return;
            }
        }
        alert('Deletion cancelled.');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function formatPlayTime(ticks) {
    const days = Math.floor(ticks / 24000);
    const hours = Math.floor((ticks % 24000) / 1000);
    const minutes = Math.floor((ticks % 1000) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to go back
    if (event.key === 'Escape') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen.id === 'worldEditorScreen') {
            showWorldsScreen();
        } else if (activeScreen.id === 'worldsScreen') {
            showHomeScreen();
        }
    }
    
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen.id === 'worldEditorScreen') {
            saveWorld();
        }
    }
});

// Initialize on page load
window.addEventListener('load', function() {
    showHomeScreen();
});
