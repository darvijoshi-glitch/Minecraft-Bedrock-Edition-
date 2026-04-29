// World Management System
class World {
    constructor(name, gameMode = 'survival', difficulty = 'normal') {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.gameMode = gameMode;
        this.difficulty = difficulty;
        this.seed = Math.floor(Math.random() * 1000000000);
        this.createdAt = new Date().toISOString();
        this.lastPlayed = new Date().toISOString();
        this.playTime = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            gameMode: this.gameMode,
            difficulty: this.difficulty,
            seed: this.seed,
            createdAt: this.createdAt,
            lastPlayed: this.lastPlayed,
            playTime: this.playTime
        };
    }

    static fromJSON(data) {
        const world = new World(data.name, data.gameMode, data.difficulty);
        world.id = data.id;
        world.seed = data.seed;
        world.createdAt = data.createdAt;
        world.lastPlayed = data.lastPlayed;
        world.playTime = data.playTime;
        return world;
    }

    getDifficultyColor() {
        const colors = {
            'peaceful': '#00ff00',
            'easy': '#00ff00',
            'normal': '#ffaa00',
            'hard': '#ff4444'
        };
        return colors[this.difficulty] || '#ffffff';
    }

    getGameModeIcon() {
        const icons = {
            'survival': '🎮',
            'creative': '🎨',
            'adventure': '🏔️'
        };
        return icons[this.gameMode] || '🎮';
    }
}

class WorldManager {
    constructor(storageKey = 'minecraft_worlds') {
        this.storageKey = storageKey;
        this.worlds = [];
        this.currentWorldId = null;
        this.loadWorlds();
        this.initializeSampleWorlds();
    }

    loadWorlds() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const worldsData = JSON.parse(data);
                this.worlds = worldsData.map(d => World.fromJSON(d));
            }
        } catch (error) {
            console.error('Error loading worlds:', error);
            this.worlds = [];
        }
    }

    initializeSampleWorlds() {
        if (this.worlds.length === 0) {
            // Create sample worlds if none exist
            const sampleWorlds = [
                new World('My World', 'survival', 'normal'),
                new World('Creative Sandbox', 'creative', 'peaceful'),
                new World('Adventure Land', 'adventure', 'hard')
            ];
            
            sampleWorlds.forEach(world => {
                world.playTime = Math.floor(Math.random() * 10000);
                world.lastPlayed = new Date(Date.now() - Math.random() * 86400000).toISOString();
                this.worlds.push(world);
            });
            
            this.saveWorlds();
        }
    }

    saveWorlds() {
        try {
            const data = this.worlds.map(w => w.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving worlds:', error);
        }
    }

    createWorld(name, gameMode = 'survival', difficulty = 'normal') {
        const world = new World(name, gameMode, difficulty);
        this.worlds.push(world);
        this.saveWorlds();
        return world;
    }

    getWorld(id) {
        return this.worlds.find(w => w.id === id);
    }

    updateWorld(id, updates) {
        const world = this.getWorld(id);
        if (world) {
            Object.assign(world, updates);
            world.lastPlayed = new Date().toISOString();
            this.saveWorlds();
            return world;
        }
        return null;
    }

    deleteWorld(id) {
        const index = this.worlds.findIndex(w => w.id === id);
        if (index > -1) {
            this.worlds.splice(index, 1);
            this.saveWorlds();
            return true;
        }
        return false;
    }

    getAllWorlds() {
        return [...this.worlds];
    }

    getWorldStats() {
        return {
            totalWorlds: this.worlds.length,
            survivalWorlds: this.worlds.filter(w => w.gameMode === 'survival').length,
            creativeWorlds: this.worlds.filter(w => w.gameMode === 'creative').length,
            adventureWorlds: this.worlds.filter(w => w.gameMode === 'adventure').length,
            totalPlayTime: this.worlds.reduce((sum, w) => sum + w.playTime, 0)
        };
    }

    exportWorldsToJSON() {
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            worlds: this.worlds.map(w => w.toJSON()),
            stats: this.getWorldStats()
        }, null, 2);
    }

    importWorldsFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (data.worlds && Array.isArray(data.worlds)) {
                const importedWorlds = data.worlds.map(w => World.fromJSON(w));
                this.worlds = [...this.worlds, ...importedWorlds];
                this.saveWorlds();
                return {
                    success: true,
                    imported: importedWorlds.length
                };
            }
            throw new Error('Invalid world data format');
        } catch (error) {
            console.error('Error importing worlds:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize global world manager
const worldManager = new WorldManager();

// Console Commands
window.getGameStats = function() {
    const stats = worldManager.getWorldStats();
    console.table(stats);
    return stats;
};

window.exportWorldData = function() {
    const jsonData = worldManager.exportWorldsToJSON();
    console.log('Exported World Data:');
    console.log(jsonData);
    
    // Also trigger download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minecraft_worlds_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    return jsonData;
};

window.importWorldData = function(jsonData) {
    const result = worldManager.importWorldsFromJSON(jsonData);
    console.log('Import Result:', result);
    return result;
};

window.getAllWorlds = function() {
    const worlds = worldManager.getAllWorlds();
    console.table(worlds.map(w => ({
        name: w.name,
        gameMode: w.gameMode,
        difficulty: w.difficulty,
        playTime: w.playTime + ' ticks',
        seed: w.seed
    })));
    return worlds;
};

window.deleteAllWorlds = function() {
    if (confirm('Are you sure you want to delete ALL worlds? This cannot be undone!')) {
        worldManager.worlds = [];
        worldManager.saveWorlds();
        console.log('All worlds deleted');
        return true;
    }
    return false;
};
