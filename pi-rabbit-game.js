class Realistic3DGardenGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameRunning = true;
        this.gardenElements = [];
        this.particles = [];
        this.ambientParticles = [];
        
        // Time for animations and lighting
        this.time = 0;
        
        // Player (Garden Explorer)
        this.player = {
            x: 400,
            y: 300,
            width: 48,
            height: 48,
            speed: 2.5,
            facing: 'down',
            animFrame: 0,
            animTimer: 0,
            isMoving: false,
            shadow: { offsetX: 2, offsetY: 4, blur: 8 }
        };
        
        // Dog (Golden Retriever)
        this.dog = {
            x: 600,
            y: 400,
            width: 36,
            height: 24,
            speed: 3.5,
            facing: 'down',
            animFrame: 0,
            animTimer: 0,
            targetX: 600,
            targetY: 400,
            behaviorTimer: 0,
            behaviorState: 'wandering', // wandering, following, playing
            shadow: { offsetX: 2, offsetY: 3, blur: 6 }
        };
        
        // Man character (appears near bike)
        this.man = {
            x: 1320,
            y: 1050,
            width: 48,
            height: 48,
            facing: 'down',
            animFrame: 0,
            animTimer: 0,
            visible: false,
            shadow: { offsetX: 2, offsetY: 4, blur: 8 }
        };
        
        // Bike location (moved away from tree, more visible)
        this.bike = {
            x: 1350,
            y: 1020,
            width: 48,
            height: 32
        };
        
        // Interaction system
        this.interaction = {
            showingMessage: false,
            messageTimer: 0,
            messageText: "Happy Birthday Pi ❤️",
            messageText2: "Have a wonderful year! Be strong, healthy and happy."
        };
        
        // Building interaction effects
        this.effects = {
            windmill: { spinning: false, spinTimer: 0, spinSpeed: 0 },
            dentalClinic: { onFire: false, fireTimer: 0, fireParticles: [] },
            sushiro: { fishJumping: false, fishTimer: 0, jumpingFish: [] },
            house: { heartsFloating: false, heartsTimer: 0, hearts: [] }
        };
        
        // Camera with smooth movement
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothness: 0.1
        };
        
        // Lighting system
        this.lighting = {
            sunAngle: Math.PI / 4, // 45 degrees
            sunIntensity: 0.8,
            ambientIntensity: 0.4,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            sunColor: 'rgba(255, 248, 220, 0.2)'
        };
        
        // Garden world size (larger for more exploration)
        this.worldWidth = 1800;
        this.worldHeight = 1400;
        
        // Input handling
        this.keys = {};
        
        // Mobile touch handling
        this.touch = {
            targetX: null,
            targetY: null,
            isMovingToTarget: false
        };
        
        this.init();
        this.createGarden();
        this.createAmbientParticles();
        this.gameLoop();
    }
    
    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Create sprites
        this.createSprites();
        
        // Event listeners
        this.setupEventListeners();
        
        // Enable image smoothing for better 3D effects
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    createSprites() {
        // Realistic character sprites for each direction
        this.playerSprites = {
            down: [this.createRealisticPlayerSprite('down', 0), this.createRealisticPlayerSprite('down', 1)],
            up: [this.createRealisticPlayerSprite('up', 0), this.createRealisticPlayerSprite('up', 1)],
            left: [this.createRealisticPlayerSprite('left', 0), this.createRealisticPlayerSprite('left', 1)],
            right: [this.createRealisticPlayerSprite('right', 0), this.createRealisticPlayerSprite('right', 1)]
        };
        
        // Dog sprites for each direction
        this.dogSprites = {
            down: [this.createDogSprite('down', 0), this.createDogSprite('down', 1)],
            up: [this.createDogSprite('up', 0), this.createDogSprite('up', 1)],
            left: [this.createDogSprite('left', 0), this.createDogSprite('left', 1)],
            right: [this.createDogSprite('right', 0), this.createDogSprite('right', 1)]
        };
        
        // Man character sprites
        this.manSprites = {
            down: [this.createManSprite('down', 0), this.createManSprite('down', 1)],
            up: [this.createManSprite('up', 0), this.createManSprite('up', 1)],
            left: [this.createManSprite('left', 0), this.createManSprite('left', 1)],
            right: [this.createManSprite('right', 0), this.createManSprite('right', 1)]
        };
        
        // Realistic garden element sprites
        this.treeSprite = this.createRealistic3DTreeSprite();
        this.flowerBedSprite = this.createRealistic3DFlowerBedSprite();
        this.bushSprite = this.createRealistic3DBushSprite();
        this.pondSprite = this.createRealistic3DPondSprite();
        this.benchSprite = this.createRealistic3DBenchSprite();
        
        // Building sprites
        this.dentalClinicSprite = this.createDentalClinicSprite();
        this.homeSprite = this.createHomeSprite();
        this.sushiroSprite = this.createSushiroSprite();
        this.windmillSprite = this.createWindmillSprite();
        
        // Special items
        this.bikeSprite = this.createBikeSprite();
        
        // Background with depth
        this.createRealisticBackground();
    }
    
    createRealisticPlayerSprite(direction, frame) {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        // Enable antialiasing
        ctx.imageSmoothingEnabled = true;
        
        // Create gradients for 3D effect
        const skinGradient = ctx.createLinearGradient(0, 0, 0, 48);
        skinGradient.addColorStop(0, '#FFECD1');
        skinGradient.addColorStop(0.7, '#FFDBAC');
        skinGradient.addColorStop(1, '#E8C5A0');
        
        const dressGradient = ctx.createLinearGradient(0, 18, 0, 45);
        dressGradient.addColorStop(0, '#FF69B4');
        dressGradient.addColorStop(0.5, '#FF1493');
        dressGradient.addColorStop(1, '#C71585');
        
        const hairGradient = ctx.createLinearGradient(0, 8, 0, 20);
        hairGradient.addColorStop(0, '#8B4513');
        hairGradient.addColorStop(0.5, '#654321');
        hairGradient.addColorStop(1, '#4A3018');
        
        // Draw character with more realistic proportions
        const centerX = 24;
        const centerY = 24;
        
        // Body (dress) - even slimmer
        ctx.fillStyle = dressGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 6, 7, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Head (more rounded and realistic) - smaller for slim look
        ctx.fillStyle = skinGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 8, 6.5, 7.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Hair (longer, more feminine style)
        ctx.fillStyle = hairGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 12, 10, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Hair sides (shoulder-length)
        ctx.beginPath();
        ctx.ellipse(centerX - 7, centerY - 6, 4, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 7, centerY - 6, 4, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes (more realistic)
        ctx.fillStyle = '#FFFFFF';
        if (direction === 'down' || direction === 'up') {
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY - 8, 2, 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY - 8, 2, 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY - 8, 1, 1, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY - 8, 1, 1, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Legs with walking animation (visible under dress)
        ctx.fillStyle = skinGradient;
        if (direction === 'down' || direction === 'up') {
            const legOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY + 20 - legOffset, 2.5, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY + 20 + legOffset, 2.5, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Side view legs
            const legOffset = frame === 1 ? 1 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 20 - legOffset, 3, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Shoes
        ctx.fillStyle = '#8B4513';
        if (direction === 'down' || direction === 'up') {
            const legOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY + 24 - legOffset, 3, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY + 24 + legOffset, 3, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            const legOffset = frame === 1 ? 1 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 24 - legOffset, 3.5, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Arms with realistic movement
        ctx.fillStyle = skinGradient;
        if (direction === 'left') {
            const armOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 8 - armOffset, centerY + 2, 3, 6, Math.PI / 6, 0, 2 * Math.PI);
            ctx.fill();
        } else if (direction === 'right') {
            const armOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX + 8 + armOffset, centerY + 2, 3, 6, -Math.PI / 6, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Front/back view arms
            const armSwing = frame === 1 ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(centerX - 8, centerY + 2 + armSwing, 3, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 8, centerY + 2 - armSwing, 3, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Add subtle highlights for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX - 2, centerY - 10, 3, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        return canvas;
    }
    
    createDogSprite(direction, frame) {
        const canvas = document.createElement('canvas');
        canvas.width = 36;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Golden retriever colors
        const goldenGradient = ctx.createLinearGradient(0, 0, 36, 24);
        goldenGradient.addColorStop(0, '#FFD700');
        goldenGradient.addColorStop(0.5, '#FFA500');
        goldenGradient.addColorStop(1, '#DAA520');
        
        const darkerGolden = '#B8860B';
        const centerX = 18;
        const centerY = 12;
        
        if (direction === 'left' || direction === 'right') {
            // Side view
            const flip = direction === 'left';
            if (flip) {
                ctx.scale(-1, 1);
                ctx.translate(-36, 0);
            }
            
            // Body (oval)
            ctx.fillStyle = goldenGradient;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 2, 12, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head
            ctx.beginPath();
            ctx.ellipse(centerX + 10, centerY - 2, 6, 5, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ears (floppy)
            ctx.fillStyle = darkerGolden;
            ctx.beginPath();
            ctx.ellipse(centerX + 8, centerY - 6, 3, 4, Math.PI/6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 12, centerY - 6, 3, 4, -Math.PI/6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Nose
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX + 15, centerY - 2, 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eye
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX + 12, centerY - 3, 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Legs with running animation
            ctx.fillStyle = goldenGradient;
            const legOffset = frame === 1 ? 2 : 0;
            
            // Front legs
            ctx.fillRect(centerX + 8 - legOffset, centerY + 6, 2, 6);
            ctx.fillRect(centerX + 12 + legOffset, centerY + 6, 2, 6);
            
            // Back legs
            ctx.fillRect(centerX + 2 + legOffset, centerY + 6, 2, 6);
            ctx.fillRect(centerX + 6 - legOffset, centerY + 6, 2, 6);
            
            // Tail (wagging)
            const tailWag = frame === 1 ? 1 : -1;
            ctx.strokeStyle = goldenGradient.createPattern ? darkerGolden : darkerGolden;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY);
            ctx.quadraticCurveTo(centerX - 15, centerY - 3 + tailWag, centerX - 18, centerY + tailWag);
            ctx.stroke();
            
        } else {
            // Front/back view
            // Body
            ctx.fillStyle = goldenGradient;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 2, 8, 7, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - 4, 6, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ears
            ctx.fillStyle = darkerGolden;
            ctx.beginPath();
            ctx.ellipse(centerX - 4, centerY - 7, 3, 4, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 4, centerY - 7, 3, 4, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 4, 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 2, centerY - 4, 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Nose
            ctx.beginPath();
            ctx.arc(centerX, centerY - 1, 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Legs (running animation)
            ctx.fillStyle = goldenGradient;
            const legOffset = frame === 1 ? 1 : 0;
            
            ctx.fillRect(centerX - 6, centerY + 6 - legOffset, 2, 6);
            ctx.fillRect(centerX - 2, centerY + 6 + legOffset, 2, 6);
            ctx.fillRect(centerX + 2, centerY + 6 - legOffset, 2, 6);
            ctx.fillRect(centerX + 6, centerY + 6 + legOffset, 2, 6);
            
            if (direction === 'down') {
                // Tail visible from behind
                ctx.strokeStyle = darkerGolden;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + 8);
                ctx.lineTo(centerX + (frame === 1 ? 2 : -2), centerY + 12);
                ctx.stroke();
            }
        }
        
        return canvas;
    }
    
    createManSprite(direction, frame) {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Create gradients for 3D effect
        const skinGradient = ctx.createLinearGradient(0, 0, 0, 48);
        skinGradient.addColorStop(0, '#FFECD1');
        skinGradient.addColorStop(0.7, '#FFDBAC');
        skinGradient.addColorStop(1, '#E8C5A0');
        
        const shirtGradient = ctx.createLinearGradient(0, 20, 0, 40);
        shirtGradient.addColorStop(0, '#32CD32');
        shirtGradient.addColorStop(0.5, '#228B22');
        shirtGradient.addColorStop(1, '#006400');
        
        const pantsGradient = ctx.createLinearGradient(0, 30, 0, 48);
        pantsGradient.addColorStop(0, '#4682B4');
        pantsGradient.addColorStop(0.5, '#4169E1');
        pantsGradient.addColorStop(1, '#191970');
        
        const hairGradient = ctx.createLinearGradient(0, 8, 0, 18);
        hairGradient.addColorStop(0, '#654321');
        hairGradient.addColorStop(0.5, '#4A3018');
        hairGradient.addColorStop(1, '#2F1B0C');
        
        const centerX = 24;
        const centerY = 24;
        
        // Body (shirt) - broader than lady
        ctx.fillStyle = shirtGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 2, 12, 14, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Head
        ctx.fillStyle = skinGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 8, 8, 9, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Hair (short, masculine)
        ctx.fillStyle = hairGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 12, 9, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        if (direction === 'down' || direction === 'up') {
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY - 8, 2, 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY - 8, 2, 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.ellipse(centerX - 3, centerY - 8, 1, 1, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 3, centerY - 8, 1, 1, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Legs with walking animation
        ctx.fillStyle = pantsGradient;
        if (direction === 'down' || direction === 'up') {
            const legOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 4, centerY + 18 - legOffset, 3.5, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 4, centerY + 18 + legOffset, 3.5, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            const legOffset = frame === 1 ? 1 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 18 - legOffset, 4, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Arms with realistic movement
        ctx.fillStyle = skinGradient;
        if (direction === 'left') {
            const armOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 10 - armOffset, centerY + 2, 3.5, 7, Math.PI / 6, 0, 2 * Math.PI);
            ctx.fill();
        } else if (direction === 'right') {
            const armOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX + 10 + armOffset, centerY + 2, 3.5, 7, -Math.PI / 6, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            const armSwing = frame === 1 ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(centerX - 10, centerY + 2 + armSwing, 3.5, 7, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 10, centerY + 2 - armSwing, 3.5, 7, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Shoes
        ctx.fillStyle = '#654321';
        if (direction === 'down' || direction === 'up') {
            const legOffset = frame === 1 ? 2 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX - 4, centerY + 24 - legOffset, 4, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 4, centerY + 24 + legOffset, 4, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            const legOffset = frame === 1 ? 1 : 0;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 24 - legOffset, 4.5, 2, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        return canvas;
    }
    
    createRealistic3DTreeSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Tree trunk with 3D shading
        const trunkGradient = ctx.createLinearGradient(30, 0, 50, 0);
        trunkGradient.addColorStop(0, '#8B4513');
        trunkGradient.addColorStop(0.3, '#A0522D');
        trunkGradient.addColorStop(0.7, '#8B4513');
        trunkGradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = trunkGradient;
        ctx.beginPath();
        ctx.ellipse(40, 90, 8, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tree bark texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(35, 70 + i * 8);
            ctx.lineTo(45, 70 + i * 8);
            ctx.stroke();
        }
        
        // Tree crown with multiple layers for depth
        const crownGradient = ctx.createRadialGradient(40, 40, 10, 40, 40, 35);
        crownGradient.addColorStop(0, '#90EE90');
        crownGradient.addColorStop(0.4, '#32CD32');
        crownGradient.addColorStop(0.8, '#228B22');
        crownGradient.addColorStop(1, '#006400');
        
        // Multiple crown layers for 3D effect
        ctx.fillStyle = crownGradient;
        ctx.beginPath();
        ctx.ellipse(40, 45, 35, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Highlight layer
        ctx.fillStyle = 'rgba(144, 238, 144, 0.6)';
        ctx.beginPath();
        ctx.ellipse(35, 35, 15, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Individual leaves for detail
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * 2 * Math.PI;
            const x = 40 + Math.cos(angle) * (25 + Math.random() * 10);
            const y = 45 + Math.sin(angle) * (20 + Math.random() * 8);
            ctx.beginPath();
            ctx.ellipse(x, y, 2, 3, angle, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        return canvas;
    }
    
    createRealistic3DFlowerBedSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Soil with 3D depth
        const soilGradient = ctx.createLinearGradient(0, 24, 0, 48);
        soilGradient.addColorStop(0, '#A0522D');
        soilGradient.addColorStop(0.5, '#8B4513');
        soilGradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = soilGradient;
        ctx.beginPath();
        ctx.ellipse(48, 36, 45, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Realistic flowers with petals
        const flowerColors = [
            ['#FF69B4', '#FF1493', '#DC143C'],
            ['#FFD700', '#FFA500', '#FF8C00'],
            ['#9370DB', '#8A2BE2', '#4B0082'],
            ['#00CED1', '#20B2AA', '#008B8B'],
            ['#FF6347', '#FF4500', '#DC143C']
        ];
        
        for (let i = 0; i < 12; i++) {
            const x = 15 + (i % 4) * 18 + Math.random() * 8;
            const y = 20 + Math.floor(i / 4) * 12 + Math.random() * 6;
            const colorSet = flowerColors[i % flowerColors.length];
            
            // Flower stem
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 15);
            ctx.stroke();
            
            // Flower petals (5 petals)
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * 2 * Math.PI;
                const petalX = x + Math.cos(angle) * 3;
                const petalY = y + Math.sin(angle) * 3;
                
                const petalGradient = ctx.createRadialGradient(petalX, petalY, 0, petalX, petalY, 3);
                petalGradient.addColorStop(0, colorSet[0]);
                petalGradient.addColorStop(0.7, colorSet[1]);
                petalGradient.addColorStop(1, colorSet[2]);
                
                ctx.fillStyle = petalGradient;
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, 2.5, 4, angle, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Flower center
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(x, y, 1.5, 1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Small grass blades around flowers
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 96;
            const y = 35 + Math.random() * 8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 4 - 2, y - Math.random() * 6);
            ctx.stroke();
        }
        
        return canvas;
    }
    
    createRealistic3DBushSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Bush with layered 3D effect
        const bushGradient = ctx.createRadialGradient(24, 18, 5, 24, 18, 20);
        bushGradient.addColorStop(0, '#90EE90');
        bushGradient.addColorStop(0.3, '#32CD32');
        bushGradient.addColorStop(0.7, '#228B22');
        bushGradient.addColorStop(1, '#006400');
        
        // Main bush body
        ctx.fillStyle = bushGradient;
        ctx.beginPath();
        ctx.ellipse(24, 20, 20, 14, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Additional bush clusters for natural look
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const x = 24 + Math.cos(angle) * 12;
            const y = 20 + Math.sin(angle) * 8;
            
            ctx.fillStyle = i % 2 === 0 ? '#32CD32' : '#228B22';
            ctx.beginPath();
            ctx.ellipse(x, y, 4 + Math.random() * 3, 4 + Math.random() * 3, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Highlights
        ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
        ctx.beginPath();
        ctx.ellipse(20, 15, 8, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        return canvas;
    }
    
    createRealistic3DPondSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Pond edge (stone border)
        const stoneGradient = ctx.createLinearGradient(0, 0, 0, 96);
        stoneGradient.addColorStop(0, '#D3D3D3');
        stoneGradient.addColorStop(0.5, '#A9A9A9');
        stoneGradient.addColorStop(1, '#808080');
        
        ctx.fillStyle = stoneGradient;
        ctx.beginPath();
        ctx.ellipse(64, 48, 60, 44, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Water with realistic reflection
        const waterGradient = ctx.createRadialGradient(64, 48, 10, 64, 48, 50);
        waterGradient.addColorStop(0, '#87CEEB');
        waterGradient.addColorStop(0.3, '#4169E1');
        waterGradient.addColorStop(0.8, '#191970');
        waterGradient.addColorStop(1, '#000080');
        
        ctx.fillStyle = waterGradient;
        ctx.beginPath();
        ctx.ellipse(64, 48, 52, 36, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Water ripples
        ctx.strokeStyle = 'rgba(135, 206, 235, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const radius = 15 + i * 8;
            ctx.beginPath();
            ctx.ellipse(64, 48, radius, radius * 0.7, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Water surface highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(50, 35, 15, 8, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(78, 42, 10, 5, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        
        return canvas;
    }
    
    createRealistic3DBenchSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Bench wood gradient
        const woodGradient = ctx.createLinearGradient(0, 0, 0, 36);
        woodGradient.addColorStop(0, '#D2B48C');
        woodGradient.addColorStop(0.3, '#A0522D');
        woodGradient.addColorStop(0.7, '#8B4513');
        woodGradient.addColorStop(1, '#654321');
        
        // Bench seat with 3D perspective
        ctx.fillStyle = woodGradient;
        ctx.beginPath();
        ctx.moveTo(8, 18);
        ctx.lineTo(64, 18);
        ctx.lineTo(68, 22);
        ctx.lineTo(4, 22);
        ctx.closePath();
        ctx.fill();
        
        // Bench back
        ctx.beginPath();
        ctx.moveTo(8, 10);
        ctx.lineTo(64, 10);
        ctx.lineTo(68, 14);
        ctx.lineTo(4, 14);
        ctx.closePath();
        ctx.fill();
        
        // Bench legs with shadow
        ctx.fillStyle = '#654321';
        // Left legs
        ctx.fillRect(10, 22, 4, 12);
        ctx.fillRect(14, 24, 2, 10); // Shadow side
        
        // Right legs
        ctx.fillRect(58, 22, 4, 12);
        ctx.fillRect(62, 24, 2, 10); // Shadow side
        
        // Wood texture
        ctx.strokeStyle = 'rgba(101, 67, 33, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(8 + i * 18, 18);
            ctx.lineTo(8 + i * 18, 22);
            ctx.stroke();
        }
        
        return canvas;
    }
    
    createDentalClinicSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Building base with 3D perspective
        const buildingGradient = ctx.createLinearGradient(0, 0, 0, 120);
        buildingGradient.addColorStop(0, '#E6F3FF');
        buildingGradient.addColorStop(0.7, '#B3D9FF');
        buildingGradient.addColorStop(1, '#87CEEB');
        
        ctx.fillStyle = buildingGradient;
        ctx.beginPath();
        ctx.moveTo(10, 90);
        ctx.lineTo(130, 90);
        ctx.lineTo(140, 80);
        ctx.lineTo(20, 80);
        ctx.closePath();
        ctx.fill();
        
        // Roof
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.moveTo(5, 80);
        ctx.lineTo(135, 80);
        ctx.lineTo(145, 70);
        ctx.lineTo(15, 70);
        ctx.closePath();
        ctx.fill();
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(25, 85, 15, 12);
        ctx.fillRect(50, 85, 15, 12);
        ctx.fillRect(75, 85, 15, 12);
        ctx.fillRect(100, 85, 15, 12);
        
        // Window frames
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.strokeRect(25, 85, 15, 12);
        ctx.strokeRect(50, 85, 15, 12);
        ctx.strokeRect(75, 85, 15, 12);
        ctx.strokeRect(100, 85, 15, 12);
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(118, 85, 12, 20);
        ctx.strokeStyle = '#654321';
        ctx.strokeRect(118, 85, 12, 20);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(127, 95, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dental sign
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(35, 75, 40, 8);
        ctx.strokeStyle = '#4169E1';
        ctx.strokeRect(35, 75, 40, 8);
        
        // Sign text
        ctx.fillStyle = '#4169E1';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DENTAL', 55, 81);
        
        // Dental cross symbol
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(79, 76, 6, 2);
        ctx.fillRect(81, 74, 2, 6);
        
        return canvas;
    }
    
    createHomeSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 110;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // House walls with 3D effect
        const wallGradient = ctx.createLinearGradient(0, 0, 0, 110);
        wallGradient.addColorStop(0, '#FFE4B5');
        wallGradient.addColorStop(0.7, '#DEB887');
        wallGradient.addColorStop(1, '#D2B48C');
        
        ctx.fillStyle = wallGradient;
        ctx.beginPath();
        ctx.moveTo(15, 85);
        ctx.lineTo(115, 85);
        ctx.lineTo(125, 75);
        ctx.lineTo(25, 75);
        ctx.closePath();
        ctx.fill();
        
        // Triangular roof
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(10, 75);
        ctx.lineTo(70, 30);
        ctx.lineTo(130, 75);
        ctx.closePath();
        ctx.fill();
        
        // Roof highlight
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(10, 75);
        ctx.lineTo(70, 30);
        ctx.lineTo(70, 35);
        ctx.lineTo(15, 75);
        ctx.closePath();
        ctx.fill();
        
        // Chimney
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(85, 40, 8, 25);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(83, 38, 12, 4);
        
        // Front door
        ctx.fillStyle = '#654321';
        ctx.fillRect(60, 75, 20, 25);
        ctx.strokeStyle = '#4A3018';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 75, 20, 25);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(77, 87, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(30, 78, 18, 14);
        ctx.fillRect(92, 78, 18, 14);
        
        // Window frames and cross
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 78, 18, 14);
        ctx.strokeRect(92, 78, 18, 14);
        
        // Window cross
        ctx.beginPath();
        ctx.moveTo(39, 78);
        ctx.lineTo(39, 92);
        ctx.moveTo(30, 85);
        ctx.lineTo(48, 85);
        ctx.moveTo(101, 78);
        ctx.lineTo(101, 92);
        ctx.moveTo(92, 85);
        ctx.lineTo(110, 85);
        ctx.stroke();
        
        // Garden flowers in front
        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 5; i++) {
            const x = 20 + i * 20;
            const y = 95;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        return canvas;
    }
    
    createSushiroSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Building base
        const buildingGradient = ctx.createLinearGradient(0, 0, 0, 100);
        buildingGradient.addColorStop(0, '#FFF8DC');
        buildingGradient.addColorStop(0.7, '#F5DEB3');
        buildingGradient.addColorStop(1, '#DEB887');
        
        ctx.fillStyle = buildingGradient;
        ctx.beginPath();
        ctx.moveTo(10, 80);
        ctx.lineTo(150, 80);
        ctx.lineTo(160, 70);
        ctx.lineTo(20, 70);
        ctx.closePath();
        ctx.fill();
        
        // Red curved roof (Japanese style)
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.moveTo(5, 70);
        ctx.quadraticCurveTo(90, 50, 175, 70);
        ctx.lineTo(165, 60);
        ctx.quadraticCurveTo(90, 40, 15, 60);
        ctx.closePath();
        ctx.fill();
        
        // Sushiro sign background
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.roundRect(35, 65, 110, 12, 2);
        ctx.fill();
        
        // Sign text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SUSHIRO', 90, 73);
        
        // Conveyor belt windows
        ctx.fillStyle = '#000000';
        ctx.fillRect(25, 75, 120, 3);
        
        // Sushi on conveyor belt
        const sushiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        for (let i = 0; i < 8; i++) {
            const x = 30 + i * 15;
            ctx.fillStyle = sushiColors[i % sushiColors.length];
            ctx.beginPath();
            ctx.arc(x, 76.5, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(30, 78, 15, 10);
        ctx.fillRect(55, 78, 15, 10);
        ctx.fillRect(80, 78, 15, 10);
        ctx.fillRect(105, 78, 15, 10);
        ctx.fillRect(130, 78, 15, 10);
        
        // Window frames
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 78, 15, 10);
        ctx.strokeRect(55, 78, 15, 10);
        ctx.strokeRect(80, 78, 15, 10);
        ctx.strokeRect(105, 78, 15, 10);
        ctx.strokeRect(130, 78, 15, 10);
        
        // Entrance
        ctx.fillStyle = '#654321';
        ctx.fillRect(150, 75, 15, 20);
        
        // Japanese noren curtain
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(148, 70, 19, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('寿司', 157.5, 78);
        
        return canvas;
    }
    
    createWindmillSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Windmill tower (cylindrical base)
        const towerGradient = ctx.createLinearGradient(0, 0, 120, 0);
        towerGradient.addColorStop(0, '#F5F5DC'); // Beige
        towerGradient.addColorStop(0.3, '#FFFFFF');
        towerGradient.addColorStop(0.7, '#E6E6FA');
        towerGradient.addColorStop(1, '#D3D3D3');
        
        ctx.fillStyle = towerGradient;
        ctx.beginPath();
        ctx.ellipse(60, 120, 25, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tower shadow side
        ctx.fillStyle = 'rgba(169, 169, 169, 0.3)';
        ctx.beginPath();
        ctx.ellipse(70, 120, 12, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Windmill cap/roof (conical)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(35, 60);
        ctx.lineTo(60, 20);
        ctx.lineTo(85, 60);
        ctx.closePath();
        ctx.fill();
        
        // Cap highlight
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(35, 60);
        ctx.lineTo(60, 20);
        ctx.lineTo(60, 25);
        ctx.lineTo(40, 60);
        ctx.closePath();
        ctx.fill();
        
        // Windmill blades center hub
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(60, 80, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Windmill blades (4 blades in X formation)
        ctx.fillStyle = '#F0F8FF';
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        
        // Blade 1 (top-right)
        ctx.beginPath();
        ctx.ellipse(85, 55, 25, 8, Math.PI/4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Blade 2 (bottom-right)
        ctx.beginPath();
        ctx.ellipse(85, 105, 25, 8, -Math.PI/4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Blade 3 (bottom-left)
        ctx.beginPath();
        ctx.ellipse(35, 105, 25, 8, Math.PI/4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Blade 4 (top-left)
        ctx.beginPath();
        ctx.ellipse(35, 55, 25, 8, -Math.PI/4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Windows on the tower
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(50, 90, 12, 15);
        ctx.fillRect(50, 110, 12, 15);
        ctx.fillRect(50, 130, 12, 15);
        
        // Window frames
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 90, 12, 15);
        ctx.strokeRect(50, 110, 12, 15);
        ctx.strokeRect(50, 130, 12, 15);
        
        // Window crosses
        ctx.beginPath();
        ctx.moveTo(56, 90);
        ctx.lineTo(56, 105);
        ctx.moveTo(50, 97.5);
        ctx.lineTo(62, 97.5);
        ctx.moveTo(56, 110);
        ctx.lineTo(56, 125);
        ctx.moveTo(50, 117.5);
        ctx.lineTo(62, 117.5);
        ctx.moveTo(56, 130);
        ctx.lineTo(56, 145);
        ctx.moveTo(50, 137.5);
        ctx.lineTo(62, 137.5);
        ctx.stroke();
        
        // Door at base
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(52, 160, 16, 20, 2);
        ctx.fill();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(65, 170, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        // Small decorative details
        ctx.fillStyle = '#2F4F4F';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('1902', 60, 155);
        
        return canvas;
    }
    
    createBikeSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Bike frame (main triangle)
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 8);  // Top tube start
        ctx.lineTo(32, 8);  // Top tube
        ctx.lineTo(32, 22); // Seat tube
        ctx.lineTo(12, 22); // Down tube
        ctx.closePath();
        ctx.stroke();
        
        // Wheels
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 2;
        
        // Front wheel
        ctx.beginPath();
        ctx.arc(10, 24, 6, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Back wheel
        ctx.beginPath();
        ctx.arc(34, 24, 6, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Wheel spokes
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 1;
        
        // Front wheel spokes
        ctx.beginPath();
        ctx.moveTo(4, 24);
        ctx.lineTo(16, 24);
        ctx.moveTo(10, 18);
        ctx.lineTo(10, 30);
        ctx.stroke();
        
        // Back wheel spokes
        ctx.beginPath();
        ctx.moveTo(28, 24);
        ctx.lineTo(40, 24);
        ctx.moveTo(34, 18);
        ctx.lineTo(34, 30);
        ctx.stroke();
        
        // Handlebars
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 8);
        ctx.lineTo(8, 4);
        ctx.moveTo(6, 4);
        ctx.lineTo(10, 4);
        ctx.stroke();
        
        // Seat
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(32, 6, 4, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Pedals
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, 22);
        ctx.lineTo(18, 24);
        ctx.moveTo(20, 22);
        ctx.lineTo(22, 24);
        ctx.stroke();
        
        // Chain (simplified)
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(22, 24);
        ctx.lineTo(30, 26);
        ctx.stroke();
        
        return canvas;
    }
    
    createRealisticBackground() {
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.worldWidth;
        this.backgroundCanvas.height = this.worldHeight;
        const ctx = this.backgroundCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Sky gradient (for outdoor feeling)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.7, '#98FB98');
        skyGradient.addColorStop(1, '#90EE90');
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.worldWidth, 300);
        
        // Ground grass with realistic texture
        const grassGradient = ctx.createLinearGradient(0, 300, 0, this.worldHeight);
        grassGradient.addColorStop(0, '#98FB98');
        grassGradient.addColorStop(0.5, '#90EE90');
        grassGradient.addColorStop(1, '#7CFC00');
        
        ctx.fillStyle = grassGradient;
        ctx.fillRect(0, 300, this.worldWidth, this.worldHeight - 300);
        
        // Realistic grass texture with individual blades
        ctx.strokeStyle = 'rgba(50, 205, 50, 0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.worldWidth; i += 4) {
            for (let j = 320; j < this.worldHeight; j += 6) {
                if (Math.random() > 0.3) {
                    const grassHeight = 3 + Math.random() * 4;
                    ctx.beginPath();
                    ctx.moveTo(i + Math.random() * 3, j);
                    ctx.lineTo(i + Math.random() * 3, j - grassHeight);
                    ctx.stroke();
                }
            }
        }
        
        // Realistic stone paths with individual stones
        this.drawRealisticPaths(ctx);
        
        // Add distant background elements for depth
        this.drawDistantElements(ctx);
    }
    
    drawRealisticPaths(ctx) {
        const pathPositions = [
            { x: 0, y: 600, width: this.worldWidth, height: 80 },
            { x: 300, y: 350, width: 80, height: 450 },
            { x: 750, y: 400, width: 80, height: 400 },
            { x: 1200, y: 200, width: 80, height: 600 }
        ];
        
        pathPositions.forEach(path => {
            // Path base
            ctx.fillStyle = '#D3D3D3';
            ctx.fillRect(path.x, path.y, path.width, path.height);
            
            // Individual stones with realistic lighting
            for (let x = path.x; x < path.x + path.width; x += 25) {
                for (let y = path.y; y < path.y + path.height; y += 25) {
                    const stoneX = x + Math.random() * 10;
                    const stoneY = y + Math.random() * 10;
                    const stoneSize = 15 + Math.random() * 10;
                    
                    // Stone gradient for 3D effect
                    const stoneGradient = ctx.createRadialGradient(
                        stoneX, stoneY, 0, 
                        stoneX, stoneY, stoneSize
                    );
                    stoneGradient.addColorStop(0, '#F0F0F0');
                    stoneGradient.addColorStop(0.7, '#D3D3D3');
                    stoneGradient.addColorStop(1, '#A9A9A9');
                    
                    ctx.fillStyle = stoneGradient;
                    ctx.beginPath();
                    ctx.ellipse(stoneX, stoneY, stoneSize/2, stoneSize/2, 0, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Stone shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.beginPath();
                    ctx.ellipse(stoneX + 2, stoneY + 2, stoneSize/2, stoneSize/2, 0, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        });
    }
    
    drawDistantElements(ctx) {
        // Distant mountains for depth
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(200, 80);
        ctx.lineTo(400, 120);
        ctx.lineTo(600, 60);
        ctx.lineTo(800, 100);
        ctx.lineTo(1000, 70);
        ctx.lineTo(1200, 110);
        ctx.lineTo(1400, 90);
        ctx.lineTo(1600, 130);
        ctx.lineTo(1800, 100);
        ctx.lineTo(1800, 300);
        ctx.lineTo(0, 300);
        ctx.closePath();
        ctx.fill();
        
        // Distant trees
        ctx.fillStyle = 'rgba(34, 139, 34, 0.4)';
        for (let i = 100; i < this.worldWidth; i += 150) {
            ctx.beginPath();
            ctx.ellipse(i, 180, 20, 30, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    createAmbientParticles() {
        // Create floating leaves and dust particles
        for (let i = 0; i < 50; i++) {
            this.ambientParticles.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                velocityX: (Math.random() - 0.5) * 0.5,
                velocityY: Math.random() * 0.2,
                size: 2 + Math.random() * 3,
                color: `rgba(${100 + Math.random() * 100}, ${150 + Math.random() * 100}, ${50 + Math.random() * 50}, ${0.3 + Math.random() * 0.4})`,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                life: Math.random() * 1000
            });
        }
    }
    
    createGarden() {
        // Trees with more realistic spacing
        const treePositions = [
            {x: 150, y: 150}, {x: 450, y: 200}, {x: 800, y: 120},
            {x: 1000, y: 280}, {x: 1500, y: 150}, {x: 200, y: 800},
            {x: 600, y: 950}, {x: 1000, y: 1100}, {x: 1400, y: 900},
            {x: 100, y: 500}, {x: 1600, y: 500}
        ];
        
        treePositions.forEach(pos => {
            this.gardenElements.push({
                type: 'tree',
                x: pos.x,
                y: pos.y,
                width: 80,
                height: 120,
                solid: true,
                shadowOffsetX: 8,
                shadowOffsetY: 12
            });
        });
        
        // Flower beds
        const flowerPositions = [
            {x: 100, y: 450}, {x: 500, y: 380}, {x: 900, y: 500},
            {x: 1300, y: 450}, {x: 400, y: 750}, {x: 800, y: 850},
            {x: 1200, y: 800}, {x: 300, y: 1000}, {x: 700, y: 1150}
        ];
        
        flowerPositions.forEach(pos => {
            this.gardenElements.push({
                type: 'flowerbed',
                x: pos.x,
                y: pos.y,
                width: 96,
                height: 48,
                solid: false,
                shadowOffsetX: 2,
                shadowOffsetY: 3
            });
        });
        
        // Bushes
        const bushPositions = [
            {x: 250, y: 300}, {x: 650, y: 250}, {x: 1050, y: 350},
            {x: 1450, y: 300}, {x: 350, y: 650}, {x: 750, y: 700},
            {x: 1150, y: 650}, {x: 200, y: 1200}, {x: 600, y: 1200}
        ];
        
        bushPositions.forEach(pos => {
            this.gardenElements.push({
                type: 'bush',
                x: pos.x,
                y: pos.y,
                width: 48,
                height: 36,
                solid: true,
                shadowOffsetX: 4,
                shadowOffsetY: 6
            });
        });
        
        // Ponds
        const pondPositions = [
            {x: 600, y: 200}, {x: 1100, y: 600}, {x: 400, y: 1000}
        ];
        
        pondPositions.forEach(pos => {
            this.gardenElements.push({
                type: 'pond',
                x: pos.x,
                y: pos.y,
                width: 128,
                height: 96,
                solid: true,
                shadowOffsetX: 0,
                shadowOffsetY: 0
            });
        });
        
        // Benches
        const benchPositions = [
            {x: 270, y: 630}, {x: 780, y: 630}, {x: 1230, y: 630},
            {x: 500, y: 900}, {x: 1000, y: 1000}
        ];
        
        benchPositions.forEach(pos => {
            this.gardenElements.push({
                type: 'bench',
                x: pos.x,
                y: pos.y,
                width: 72,
                height: 36,
                solid: true,
                shadowOffsetX: 6,
                shadowOffsetY: 8
            });
        });
        
        // Buildings
        const buildingPositions = [
            {type: 'dentalclinic', x: 200, y: 200, width: 160, height: 120},
            {type: 'home', x: 800, y: 300, width: 140, height: 110},
            {type: 'sushiro', x: 1200, y: 150, width: 180, height: 100},
            {type: 'windmill', x: 500, y: 100, width: 120, height: 180}
        ];
        
        buildingPositions.forEach(pos => {
            this.gardenElements.push({
                type: pos.type,
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
                solid: true,
                shadowOffsetX: 10,
                shadowOffsetY: 15
            });
        });
        
        // Special items (bike) - make sure it's added to garden elements
        this.gardenElements.push({
            type: 'bike',
            x: this.bike.x,
            y: this.bike.y,
            width: this.bike.width,
            height: this.bike.height,
            solid: false,
            shadowOffsetX: 3,
            shadowOffsetY: 4
        });
        
        console.log('Bike added to garden at:', this.bike.x, this.bike.y);
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
        
        // Mobile touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates
            this.touch.targetX = touchX + this.camera.x;
            this.touch.targetY = touchY + this.camera.y;
            this.touch.isMovingToTarget = true;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
        
        // Mouse events for desktop compatibility
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Convert screen coordinates to world coordinates
            this.touch.targetX = clickX + this.camera.x;
            this.touch.targetY = clickY + this.camera.y;
            this.touch.isMovingToTarget = true;
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.time += 0.016; // Roughly 60fps
        
        // Handle input and movement
        this.handleInput();
        
        // Update camera with smooth following
        this.updateSmoothCamera();
        
        // Update animations
        this.updateAnimations();
        
        // Update dog behavior
        this.updateDog();
        
        // Update interaction system
        this.updateInteractions();
        
        // Update ambient particles
        this.updateAmbientParticles();
        
        // Update lighting (subtle changes over time)
        this.updateLighting();
    }
    
    updateSmoothCamera() {
        // Target position
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        // Smooth interpolation
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothness;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothness;
        
        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));
    }
    
    updateLighting() {
        // Subtle lighting changes over time
        this.lighting.sunAngle = Math.PI / 4 + Math.sin(this.time * 0.1) * 0.1;
        this.lighting.sunIntensity = 0.7 + Math.sin(this.time * 0.05) * 0.1;
    }
    
    updateAmbientParticles() {
        this.ambientParticles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.rotation += particle.rotationSpeed;
            particle.life--;
            
            // Wrap around world
            if (particle.x > this.worldWidth) particle.x = 0;
            if (particle.x < 0) particle.x = this.worldWidth;
            if (particle.y > this.worldHeight) particle.y = 0;
            
            // Reset particle if life expired
            if (particle.life <= 0) {
                particle.x = Math.random() * this.worldWidth;
                particle.y = Math.random() * this.worldHeight;
                particle.life = 500 + Math.random() * 500;
            }
        });
    }
    
    handleInput() {
        const oldX = this.player.x;
        const oldY = this.player.y;
        let newX = this.player.x;
        let newY = this.player.y;
        this.player.isMoving = false;
        
        // 8-directional movement with diagonal speed adjustment
        let moveX = 0, moveY = 0;
        
        // Handle touch/click movement
        if (this.touch.isMovingToTarget && this.touch.targetX !== null && this.touch.targetY !== null) {
            const deltaX = this.touch.targetX - (this.player.x + this.player.width / 2);
            const deltaY = this.touch.targetY - (this.player.y + this.player.height / 2);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 5) { // Continue moving if not close enough
                moveX = deltaX / distance;
                moveY = deltaY / distance;
                this.player.isMoving = true;
                
                // Set facing direction based on movement
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.player.facing = deltaX > 0 ? 'right' : 'left';
                } else {
                    this.player.facing = deltaY > 0 ? 'down' : 'up';
                }
            } else {
                // Reached target
                this.touch.isMovingToTarget = false;
                this.touch.targetX = null;
                this.touch.targetY = null;
            }
        }
        
        // Handle keyboard input (takes priority over touch)
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            moveX = -1;
            this.player.facing = 'left';
            this.player.isMoving = true;
            this.touch.isMovingToTarget = false; // Cancel touch movement
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            moveX = 1;
            this.player.facing = 'right';
            this.player.isMoving = true;
            this.touch.isMovingToTarget = false;
        }
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            moveY = -1;
            this.player.facing = 'up';
            this.player.isMoving = true;
            this.touch.isMovingToTarget = false;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            moveY = 1;
            this.player.facing = 'down';
            this.player.isMoving = true;
            this.touch.isMovingToTarget = false;
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }
        
        newX += moveX * this.player.speed;
        newY += moveY * this.player.speed;
        
        // Check world boundaries
        newX = Math.max(0, Math.min(this.worldWidth - this.player.width, newX));
        newY = Math.max(0, Math.min(this.worldHeight - this.player.height, newY));
        
        // Check collisions with garden elements
        const playerRect = {x: newX, y: newY, width: this.player.width, height: this.player.height};
        let collision = false;
        
        for (let element of this.gardenElements) {
            if (element.solid && this.checkCollision(playerRect, element)) {
                collision = true;
                break;
            }
        }
        
        // Only update position if no collision
        if (!collision) {
            this.player.x = newX;
            this.player.y = newY;
        } else if (this.touch.isMovingToTarget) {
            // If collision during touch movement, cancel the touch target
            this.touch.isMovingToTarget = false;
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateAnimations() {
        if (this.player.isMoving) {
            this.player.animTimer++;
            if (this.player.animTimer > 20) { // Slower, more realistic animation
                this.player.animFrame = (this.player.animFrame + 1) % 2;
                this.player.animTimer = 0;
            }
        } else {
            this.player.animFrame = 0;
        }
        
        // Dog animation
        this.dog.animTimer++;
        if (this.dog.animTimer > 15) { // Faster animation for energetic dog
            this.dog.animFrame = (this.dog.animFrame + 1) % 2;
            this.dog.animTimer = 0;
        }
    }
    
    updateDog() {
        this.dog.behaviorTimer++;
        
        // Dog behavior state machine
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.dog.x - this.player.x, 2) + 
            Math.pow(this.dog.y - this.player.y, 2)
        );
        
        // Change behavior based on distance to player and timer
        if (distanceToPlayer > 200 && this.dog.behaviorState !== 'following') {
            this.dog.behaviorState = 'following';
            this.dog.behaviorTimer = 0;
        } else if (distanceToPlayer < 80 && this.dog.behaviorTimer > 300) {
            this.dog.behaviorState = 'wandering';
            this.dog.behaviorTimer = 0;
        } else if (this.dog.behaviorTimer > 600) {
            // Randomly change behavior
            const behaviors = ['wandering', 'playing'];
            this.dog.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
            this.dog.behaviorTimer = 0;
        }
        
        // Execute behavior
        let targetX = this.dog.targetX;
        let targetY = this.dog.targetY;
        
        switch (this.dog.behaviorState) {
            case 'following':
                targetX = this.player.x;
                targetY = this.player.y;
                break;
                
            case 'wandering':
                if (this.dog.behaviorTimer % 120 === 0) { // Change direction every 2 seconds
                    targetX = this.dog.x + (Math.random() - 0.5) * 200;
                    targetY = this.dog.y + (Math.random() - 0.5) * 200;
                    
                    // Keep within world bounds
                    targetX = Math.max(50, Math.min(this.worldWidth - 50, targetX));
                    targetY = Math.max(50, Math.min(this.worldHeight - 50, targetY));
                }
                break;
                
            case 'playing':
                // Run in circles or figure-8 patterns
                const playTime = this.dog.behaviorTimer * 0.05;
                targetX = this.player.x + Math.cos(playTime) * 100;
                targetY = this.player.y + Math.sin(playTime * 2) * 60;
                break;
        }
        
        this.dog.targetX = targetX;
        this.dog.targetY = targetY;
        
        // Move toward target
        const deltaX = this.dog.targetX - this.dog.x;
        const deltaY = this.dog.targetY - this.dog.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 5) {
            const moveX = (deltaX / distance) * this.dog.speed;
            const moveY = (deltaY / distance) * this.dog.speed;
            
            const newX = this.dog.x + moveX;
            const newY = this.dog.y + moveY;
            
            // Check collision with garden elements
            const dogRect = {x: newX, y: newY, width: this.dog.width, height: this.dog.height};
            let collision = false;
            
            for (let element of this.gardenElements) {
                if (element.solid && this.checkCollision(dogRect, element)) {
                    collision = true;
                    break;
                }
            }
            
            // Update position if no collision
            if (!collision) {
                this.dog.x = Math.max(0, Math.min(this.worldWidth - this.dog.width, newX));
                this.dog.y = Math.max(0, Math.min(this.worldHeight - this.dog.height, newY));
                
                // Update facing direction
                if (Math.abs(moveX) > Math.abs(moveY)) {
                    this.dog.facing = moveX > 0 ? 'right' : 'left';
                } else {
                    this.dog.facing = moveY > 0 ? 'down' : 'up';
                }
            } else {
                // If collision, pick a new random target
                this.dog.targetX = this.dog.x + (Math.random() - 0.5) * 100;
                this.dog.targetY = this.dog.y + (Math.random() - 0.5) * 100;
            }
        }
    }
    
    updateInteractions() {
        // Check distance to bike
        const distanceToBike = Math.sqrt(
            Math.pow(this.player.x - this.bike.x, 2) + 
            Math.pow(this.player.y - this.bike.y, 2)
        );
        
        // If player is near bike (within 80 pixels)
        if (distanceToBike < 80) {
            if (!this.man.visible) {
                // Man appears
                this.man.visible = true;
                this.man.facing = 'left'; // Face toward the player
                this.interaction.showingMessage = true;
                this.interaction.messageTimer = 0;
            }
        } else {
            // Man disappears when player moves away
            if (this.man.visible && distanceToBike > 120) {
                this.man.visible = false;
                this.interaction.showingMessage = false;
                this.interaction.messageTimer = 0;
            }
        }
        
        // Update message timer
        if (this.interaction.showingMessage) {
            this.interaction.messageTimer++;
            if (this.interaction.messageTimer > 300) { // Show for 5 seconds
                this.interaction.showingMessage = false;
            }
        }
        
        // Simple man animation when visible
        if (this.man.visible) {
            this.man.animTimer++;
            if (this.man.animTimer > 30) { // Slower, calm animation
                this.man.animFrame = (this.man.animFrame + 1) % 2;
                this.man.animTimer = 0;
            }
        }
        
        // Check distance to windmill (500, 100)
        const distanceToWindmill = Math.sqrt(
            Math.pow(this.player.x - 500, 2) + 
            Math.pow(this.player.y - 100, 2)
        );
        
        if (distanceToWindmill < 150 && !this.effects.windmill.spinning) {
            this.effects.windmill.spinning = true;
            this.effects.windmill.spinTimer = 0;
            this.effects.windmill.spinSpeed = 0.2;
        }
        
        // Update windmill spinning
        if (this.effects.windmill.spinning) {
            this.effects.windmill.spinTimer++;
            if (this.effects.windmill.spinTimer > 300) { // 5 seconds
                this.effects.windmill.spinning = false;
                this.effects.windmill.spinSpeed = 0;
            }
        }
        
        // Check distance to dental clinic (200, 200) - increased proximity
        const distanceToDental = Math.sqrt(
            Math.pow(this.player.x - 200, 2) + 
            Math.pow(this.player.y - 200, 2)
        );
        
        if (distanceToDental < 180 && !this.effects.dentalClinic.onFire) {
            this.effects.dentalClinic.onFire = true;
            this.effects.dentalClinic.fireTimer = 0;
            this.createFireParticles();
        }
        
        // Update dental clinic fire
        if (this.effects.dentalClinic.onFire) {
            this.effects.dentalClinic.fireTimer++;
            this.updateFireParticles();
            if (this.effects.dentalClinic.fireTimer > 300) { // 5 seconds
                this.effects.dentalClinic.onFire = false;
                this.effects.dentalClinic.fireParticles = [];
            }
        }
        
        // Check distance to sushiro (1200, 150)
        const distanceToSushiro = Math.sqrt(
            Math.pow(this.player.x - 1200, 2) + 
            Math.pow(this.player.y - 150, 2)
        );
        
        if (distanceToSushiro < 120 && !this.effects.sushiro.fishJumping) {
            this.effects.sushiro.fishJumping = true;
            this.effects.sushiro.fishTimer = 0;
            this.createJumpingFish();
        }
        
        // Update sushiro fish jumping
        if (this.effects.sushiro.fishJumping) {
            this.effects.sushiro.fishTimer++;
            this.updateJumpingFish();
            if (this.effects.sushiro.fishTimer > 300) { // 5 seconds
                this.effects.sushiro.fishJumping = false;
                this.effects.sushiro.jumpingFish = [];
            }
        }
        
        // Check distance to house (800, 300)
        const distanceToHouse = Math.sqrt(
            Math.pow(this.player.x - 800, 2) + 
            Math.pow(this.player.y - 300, 2)
        );
        
        if (distanceToHouse < 120 && !this.effects.house.heartsFloating) {
            this.effects.house.heartsFloating = true;
            this.effects.house.heartsTimer = 0;
            this.createFloatingHearts();
        }
        
        // Update house hearts floating
        if (this.effects.house.heartsFloating) {
            this.effects.house.heartsTimer++;
            this.updateFloatingHearts();
            if (this.effects.house.heartsTimer > 300) { // 5 seconds
                this.effects.house.heartsFloating = false;
                this.effects.house.hearts = [];
            }
        }
    }
    
    createFireParticles() {
        this.effects.dentalClinic.fireParticles = [];
        for (let i = 0; i < 30; i++) {
            this.effects.dentalClinic.fireParticles.push({
                x: 200 + Math.random() * 160,
                y: 200 + Math.random() * 120,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 4 - 2,
                life: Math.random() * 80 + 40,
                size: Math.random() * 8 + 4, // Bigger flames
                color: Math.random() > 0.3 ? '#FF4500' : Math.random() > 0.5 ? '#FF6347' : '#FFD700',
                flameHeight: Math.random() * 15 + 10
            });
        }
    }
    
    updateFireParticles() {
        this.effects.dentalClinic.fireParticles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            particle.velocityY -= 0.1; // Gravity
            
            if (particle.life <= 0) {
                this.effects.dentalClinic.fireParticles.splice(index, 1);
            }
        });
        
        // Add new particles continuously
        if (Math.random() < 0.4) {
            this.effects.dentalClinic.fireParticles.push({
                x: 200 + Math.random() * 160,
                y: 320, // Bottom of building
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 4 - 2,
                life: Math.random() * 80 + 40,
                size: Math.random() * 8 + 4, // Bigger flames
                color: Math.random() > 0.3 ? '#FF4500' : Math.random() > 0.5 ? '#FF6347' : '#FFD700',
                flameHeight: Math.random() * 15 + 10
            });
        }
    }
    
    createJumpingFish() {
        this.effects.sushiro.jumpingFish = [];
        const fishColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        for (let i = 0; i < 12; i++) { // More fish
            this.effects.sushiro.jumpingFish.push({
                x: 1220 + i * 12,
                y: 225, // Start at conveyor belt level
                velocityX: (Math.random() - 0.5) * 1, // Even slower horizontal movement
                velocityY: -Math.random() * 2 - 1, // Even slower vertical movement
                life: Math.random() * 180 + 120, // Longer life
                size: Math.random() * 6 + 4, // Bigger fish
                color: fishColors[Math.floor(Math.random() * fishColors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1 // Slower rotation
            });
        }
    }
    
    updateJumpingFish() {
        this.effects.sushiro.jumpingFish.forEach((fish, index) => {
            fish.x += fish.velocityX;
            fish.y += fish.velocityY;
            fish.velocityY += 0.05; // Even slower gravity
            fish.rotation += fish.rotationSpeed;
            fish.life--;
            
            if (fish.life <= 0 || fish.y > 300) {
                this.effects.sushiro.jumpingFish.splice(index, 1);
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw background
        this.ctx.drawImage(this.backgroundCanvas, 0, 0);
        
        // Draw ambient lighting overlay
        this.drawAmbientLighting();
        
        // Prepare all renderables with shadows
        const allRenderables = [...this.gardenElements];
        allRenderables.push({
            type: 'player',
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height,
            shadowOffsetX: this.player.shadow.offsetX,
            shadowOffsetY: this.player.shadow.offsetY
        });
        allRenderables.push({
            type: 'dog',
            x: this.dog.x,
            y: this.dog.y,
            width: this.dog.width,
            height: this.dog.height,
            shadowOffsetX: this.dog.shadow.offsetX,
            shadowOffsetY: this.dog.shadow.offsetY
        });
        
        // Add man if visible
        if (this.man.visible) {
            allRenderables.push({
                type: 'man',
                x: this.man.x,
                y: this.man.y,
                width: this.man.width,
                height: this.man.height,
                shadowOffsetX: this.man.shadow.offsetX,
                shadowOffsetY: this.man.shadow.offsetY
            });
        }
        
        // Sort by y position for proper depth
        allRenderables.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        
        // Draw shadows first
        this.ctx.globalAlpha = 0.3;
        allRenderables.forEach(item => {
            if (item.shadowOffsetX !== undefined) {
                this.drawShadow(item);
            }
        });
        this.ctx.globalAlpha = 1;
        
        // Draw main objects
        allRenderables.forEach(item => {
            if (item.type === 'player') {
                // Draw player
                const sprite = this.playerSprites[this.player.facing][this.player.animFrame];
                this.ctx.drawImage(sprite, this.player.x, this.player.y);
            } else if (item.type === 'dog') {
                // Draw dog
                const sprite = this.dogSprites[this.dog.facing][this.dog.animFrame];
                this.ctx.drawImage(sprite, this.dog.x, this.dog.y);
            } else if (item.type === 'man') {
                // Draw man
                const sprite = this.manSprites[this.man.facing][this.man.animFrame];
                this.ctx.drawImage(sprite, this.man.x, this.man.y);
            } else {
                // Draw garden element
                let sprite;
                switch (item.type) {
                    case 'tree': sprite = this.treeSprite; break;
                    case 'flowerbed': sprite = this.flowerBedSprite; break;
                    case 'bush': sprite = this.bushSprite; break;
                    case 'pond': sprite = this.pondSprite; break;
                    case 'bench': sprite = this.benchSprite; break;
                    case 'dentalclinic': sprite = this.dentalClinicSprite; break;
                    case 'home': sprite = this.homeSprite; break;
                    case 'sushiro': sprite = this.sushiroSprite; break;
                    case 'windmill': 
                        sprite = this.windmillSprite; 
                        // Special handling for spinning windmill
                        if (this.effects.windmill.spinning) {
                            this.drawSpinningWindmill(item);
                            sprite = null; // Skip normal drawing
                        }
                        break;
                    case 'bike': sprite = this.bikeSprite; break;
                }
                if (sprite) {
                    this.ctx.drawImage(sprite, item.x, item.y);
                }
            }
        });
        
        // Draw ambient particles
        this.drawAmbientParticles();
        
        // Draw special effects
        this.drawSpecialEffects();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI elements (if any)
        this.drawUI();
    }
    
    drawShadow(item) {
        this.ctx.fillStyle = this.lighting.shadowColor;
        this.ctx.beginPath();
        this.ctx.ellipse(
            item.x + item.width/2 + item.shadowOffsetX,
            item.y + item.height + item.shadowOffsetY,
            item.width * 0.6,
            item.height * 0.2,
            0, 0, 2 * Math.PI
        );
        this.ctx.fill();
    }
    
    drawAmbientLighting() {
        // Subtle lighting overlay
        const gradient = this.ctx.createRadialGradient(
            this.player.x, this.player.y - 100,
            50,
            this.player.x, this.player.y - 100,
            300
        );
        gradient.addColorStop(0, 'rgba(255, 248, 220, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 248, 220, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
    }
    
    drawAmbientParticles() {
        this.ambientParticles.forEach(particle => {
            // Only draw particles visible on screen
            if (particle.x >= this.camera.x - 50 && 
                particle.x <= this.camera.x + this.canvas.width + 50 &&
                particle.y >= this.camera.y - 50 && 
                particle.y <= this.camera.y + this.canvas.height + 50) {
                
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }
    
    createFloatingHearts() {
        this.effects.house.hearts = [];
        for (let i = 0; i < 15; i++) {
            this.effects.house.hearts.push({
                x: 800 + Math.random() * 140,
                y: 300 + Math.random() * 110,
                velocityX: (Math.random() - 0.5) * 1,
                velocityY: -Math.random() * 2 - 0.5,
                life: Math.random() * 150 + 100,
                size: Math.random() * 8 + 6,
                color: Math.random() > 0.5 ? '#FF69B4' : '#FF1493',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                bobSpeed: Math.random() * 0.1 + 0.05
            });
        }
    }
    
    updateFloatingHearts() {
        this.effects.house.hearts.forEach((heart, index) => {
            heart.x += heart.velocityX + Math.sin(heart.life * heart.bobSpeed) * 0.5;
            heart.y += heart.velocityY;
            heart.rotation += heart.rotationSpeed;
            heart.life--;
            
            if (heart.life <= 0) {
                this.effects.house.hearts.splice(index, 1);
            }
        });
        
        // Add new hearts continuously
        if (Math.random() < 0.2) {
            this.effects.house.hearts.push({
                x: 800 + Math.random() * 140,
                y: 410, // Bottom of house
                velocityX: (Math.random() - 0.5) * 1,
                velocityY: -Math.random() * 2 - 0.5,
                life: Math.random() * 150 + 100,
                size: Math.random() * 8 + 6,
                color: Math.random() > 0.5 ? '#FF69B4' : '#FF1493',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                bobSpeed: Math.random() * 0.1 + 0.05
            });
        }
    }
    
    drawSpinningWindmill(item) {
        // Draw the base windmill (tower and cap)
        const ctx = this.ctx;
        const centerX = item.x + 60;
        const centerY = item.y + 80;
        
        // Tower
        const towerGradient = ctx.createLinearGradient(item.x, 0, item.x + 120, 0);
        towerGradient.addColorStop(0, '#F5F5DC');
        towerGradient.addColorStop(0.3, '#FFFFFF');
        towerGradient.addColorStop(0.7, '#E6E6FA');
        towerGradient.addColorStop(1, '#D3D3D3');
        
        ctx.fillStyle = towerGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, item.y + 120, 25, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tower details (windows, door, etc.)
        this.ctx.drawImage(this.windmillSprite, item.x, item.y);
        
        // Spinning blades
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.time * this.effects.windmill.spinSpeed * 10);
        
        ctx.fillStyle = '#F0F8FF';
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        
        // Draw 4 spinning blades
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const bladeX = Math.cos(angle) * 25;
            const bladeY = Math.sin(angle) * 25;
            
            ctx.beginPath();
            ctx.ellipse(bladeX, bladeY, 25, 8, angle, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawSpecialEffects() {
        // Draw bigger fire particles as flames
        if (this.effects.dentalClinic.onFire) {
            this.effects.dentalClinic.fireParticles.forEach(particle => {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.globalAlpha = Math.max(0, particle.life / 120);
                
                // Draw flame shape instead of circle
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, particle.size, particle.flameHeight, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Add flame flicker effect
                this.ctx.fillStyle = '#FFD700';
                this.ctx.globalAlpha = Math.max(0, particle.life / 120) * 0.5;
                this.ctx.beginPath();
                this.ctx.ellipse(0, -particle.size, particle.size * 0.6, particle.flameHeight * 0.8, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
        }
        
        // Draw bigger, slower jumping fish
        if (this.effects.sushiro.fishJumping) {
            this.effects.sushiro.jumpingFish.forEach(fish => {
                this.ctx.save();
                this.ctx.translate(fish.x, fish.y);
                this.ctx.rotate(fish.rotation);
                this.ctx.fillStyle = fish.color;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, fish.size, fish.size * 0.6, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Fish eye
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(fish.size * 0.3, 0, 1.5, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Fish tail
                this.ctx.fillStyle = fish.color;
                this.ctx.beginPath();
                this.ctx.ellipse(-fish.size * 0.8, 0, fish.size * 0.4, fish.size * 0.8, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.ctx.restore();
            });
        }
        
        // Draw floating hearts from house
        if (this.effects.house.heartsFloating) {
            this.effects.house.hearts.forEach(heart => {
                this.ctx.save();
                this.ctx.translate(heart.x, heart.y);
                this.ctx.rotate(heart.rotation);
                this.ctx.globalAlpha = Math.max(0, heart.life / 250);
                this.ctx.fillStyle = heart.color;
                this.ctx.font = `${heart.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('❤️', 0, heart.size * 0.3);
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawUI() {
        // Draw birthday message when active
        if (this.interaction.showingMessage) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 4;
            
            // Larger message background for two lines
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.roundRect(centerX - 250, centerY - 45, 500, 90, 10);
            this.ctx.fill();
            
            // Message border
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // First line - Birthday message
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.interaction.messageText, centerX, centerY - 10);
            
            // Second line - Well wishes
            this.ctx.font = '14px Arial';
            this.ctx.fillText(this.interaction.messageText2, centerX, centerY + 20);
            
            // Add sparkle effect
            const sparkles = 8;
            for (let i = 0; i < sparkles; i++) {
                const angle = (i / sparkles) * Math.PI * 2;
                const distance = 270 + Math.sin(this.time * 3 + i) * 15;
                const x = centerX + Math.cos(angle + this.time * 0.5) * distance;
                const y = centerY + Math.sin(angle + this.time * 0.5) * (distance * 0.4);
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = '16px Arial';
                this.ctx.fillText('✨', x, y);
            }
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Realistic3DGardenGame();
});