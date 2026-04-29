// Game Engine and Block System
class Block {
    constructor(type, texture = null) {
        this.type = type;
        this.texture = texture || this.getTextureForType(type);
        this.metadata = {};
    }

    getTextureForType(type) {
        const textures = {
            'grass': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/grass_block_top.png',
            'dirt': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/dirt.png',
            'stone': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/stone.png',
            'water': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/water_still.png',
            'sand': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/sand.png',
            'log': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/oak_log.png',
            'leaves': 'https://raw.githubusercontent.com/PixlEmly/BedrockPacks/main/Vanilla_Tweaks/Textures/Resource_Pack_Base_HD/textures/blocks/oak_leaves.png',
            'air': 'transparent'
        };
        return textures[type] || textures['stone'];
    }
}

class BlockRegistry {
    constructor() {
        this.blocks = new Map();
        this.registerDefaultBlocks();
    }

    registerDefaultBlocks() {
        const defaultBlocks = [
            { id: 'grass', displayName: 'Grass Block', color: '#00aa00' },
            { id: 'dirt', displayName: 'Dirt', color: '#8b7355' },
            { id: 'stone', displayName: 'Stone', color: '#808080' },
            { id: 'water', displayName: 'Water', color: '#3366cc' },
            { id: 'sand', displayName: 'Sand', color: '#ffcc99' },
            { id: 'log', displayName: 'Oak Log', color: '#654321' },
            { id: 'leaves', displayName: 'Oak Leaves', color: '#22aa22' },
            { id: 'air', displayName: 'Air', color: '#ffffff' }
        ];

        defaultBlocks.forEach(blockData => {
            this.blocks.set(blockData.id, blockData);
        });
    }

    getBlock(id) {
        return this.blocks.get(id);
    }

    getAllBlocks() {
        return Array.from(this.blocks.values());
    }
}

class Chunk {
    constructor(x, z, size = 16) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.blocks = this.generateBlocks();
    }

    generateBlocks() {
        const blocks = [];
        for (let i = 0; i < this.size * this.size; i++) {
            blocks.push(new Block('grass'));
        }
        return blocks;
    }

    getBlock(x, z) {
        if (x < 0 || x >= this.size || z < 0 || z >= this.size) {
            return null;
        }
        return this.blocks[z * this.size + x];
    }

    setBlock(x, z, block) {
        if (x >= 0 && x < this.size && z >= 0 && z < this.size) {
            this.blocks[z * this.size + x] = block;
        }
    }
}

class Player {
    constructor(name = 'Player') {
        this.name = name;
        this.health = 20;
        this.maxHealth = 20;
        this.hunger = 20;
        this.maxHunger = 20;
        this.experience = 0;
        this.level = 0;
        this.position = { x: 0, y: 64, z: 0 };
        this.inventory = [];
        this.selectedSlot = 0;
        this.gameMode = 'survival';
    }

    takeDamage(amount) {
        if (this.gameMode !== 'creative') {
            this.health = Math.max(0, this.health - amount);
            return this.health > 0;
        }
        return true;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addExperience(amount) {
        this.experience += amount;
        const levelUpThreshold = 100 * (this.level + 1);
        if (this.experience >= levelUpThreshold) {
            this.level++;
            this.experience = 0;
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        if (mode === 'creative') {
            this.health = this.maxHealth;
            this.hunger = this.maxHunger;
        }
    }

    toJSON() {
        return {
            name: this.name,
            health: this.health,
            hunger: this.hunger,
            experience: this.experience,
            level: this.level,
            position: this.position,
            gameMode: this.gameMode,
            inventory: this.inventory
        };
    }
}

class GameEngine {
    constructor() {
        this.blockRegistry = new BlockRegistry();
        this.chunks = new Map();
        this.player = new Player();
        this.worldSeed = Math.floor(Math.random() * 1000000000);
        this.ticks = 0;
        this.isPaused = false;
        this.initializeWorld();
    }

    initializeWorld() {
        // Generate initial chunks
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                const chunkKey = `${x},${z}`;
                this.chunks.set(chunkKey, new Chunk(x, z));
            }
        }
    }

    getChunk(x, z) {
        const chunkKey = `${x},${z}`;
        if (!this.chunks.has(chunkKey)) {
            this.chunks.set(chunkKey, new Chunk(x, z));
        }
        return this.chunks.get(chunkKey);
    }

    update() {
        if (!this.isPaused) {
            this.ticks++;

            // Natural regeneration in peaceful mode
            if (this.player.gameMode === 'peaceful' && this.ticks % 100 === 0) {
                this.player.heal(1);
                if (this.player.hunger < this.player.maxHunger) {
                    this.player.hunger++;
                }
            }

            // Hunger system in survival mode
            if (this.player.gameMode === 'survival' && this.ticks % 200 === 0) {
                this.player.hunger = Math.max(0, this.player.hunger - 1);
                if (this.player.hunger === 0 && this.ticks % 400 === 0) {
                    this.player.takeDamage(1);
                }
            }
        }
    }

    placeBlock(x, y, z, blockType) {
        if (this.player.gameMode !== 'creative' && this.player.gameMode !== 'survival') {
            return false;
        }

        const chunkX = Math.floor(x / 16);
        const chunkZ = Math.floor(z / 16);
        const localX = ((x % 16) + 16) % 16;
        const localZ = ((z % 16) + 16) % 16;

        const chunk = this.getChunk(chunkX, chunkZ);
        chunk.setBlock(localX, localZ, new Block(blockType));
        return true;
    }

    breakBlock(x, y, z) {
        if (this.player.gameMode !== 'creative' && this.player.gameMode !== 'survival') {
            return false;
        }

        const chunkX = Math.floor(x / 16);
        const chunkZ = Math.floor(z / 16);
        const localX = ((x % 16) + 16) % 16;
        const localZ = ((z % 16) + 16) % 16;

        const chunk = this.getChunk(chunkX, chunkZ);
        chunk.setBlock(localX, localZ, new Block('air'));
        return true;
    }

    getGameStats() {
        return {
            ticks: this.ticks,
            worldSeed: this.worldSeed,
            loadedChunks: this.chunks.size,
            playerHealth: this.player.health,
            playerHunger: this.player.hunger,
            playerLevel: this.player.level,
            playerExperience: this.player.experience,
            playerGameMode: this.player.gameMode,
            playerPosition: this.player.position
        };
    }

    saveGameState() {
        const state = {
            worldSeed: this.worldSeed,
            ticks: this.ticks,
            player: this.player.toJSON(),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('minecraft_game_state', JSON.stringify(state));
        return state;
    }

    loadGameState() {
        const state = localStorage.getItem('minecraft_game_state');
        if (state) {
            const data = JSON.parse(state);
            this.worldSeed = data.worldSeed;
            this.ticks = data.ticks;
            this.player.name = data.player.name;
            this.player.health = data.player.health;
            this.player.hunger = data.player.hunger;
            this.player.experience = data.player.experience;
            this.player.level = data.player.level;
            return data;
        }
        return null;
    }
}

// Global game engine instance
const gameEngine = new GameEngine();

// Console Commands for Game Engine
window.getGameStats = function() {
    const stats = gameEngine.getGameStats();
    console.table(stats);
    console.log('World Stats:', stats);
    return stats;
};

window.playerStats = function() {
    const player = gameEngine.player;
    console.log('Player: ' + player.name);
    console.log('Health: ' + player.health + '/' + player.maxHealth);
    console.log('Hunger: ' + player.hunger + '/' + player.maxHunger);
    console.log('Experience: ' + player.experience);
    console.log('Level: ' + player.level);
    console.log('Game Mode: ' + player.gameMode);
    console.log('Position: X=' + player.position.x + ', Y=' + player.position.y + ', Z=' + player.position.z);
    return player.toJSON();
};

window.setGameMode = function(mode) {
    const validModes = ['survival', 'creative', 'adventure', 'peaceful'];
    if (validModes.includes(mode)) {
        gameEngine.player.setGameMode(mode);
        console.log('✅ Game mode changed to: ' + mode);
        return true;
    } else {
        console.log('❌ Invalid game mode. Use one of: ' + validModes.join(', '));
        return false;
    }
};

window.healPlayer = function() {
    gameEngine.player.heal(gameEngine.player.maxHealth);
    console.log('✅ Player healed to ' + gameEngine.player.health + ' HP');
    return gameEngine.player.health;
};

window.setPlayerHealth = function(health) {
    gameEngine.player.health = Math.min(gameEngine.player.maxHealth, Math.max(0, health));
    console.log('✅ Player health set to ' + gameEngine.player.health);
    return gameEngine.player.health;
};

window.setPlayerHunger = function(hunger) {
    gameEngine.player.hunger = Math.min(gameEngine.player.maxHunger, Math.max(0, hunger));
    console.log('✅ Player hunger set to ' + gameEngine.player.hunger);
    return gameEngine.player.hunger;
};

window.addExperience = function(amount) {
    gameEngine.player.addExperience(amount);
    console.log('✅ Added ' + amount + ' experience. Level: ' + gameEngine.player.level);
    return gameEngine.player.level;
};

window.saveGameState = function() {
    const state = gameEngine.saveGameState();
    console.log('✅ Game state saved!');
    console.log(state);
    return state;
};

window.loadGameState = function() {
    const state = gameEngine.loadGameState();
    if (state) {
        console.log('✅ Game state loaded!');
        console.log(state);
        return state;
    } else {
        console.log('❌ No saved game state found');
        return null;
    }
};

window.getBlockRegistry = function() {
    const blocks = gameEngine.blockRegistry.getAllBlocks();
    console.table(blocks);
    return blocks;
};

window.getAllConsoleCommands = function() {
    const commands = [
        'getGameStats() - Get world and game statistics',
        'playerStats() - Get detailed player statistics',
        'setGameMode(mode) - Change game mode (survival/creative/adventure/peaceful)',
        'healPlayer() - Fully heal the player',
        'setPlayerHealth(n) - Set player health (0-20)',
        'setPlayerHunger(n) - Set player hunger (0-20)',
        'addExperience(n) - Add experience points',
        'saveGameState() - Save current game state',
        'loadGameState() - Load saved game state',
        'getBlockRegistry() - View all available blocks',
        'getAllConsoleCommands() - Show all available commands',
        'exportWorldData() - Export all worlds as JSON',
        'importWorldData(json) - Import worlds from JSON',
        'getGameStats() - Get world-level statistics',
        'getAllWorlds() - List all worlds'
    ];
    console.log('=== Available Console Commands ===');
    commands.forEach(cmd => console.log(cmd));
    return commands;
};

// Auto-update game engine
setInterval(() => {
    gameEngine.update();
}, 50);

console.log('%c🎮 Minecraft Bedrock Edition Clone Loaded!', 'color: #ffff00; font-size: 16px; font-weight: bold;');
console.log('%cType getAllConsoleCommands() for a list of available commands', 'color: #00ff00; font-size: 12px;');
