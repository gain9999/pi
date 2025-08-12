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
            x: 50,
            y: 620,
            width: 48,
            height: 48,
            speed: this.isMobile() ? 5.0 : 2.5, // 2x faster on mobile
            facing: 'down',
            animFrame: 0,
            animTimer: 0,
            isMoving: false,
            isFloating: false,
            floatingTimer: 0,
            floatingStartY: 0,
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
            isFollowing: false,
            speed: 2.0,
            targetX: 1320,
            targetY: 1050,
            shadow: { offsetX: 2, offsetY: 4, blur: 8 }
        };
        
        // Bike location (moved away from tree, more visible)
        this.bike = {
            x: 1350,
            y: 1020,
            width: 48,
            height: 32
        };
        
        // Poop location (center of screen)
        this.poop = {
            x: 900,
            y: 700,
            width: 32,
            height: 24
        };
        
        // Interaction system
        this.interaction = {
            showingMessage: false,
            messageTimer: 0,
            messageText: "Happy Birthday Pi ❤️",
            messageText2: "Have a wonderful year! Be strong, healthy and happy."
        };
        
        // Explosion system
        this.explosion = {
            active: false,
            timer: 0,
            particles: []
        };
        
        // Building interaction effects
        this.effects = {
            windmill: { spinning: false, spinTimer: 0, spinSpeed: 0 },
            dentalClinic: { onFire: false, fireTimer: 0, fireParticles: [] },
            sushiro: { fishJumping: false, fishTimer: 0, jumpingFish: [] },
            house: { heartsFloating: false, heartsTimer: 0, hearts: [] },
            machuPicchu: { llamasJumping: false, llamaTimer: 0, llamas: [] },
            rioDeJaneiro: { fireworksActive: false, fireworksTimer: 0, fireworks: [] },
            sanMiguelDeAllende: { bellsRinging: false, bellTimer: 0, bells: [] },
            okinawa: { shakuhachisPlaying: false, shakuhachiTimer: 0, sakuraPetals: [] }
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
        
        // Sky elements
        this.sky = {
            sun: {
                x: 1500,
                y: 80,
                size: 60,
                glowSize: 120,
                bobOffset: 0
            },
            clouds: []
        };
        
        // Initialize clouds
        this.createClouds();
        
        // Audio system
        this.audio = {
            backgroundMusic: null,
            sounds: {},
            musicVolume: 0.3,
            soundVolume: 0.5,
            musicEnabled: true,
            soundEnabled: true
        };
        this.initAudio();
        
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
    
    isMobile() {
        // Check if device is mobile based on touch capability and screen size
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
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
        
        // Start background music and ambient sounds after user interaction
        this.startAudioOnInteraction();
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
        this.machuPicchuSprite = this.createMachuPicchuSprite();
        this.rioDeJaneiroSprite = this.createRioDeJaneiroSprite();
        this.sanMiguelDeAllendeSprite = this.createSanMiguelDeAllendeSprite();
        this.okinawaSprite = this.createOkinawaSprite();
        
        // Special items
        this.bikeSprite = this.createBikeSprite();
        this.poopSprite = this.createPoopSprite();
        
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
        
        // Natural pond outline (irregular, organic shape)
        ctx.fillStyle = '#8B6914'; // Muddy earth color
        ctx.beginPath();
        // Create irregular pond shape using curves
        ctx.moveTo(20, 48);
        ctx.quadraticCurveTo(10, 25, 35, 15);
        ctx.quadraticCurveTo(64, 8, 95, 20);
        ctx.quadraticCurveTo(118, 35, 108, 55);
        ctx.quadraticCurveTo(95, 80, 70, 85);
        ctx.quadraticCurveTo(45, 88, 25, 75);
        ctx.quadraticCurveTo(8, 65, 20, 48);
        ctx.closePath();
        ctx.fill();
        
        // Natural sandy/rocky shore
        const shoreGradient = ctx.createRadialGradient(64, 48, 0, 64, 48, 45);
        shoreGradient.addColorStop(0, '#D2B48C');
        shoreGradient.addColorStop(0.6, '#CD853F');
        shoreGradient.addColorStop(1, '#8B6914');
        
        ctx.fillStyle = shoreGradient;
        ctx.beginPath();
        ctx.moveTo(25, 48);
        ctx.quadraticCurveTo(15, 30, 38, 22);
        ctx.quadraticCurveTo(64, 15, 90, 25);
        ctx.quadraticCurveTo(108, 38, 100, 55);
        ctx.quadraticCurveTo(90, 75, 68, 78);
        ctx.quadraticCurveTo(48, 80, 30, 70);
        ctx.quadraticCurveTo(15, 60, 25, 48);
        ctx.closePath();
        ctx.fill();
        
        // Natural water with depth variation
        const waterGradient = ctx.createRadialGradient(64, 48, 5, 64, 48, 35);
        waterGradient.addColorStop(0, '#4682B4');
        waterGradient.addColorStop(0.3, '#1E90FF');
        waterGradient.addColorStop(0.6, '#4169E1');
        waterGradient.addColorStop(1, '#191970');
        
        ctx.fillStyle = waterGradient;
        ctx.beginPath();
        ctx.moveTo(30, 48);
        ctx.quadraticCurveTo(22, 35, 42, 28);
        ctx.quadraticCurveTo(64, 22, 86, 30);
        ctx.quadraticCurveTo(98, 40, 92, 55);
        ctx.quadraticCurveTo(85, 70, 66, 72);
        ctx.quadraticCurveTo(50, 74, 35, 65);
        ctx.quadraticCurveTo(22, 58, 30, 48);
        ctx.closePath();
        ctx.fill();
        
        // Cattails and reeds around the edge
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#8B4513';
        
        // Left side cattails
        for (let i = 0; i < 3; i++) {
            const x = 25 + i * 8;
            const y = 35 + i * 5;
            const height = 15 + Math.random() * 10;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - height);
            ctx.stroke();
            
            // Cattail head
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 1, y - height - 5, 2, 5);
        }
        
        // Right side cattails
        for (let i = 0; i < 2; i++) {
            const x = 95 + i * 6;
            const y = 40 + i * 4;
            const height = 12 + Math.random() * 8;
            
            ctx.strokeStyle = '#228B22';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - height);
            ctx.stroke();
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 1, y - height - 4, 2, 4);
        }
        
        // Water lilies
        ctx.fillStyle = '#228B22';
        
        // Lily pad 1
        ctx.beginPath();
        ctx.ellipse(45, 45, 8, 6, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lily pad 2
        ctx.beginPath();
        ctx.ellipse(75, 52, 6, 8, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lily flowers
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(48, 42, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(78, 55, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Gentle water ripples (more subtle)
        ctx.strokeStyle = 'rgba(173, 216, 230, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const centerX = 60 + Math.random() * 8;
            const centerY = 48 + Math.random() * 6;
            const radius = 8 + i * 5;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius, radius * 0.6, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Surface reflections (more natural)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(55, 40, 12, 6, Math.PI / 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Small rocks around the edge
        ctx.fillStyle = '#696969';
        const rockPositions = [
            {x: 35, y: 25}, {x: 85, y: 30}, {x: 25, y: 65}, {x: 95, y: 68}
        ];
        
        rockPositions.forEach(rock => {
            ctx.beginPath();
            ctx.ellipse(rock.x, rock.y, 3 + Math.random() * 2, 2 + Math.random() * 2, Math.random() * Math.PI, 0, 2 * Math.PI);
            ctx.fill();
        });
        
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
        ctx.fillText('1369', 60, 155);
        
        return canvas;
    }
    
    createMachuPicchuSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Mountain backdrop
        const mountainGradient = ctx.createLinearGradient(0, 0, 0, 140);
        mountainGradient.addColorStop(0, '#8FBC8F');
        mountainGradient.addColorStop(0.5, '#556B2F');
        mountainGradient.addColorStop(1, '#2F4F4F');
        
        // Draw mountain silhouette
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(0, 80);
        ctx.lineTo(40, 40);
        ctx.lineTo(80, 60);
        ctx.lineTo(120, 30);
        ctx.lineTo(160, 50);
        ctx.lineTo(200, 20);
        ctx.lineTo(200, 140);
        ctx.closePath();
        ctx.fill();
        
        // Ancient stone terraces (characteristic of Machu Picchu)
        const stoneGradient = ctx.createLinearGradient(0, 0, 0, 140);
        stoneGradient.addColorStop(0, '#D2B48C');
        stoneGradient.addColorStop(0.5, '#CD853F');
        stoneGradient.addColorStop(1, '#A0522D');
        
        // Draw multiple terraced levels
        ctx.fillStyle = stoneGradient;
        
        // Lower terrace
        ctx.fillRect(20, 100, 160, 15);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 100, 160, 15);
        
        // Middle terrace
        ctx.fillRect(30, 85, 140, 15);
        ctx.strokeRect(30, 85, 140, 15);
        
        // Upper terrace
        ctx.fillRect(40, 70, 120, 15);
        ctx.strokeRect(40, 70, 120, 15);
        
        // Temple structures
        const templeGradient = ctx.createLinearGradient(0, 50, 0, 100);
        templeGradient.addColorStop(0, '#F5DEB3');
        templeGradient.addColorStop(0.7, '#DEB887');
        templeGradient.addColorStop(1, '#D2B48C');
        
        // Main temple structure
        ctx.fillStyle = templeGradient;
        ctx.fillRect(70, 50, 60, 35);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(70, 50, 60, 35);
        
        // Temple roof (triangular)
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(65, 50);
        ctx.lineTo(100, 25);
        ctx.lineTo(135, 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Side temple structures
        ctx.fillStyle = templeGradient;
        ctx.fillRect(45, 60, 20, 25);
        ctx.strokeRect(45, 60, 20, 25);
        
        ctx.fillRect(135, 60, 20, 25);
        ctx.strokeRect(135, 60, 20, 25);
        
        // Temple windows/doorways
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(80, 65, 8, 15);
        ctx.fillRect(100, 65, 8, 15);
        ctx.fillRect(112, 65, 8, 15);
        
        // Stone block details
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        for (let i = 70; i < 130; i += 10) {
            for (let j = 55; j < 80; j += 8) {
                ctx.strokeRect(i, j, 10, 8);
            }
        }
        
        // Intihuatana stone (ritual stone)
        ctx.fillStyle = '#696969';
        ctx.fillRect(95, 45, 10, 8);
        ctx.strokeStyle = '#2F4F4F';
        ctx.strokeRect(95, 45, 10, 8);
        
        // Steps leading up
        ctx.fillStyle = stoneGradient;
        for (let i = 0; i < 5; i++) {
            const stepY = 115 - i * 5;
            const stepWidth = 20 + i * 4;
            ctx.fillRect(90 - stepWidth/2, stepY, stepWidth, 4);
            ctx.strokeStyle = '#8B4513';
            ctx.strokeRect(90 - stepWidth/2, stepY, stepWidth, 4);
        }
        
        // Ancient vegetation (llama grass)
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 20; i++) {
            const x = 10 + Math.random() * 180;
            const y = 90 + Math.random() * 40;
            if (x < 40 || x > 160) { // Only on the sides
                ctx.fillRect(x, y, 2, 8);
            }
        }
        
        // Mystical clouds around peaks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(120, 25, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(160, 40, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Title text
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MACHU PICCHU', 100, 135);
        
        return canvas;
    }
    
    createRioDeJaneiroSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Sugarloaf Mountain backdrop
        const mountainGradient = ctx.createLinearGradient(0, 0, 0, 140);
        mountainGradient.addColorStop(0, '#87CEEB');
        mountainGradient.addColorStop(0.3, '#4682B4');
        mountainGradient.addColorStop(0.7, '#2F4F4F');
        mountainGradient.addColorStop(1, '#1C3A2E');
        
        // Draw Sugarloaf Mountain silhouette
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(0, 90);
        ctx.lineTo(30, 60);
        ctx.lineTo(60, 40);
        ctx.lineTo(90, 50);
        ctx.lineTo(120, 35);
        ctx.lineTo(150, 45);
        ctx.lineTo(180, 30);
        ctx.lineTo(200, 40);
        ctx.lineTo(200, 140);
        ctx.closePath();
        ctx.fill();
        
        // Corcovado Mountain with Christ the Redeemer
        const christMountainGradient = ctx.createLinearGradient(0, 0, 0, 140);
        christMountainGradient.addColorStop(0, '#98FB98');
        christMountainGradient.addColorStop(0.5, '#228B22');
        christMountainGradient.addColorStop(1, '#006400');
        
        ctx.fillStyle = christMountainGradient;
        ctx.beginPath();
        ctx.moveTo(70, 140);
        ctx.lineTo(70, 70);
        ctx.lineTo(100, 40);
        ctx.lineTo(130, 70);
        ctx.lineTo(130, 140);
        ctx.closePath();
        ctx.fill();
        
        // Christ the Redeemer statue
        // Statue base/pedestal
        const pedestalGradient = ctx.createLinearGradient(0, 40, 0, 70);
        pedestalGradient.addColorStop(0, '#F5F5DC');
        pedestalGradient.addColorStop(1, '#D2B48C');
        
        ctx.fillStyle = pedestalGradient;
        ctx.fillRect(95, 60, 10, 15);
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        ctx.strokeRect(95, 60, 10, 15);
        
        // Christ figure body
        const christGradient = ctx.createLinearGradient(0, 35, 0, 60);
        christGradient.addColorStop(0, '#FFFAF0');
        christGradient.addColorStop(0.7, '#F5F5DC');
        christGradient.addColorStop(1, '#E6E6FA');
        
        ctx.fillStyle = christGradient;
        ctx.fillRect(97, 45, 6, 15); // Body
        ctx.strokeStyle = '#D3D3D3';
        ctx.strokeRect(97, 45, 6, 15);
        
        // Christ head
        ctx.fillStyle = christGradient;
        ctx.beginPath();
        ctx.arc(100, 42, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Outstretched arms (iconic pose)
        ctx.fillStyle = christGradient;
        ctx.fillRect(85, 48, 30, 3); // Horizontal arm span
        ctx.strokeRect(85, 48, 30, 3);
        
        // Robe details
        ctx.fillStyle = '#E6E6FA';
        ctx.fillRect(96, 52, 8, 8);
        
        // Brazilian flag colors on base
        ctx.fillStyle = '#009739'; // Green
        ctx.fillRect(93, 70, 4, 3);
        ctx.fillStyle = '#FEDD00'; // Yellow
        ctx.fillRect(97, 70, 3, 3);
        ctx.fillStyle = '#012169'; // Blue
        ctx.fillRect(100, 70, 4, 3);
        
        // Copacabana beach at bottom
        const beachGradient = ctx.createLinearGradient(0, 110, 0, 140);
        beachGradient.addColorStop(0, '#F4A460');
        beachGradient.addColorStop(1, '#DEB887');
        
        ctx.fillStyle = beachGradient;
        ctx.fillRect(0, 120, 200, 20);
        
        // Ocean waves
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        for (let x = 0; x < 200; x += 20) {
            ctx.moveTo(x, 118);
            ctx.quadraticCurveTo(x + 10, 115, x + 20, 118);
        }
        ctx.stroke();
        
        // Palm trees
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(20, 100, 3, 20); // Trunk
        ctx.fillRect(170, 105, 3, 15); // Trunk
        
        ctx.fillStyle = '#228B22';
        // Palm fronds
        ctx.beginPath();
        ctx.arc(21, 100, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(171, 105, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Clouds around mountains
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(100, 35, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(150, 25, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Title text
        ctx.fillStyle = '#006400';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RIO DE JANEIRO', 100, 135);
        
        return canvas;
    }
    
    createSanMiguelDeAllendeSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Desert mountain backdrop
        const mountainGradient = ctx.createLinearGradient(0, 0, 0, 140);
        mountainGradient.addColorStop(0, '#D2691E');
        mountainGradient.addColorStop(0.5, '#A0522D');
        mountainGradient.addColorStop(1, '#8B4513');
        
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(0, 60);
        ctx.lineTo(50, 30);
        ctx.lineTo(100, 40);
        ctx.lineTo(150, 25);
        ctx.lineTo(200, 35);
        ctx.lineTo(200, 140);
        ctx.closePath();
        ctx.fill();
        
        // Colonial church (Parroquia de San Miguel Arcángel)
        // Main church body
        const churchGradient = ctx.createLinearGradient(0, 50, 0, 110);
        churchGradient.addColorStop(0, '#FFB6C1');
        churchGradient.addColorStop(0.5, '#F08080');
        churchGradient.addColorStop(1, '#CD5C5C');
        
        ctx.fillStyle = churchGradient;
        ctx.fillRect(70, 60, 60, 50);
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(70, 60, 60, 50);
        
        // Gothic spires (San Miguel's iconic pink church)
        ctx.fillStyle = '#F08080';
        // Central spire
        ctx.beginPath();
        ctx.moveTo(95, 60);
        ctx.lineTo(100, 25);
        ctx.lineTo(105, 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Side spires
        ctx.beginPath();
        ctx.moveTo(75, 60);
        ctx.lineTo(80, 35);
        ctx.lineTo(85, 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(115, 60);
        ctx.lineTo(120, 35);
        ctx.lineTo(125, 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Church entrance and windows
        ctx.fillStyle = '#2F4F4F';
        // Main door
        ctx.fillRect(95, 85, 10, 25);
        ctx.beginPath();
        ctx.arc(100, 85, 5, Math.PI, 0);
        ctx.fill();
        
        // Gothic windows
        ctx.fillRect(80, 70, 6, 15);
        ctx.fillRect(114, 70, 6, 15);
        
        // Rose window
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(100, 75, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Colonial buildings around the church
        const colonialGradient = ctx.createLinearGradient(0, 80, 0, 110);
        colonialGradient.addColorStop(0, '#FFEFD5');
        colonialGradient.addColorStop(0.5, '#F5DEB3');
        colonialGradient.addColorStop(1, '#DEB887');
        
        // Left building
        ctx.fillStyle = colonialGradient;
        ctx.fillRect(30, 90, 35, 30);
        ctx.strokeStyle = '#8B7355';
        ctx.strokeRect(30, 90, 35, 30);
        
        // Right building
        ctx.fillRect(135, 95, 40, 25);
        ctx.strokeRect(135, 95, 40, 25);
        
        // Red tile roofs
        ctx.fillStyle = '#B22222';
        // Church roof details
        ctx.fillRect(68, 58, 64, 4);
        
        // Colonial building roofs
        ctx.fillRect(28, 88, 39, 4);
        ctx.fillRect(133, 93, 44, 4);
        
        // Balconies and colonial details
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(40, 100, 15, 2); // Balcony
        ctx.fillRect(145, 105, 20, 2); // Balcony
        
        // Windows with colonial grilles
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(35, 95, 4, 6);
        ctx.fillRect(50, 95, 4, 6);
        ctx.fillRect(140, 100, 4, 6);
        ctx.fillRect(160, 100, 4, 6);
        
        // Cobblestone plaza
        ctx.fillStyle = '#696969';
        for (let x = 20; x < 180; x += 8) {
            for (let y = 115; y < 140; y += 6) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(x, y, 6, 4);
                }
            }
        }
        
        // Mexican flag colors detail
        ctx.fillStyle = '#006847'; // Green
        ctx.fillRect(180, 115, 8, 3);
        ctx.fillStyle = '#FFFFFF'; // White
        ctx.fillRect(180, 118, 8, 3);
        ctx.fillStyle = '#CE1126'; // Red
        ctx.fillRect(180, 121, 8, 3);
        
        // Title text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SAN MIGUEL DE ALLENDE', 100, 135);
        
        return canvas;
    }
    
    createOkinawaSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Tropical mountain backdrop
        const mountainGradient = ctx.createLinearGradient(0, 0, 0, 140);
        mountainGradient.addColorStop(0, '#87CEEB');
        mountainGradient.addColorStop(0.3, '#228B22');
        mountainGradient.addColorStop(0.7, '#006400');
        mountainGradient.addColorStop(1, '#2F4F2F');
        
        ctx.fillStyle = mountainGradient;
        ctx.beginPath();
        ctx.moveTo(0, 140);
        ctx.lineTo(0, 70);
        ctx.lineTo(40, 50);
        ctx.lineTo(80, 60);
        ctx.lineTo(120, 45);
        ctx.lineTo(160, 55);
        ctx.lineTo(200, 40);
        ctx.lineTo(200, 140);
        ctx.closePath();
        ctx.fill();
        
        // Shuri Castle (traditional Ryukyu architecture)
        // Castle base/foundation
        const castleBaseGradient = ctx.createLinearGradient(0, 70, 0, 110);
        castleBaseGradient.addColorStop(0, '#D3D3D3');
        castleBaseGradient.addColorStop(0.5, '#A9A9A9');
        castleBaseGradient.addColorStop(1, '#696969');
        
        ctx.fillStyle = castleBaseGradient;
        ctx.fillRect(60, 85, 80, 25);
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 85, 80, 25);
        
        // Main castle structure
        const castleGradient = ctx.createLinearGradient(0, 50, 0, 85);
        castleGradient.addColorStop(0, '#DC143C');
        castleGradient.addColorStop(0.5, '#B22222');
        castleGradient.addColorStop(1, '#8B0000');
        
        ctx.fillStyle = castleGradient;
        ctx.fillRect(70, 60, 60, 25);
        ctx.strokeStyle = '#8B0000';
        ctx.strokeRect(70, 60, 60, 25);
        
        // Traditional curved roof (distinctive Ryukyu style)
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        // Main roof curve
        ctx.moveTo(65, 60);
        ctx.quadraticCurveTo(100, 45, 135, 60);
        ctx.lineTo(130, 65);
        ctx.quadraticCurveTo(100, 52, 70, 65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Secondary roof layers (traditional Japanese style)
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(68, 65);
        ctx.quadraticCurveTo(100, 52, 132, 65);
        ctx.lineTo(128, 68);
        ctx.quadraticCurveTo(100, 57, 72, 68);
        ctx.closePath();
        ctx.fill();
        
        // Roof ornaments (traditional Ryukyu decorations)
        ctx.fillStyle = '#FFD700';
        // Dragon/shisa ornaments
        ctx.beginPath();
        ctx.arc(85, 48, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(100, 45, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(115, 48, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Castle walls and gates
        ctx.fillStyle = '#2F4F4F';
        // Main entrance
        ctx.fillRect(95, 70, 10, 15);
        // Traditional gate arch
        ctx.beginPath();
        ctx.arc(100, 70, 5, Math.PI, 0);
        ctx.fill();
        
        // Windows
        ctx.fillRect(80, 70, 4, 8);
        ctx.fillRect(116, 70, 4, 8);
        
        // Side structures
        ctx.fillStyle = castleGradient;
        ctx.fillRect(50, 75, 15, 20);
        ctx.strokeRect(50, 75, 15, 20);
        ctx.fillRect(135, 75, 15, 20);
        ctx.strokeRect(135, 75, 15, 20);
        
        // Traditional stone walls
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 1;
        for (let x = 60; x < 140; x += 8) {
            for (let y = 88; y < 108; y += 6) {
                ctx.strokeRect(x, y, 8, 6);
            }
        }
        
        // Tropical vegetation (distinctive to Okinawa)
        ctx.fillStyle = '#228B22';
        // Banyan trees
        ctx.beginPath();
        ctx.arc(25, 100, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(175, 105, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Palm trees
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(22, 100, 2, 15);
        ctx.fillRect(173, 105, 2, 12);
        
        // Hibiscus flowers (Okinawan symbol)
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(35, 95, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(165, 100, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ocean/beach
        const oceanGradient = ctx.createLinearGradient(0, 115, 0, 140);
        oceanGradient.addColorStop(0, '#00CED1');
        oceanGradient.addColorStop(1, '#4682B4');
        
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 115, 200, 25);
        
        // Waves
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        for (let x = 0; x < 200; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, 118);
            ctx.quadraticCurveTo(x + 7, 115, x + 15, 118);
            ctx.stroke();
        }
        
        // Traditional Ryukyu patterns
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(95, 62, 2, 2);
        ctx.fillRect(103, 62, 2, 2);
        
        // Title text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('OKINAWA', 100, 135);
        
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
    
    createPoopSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        
        // Main poop body (brown gradient)
        const poopGradient = ctx.createRadialGradient(16, 12, 2, 16, 12, 14);
        poopGradient.addColorStop(0, '#8B4513');
        poopGradient.addColorStop(0.6, '#654321');
        poopGradient.addColorStop(1, '#4A2C17');
        
        ctx.fillStyle = poopGradient;
        
        // Draw poop shape with multiple lumps
        ctx.beginPath();
        // Bottom lump
        ctx.ellipse(16, 18, 12, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Middle lump
        ctx.beginPath();
        ctx.ellipse(14, 12, 10, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Top lump
        ctx.beginPath();
        ctx.ellipse(18, 8, 8, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add some texture lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(8 + i * 4, 15 + i * 2);
            ctx.lineTo(12 + i * 4, 17 + i * 2);
            ctx.stroke();
        }
        
        // Stink lines (wavy lines above)
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const x = 12 + i * 4;
            ctx.moveTo(x, 6);
            ctx.quadraticCurveTo(x + 2, 3, x + 4, 6);
            ctx.quadraticCurveTo(x + 6, 3, x + 8, 6);
            ctx.stroke();
        }
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(17, 22, 10, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
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
    
    createClouds() {
        // Clear existing clouds first
        this.sky.clouds = [];
        
        // Create several clouds with random positions slightly higher up
        const cloudCount = 6; // Fewer but more realistic clouds
        for (let i = 0; i < cloudCount; i++) {
            this.sky.clouds.push({
                x: Math.random() * this.worldWidth, // Ensure valid initial x
                y: 20 + Math.random() * 80, // Higher up (20-100) for more sky-like appearance
                width: 120 + Math.random() * 100, // Larger, more realistic clouds
                height: 60 + Math.random() * 50, // Taller clouds
                opacity: 0.7 + Math.random() * 0.25, // Slightly more transparent for realism
                speed: 0.2 + Math.random() * 0.6, // Slower, more realistic movement
                offsetY: Math.random() * 10,
                phase: Math.random() * Math.PI * 2, // For gentle floating animation
                puffs: [] // Will store individual cloud puffs for realistic shape
            });
        }
        
        // Generate realistic puff patterns for each cloud
        this.sky.clouds.forEach(cloud => {
            const puffCount = 5 + Math.floor(Math.random() * 4); // 5-8 puffs per cloud
            for (let i = 0; i < puffCount; i++) {
                cloud.puffs.push({
                    x: (cloud.width * i / (puffCount - 1)) + (Math.random() - 0.5) * 30,
                    y: (Math.random() - 0.5) * cloud.height * 0.6,
                    size: 20 + Math.random() * 40,
                    opacity: 0.6 + Math.random() * 0.4
                });
            }
        });
    }
    
    initAudio() {
        // Create audio context for Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported, using HTML5 Audio');
        }
        
        // Create procedural background music
        this.createBackgroundMusic();
        
        // Create procedural sound effects
        this.createSoundEffects();
    }
    
    createBackgroundMusic() {
        // Create a gentle, ambient background music using Web Audio API
        if (!this.audioContext) return;
        
        // Create oscillators for ambient background music
        // this.createAmbientMusic();
        
        // Also create HTML5 audio backup with data URLs for simple melodies
        this.createSimpleBackgroundTrack();
    }
    
    createAmbientMusic() {
        if (!this.audioContext) return;
        
        // Create a gentle ambient pad sound
        const startAmbient = () => {
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            
            // Gentle, peaceful frequencies
            oscillator1.frequency.value = 220; // A3
            oscillator2.frequency.value = 330; // E4
            
            gainNode.gain.value = this.audio.musicVolume * 0.1;
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.start();
            oscillator2.start();
            
            // Add subtle frequency modulation for organic feel
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 0.1;
            lfoGain.gain.value = 2;
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator1.frequency);
            lfo.start();
            
            // Store references for cleanup
            this.audio.ambientOscillators = [oscillator1, oscillator2, lfo];
        };
        
        // Start ambient music after user interaction
        document.addEventListener('click', startAmbient, { once: true });
        document.addEventListener('keydown', startAmbient, { once: true });
        document.addEventListener('touchstart', startAmbient, { once: true });
    }
    
    createSimpleBackgroundTrack() {
        // Create a beautiful, melodic background music
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const sampleRate = 44100;
        const duration = 16; // 16 second loop for more complex melody
        const length = sampleRate * duration;
        const buffer = audioContext.createBuffer(2, length, sampleRate); // Stereo
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        
        // Define a pleasant chord progression in C major
        // I-vi-IV-V (C-Am-F-G) - very common and pleasant progression
        const chordProgression = [
            { notes: [261.63, 329.63, 392.00], duration: 4 }, // C major (C-E-G)
            { notes: [220.00, 261.63, 329.63], duration: 4 }, // A minor (A-C-E)
            { notes: [174.61, 220.00, 261.63], duration: 4 }, // F major (F-A-C)
            { notes: [196.00, 246.94, 293.66], duration: 4 }  // G major (G-B-D)
        ];
        
        // Main melody notes (pentatonic scale for pleasant sound)
        const melodyNotes = [
            261.63, 293.66, 329.63, 392.00, 440.00, // C D E G A
            523.25, 587.33, 659.25, 783.99, 880.00  // C5 D5 E5 G5 A5 (octave higher)
        ];
        
        // Generate the musical piece
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            const measureTime = time % 16; // 16-second loop
            const beatTime = measureTime % 4; // 4-second per chord
            const chordIndex = Math.floor(measureTime / 4);
            const currentChord = chordProgression[chordIndex];
            
            // Generate harmony (chord background)
            let harmony = 0;
            currentChord.notes.forEach((freq, index) => {
                const volume = 0.03 / (index + 1); // Decrease volume for higher notes
                harmony += Math.sin(2 * Math.PI * freq * time) * volume;
            });
            
            // Generate melody line
            let melody = 0;
            const melodyIndex = Math.floor((measureTime * 2) % melodyNotes.length);
            const melodyFreq = melodyNotes[melodyIndex];
            const melodyEnvelope = Math.sin(Math.PI * (beatTime / 4)) * 0.8; // Note envelope
            melody = Math.sin(2 * Math.PI * melodyFreq * time) * 0.08 * melodyEnvelope;
            
            // Add subtle arpeggio (broken chord pattern)
            const arpeggioIndex = Math.floor((time * 4) % currentChord.notes.length);
            const arpeggioFreq = currentChord.notes[arpeggioIndex];
            const arpeggio = Math.sin(2 * Math.PI * arpeggioFreq * time) * 0.04 * 
                           Math.sin(Math.PI * (beatTime * 4 % 1));
            
            // Add gentle bass line
            const bassFreq = currentChord.notes[0] / 2; // Octave lower
            const bass = Math.sin(2 * Math.PI * bassFreq * time) * 0.06 * 
                        Math.max(0, Math.sin(Math.PI * beatTime / 4));
            
            // Combine all elements
            const leftMix = harmony + arpeggio + bass;
            const rightMix = harmony * 0.8 + arpeggio * 1.2 + bass; // Slight stereo variation
            
            // Apply gentle fade in/out for seamless looping
            const fadeTime = 0.5; // 0.5 second fade
            let fadeMultiplier = 1;
            if (time < fadeTime) {
                fadeMultiplier = time / fadeTime;
            } else if (time > duration - fadeTime) {
                fadeMultiplier = (duration - time) / fadeTime;
            }
            
            // Final output with fade
            leftChannel[i] = leftMix * fadeMultiplier * 0.4;
            rightChannel[i] = rightMix * fadeMultiplier * 0.4;
        }
        
        // Convert to data URL and create audio element
        this.bufferToDataURL(buffer).then(dataURL => {
            this.audio.backgroundMusic = new Audio(dataURL);
            this.audio.backgroundMusic.loop = true;
            this.audio.backgroundMusic.volume = this.audio.musicVolume;
        });
    }
    
    createSoundEffects() {
        // Create procedural sound effects
        this.audio.sounds = {
            walk: this.createWalkSound(),
            building: this.createBuildingSound(),
            heart: this.createHeartSound(),
            llama: this.createLlamaSound(),
            float: this.createFloatSound(),
            ambient: this.createAmbientSounds(),
            fire: this.createFireSound(),
            windmill: this.createWindmillSound(),
            splash: this.createSplashSound(),
            bell: this.createBellSound()
        };
    }
    
    createWalkSound() {
        // Create footstep sound using noise
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, 0.1 * this.audioContext.sampleRate, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.1;
            }
            
            noise.buffer = buffer;
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.audio.soundVolume * 0.2;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
        };
    }
    
    createBuildingSound() {
        // Create building interaction sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
            
            gain.gain.value = this.audio.soundVolume * 0.3;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createHeartSound() {
        // Create heart effect sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 600;
            
            gain.gain.value = this.audio.soundVolume * 0.2;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
            
            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }
    
    createLlamaSound() {
        // Create llama effect sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 300;
            oscillator.frequency.linearRampToValueAtTime(250, this.audioContext.currentTime + 0.1);
            
            gain.gain.value = this.audio.soundVolume * 0.25;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createFloatSound() {
        // Create floating/teleportation sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 400;
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
            
            gain.gain.value = this.audio.soundVolume * 0.3;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createAmbientSounds() {
        // Create ambient nature sounds
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            // Gentle wind sound
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, 2 * this.audioContext.sampleRate, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.05;
            }
            
            noise.buffer = buffer;
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.audio.soundVolume * 0.1;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
        };
    }
    
    createFireSound() {
        // Create crackling fire sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            // Generate crackling noise for fire
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, 0.5 * this.audioContext.sampleRate, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                // Create irregular crackling pattern
                const crackle = (Math.random() * 2 - 1) * Math.pow(Math.random(), 2);
                data[i] = crackle * 0.15;
            }
            
            noise.buffer = buffer;
            
            // Filter to make it sound more like fire
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 200;
            
            const filter2 = this.audioContext.createBiquadFilter();
            filter2.type = 'lowpass';
            filter2.frequency.value = 2000;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.audio.soundVolume * 0.2;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            noise.connect(filter);
            filter.connect(filter2);
            filter2.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
        };
    }
    
    createWindmillSound() {
        // Create whooshing windmill blade sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            // Create whoosh sound with frequency modulation
            const oscillator = this.audioContext.createOscillator();
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            const gain = this.audioContext.createGain();
            
            // Base frequency for wind sound
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 80;
            
            // LFO for whooshing effect
            lfo.type = 'sine';
            lfo.frequency.value = 2; // 2 Hz for spinning effect
            lfoGain.gain.value = 30;
            
            // Filter for wind-like sound
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filter.Q.value = 2;
            
            gain.gain.value = this.audio.soundVolume * 0.15;
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
            
            // Connect LFO to modulate main oscillator frequency
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            oscillator.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            oscillator.start();
            lfo.start();
            oscillator.stop(this.audioContext.currentTime + 1.5);
            lfo.stop(this.audioContext.currentTime + 1.5);
        };
    }
    
    createSplashSound() {
        // Create fish splashing sound
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            // Create splash sound using noise burst with envelope
            const noise = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, 0.3 * this.audioContext.sampleRate, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / data.length;
                // Create splash envelope - sharp attack, quick decay
                const envelope = Math.exp(-t * 8) * (1 - t);
                data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
            }
            
            noise.buffer = buffer;
            
            // Filter to simulate water splash
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 3;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.audio.soundVolume * 0.25;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
        };
    }
    
    createBellSound() {
        // Create realistic church bell sound with harmonics
        return () => {
            if (!this.audioContext || !this.audio.soundEnabled) return;
            
            const duration = 2.0; // Bell rings for 2 seconds
            const fundamental = 220; // A3 note
            
            // Create multiple oscillators for bell harmonics
            const harmonics = [
                { freq: fundamental, gain: 0.4 },
                { freq: fundamental * 2.01, gain: 0.3 }, // Slightly detuned octave
                { freq: fundamental * 3.03, gain: 0.2 },
                { freq: fundamental * 4.05, gain: 0.15 },
                { freq: fundamental * 5.07, gain: 0.1 }
            ];
            
            harmonics.forEach((harmonic, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                osc.type = 'sine';
                osc.frequency.value = harmonic.freq;
                
                // Bell envelope - quick attack, long decay with beating
                const now = this.audioContext.currentTime;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(harmonic.gain * this.audio.soundVolume * 0.3, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(harmonic.gain * this.audio.soundVolume * 0.1, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                // Add slight frequency modulation for realistic bell shimmer
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                lfo.frequency.value = 3 + index * 0.5; // Different modulation rates
                lfoGain.gain.value = harmonic.freq * 0.01; // Slight vibrato
                
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                
                // Low-pass filter to soften the bell sound
                filter.type = 'lowpass';
                filter.frequency.value = 3000 - index * 200;
                filter.Q.value = 1;
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.start(now);
                lfo.start(now);
                osc.stop(now + duration);
                lfo.stop(now + duration);
            });
        };
    }
    
    // Helper function to convert audio buffer to data URL
    bufferToDataURL(buffer) {
        return new Promise((resolve) => {
            const length = buffer.length;
            const channels = buffer.numberOfChannels;
            const bytesPerSample = 2; // 16-bit
            const dataSize = length * channels * bytesPerSample;
            const arrayBuffer = new ArrayBuffer(44 + dataSize);
            const view = new DataView(arrayBuffer);
            
            // WAV header
            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };
            
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + dataSize, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); // PCM format
            view.setUint16(22, channels, true); // Number of channels
            view.setUint32(24, buffer.sampleRate, true);
            view.setUint32(28, buffer.sampleRate * channels * bytesPerSample, true);
            view.setUint16(32, channels * bytesPerSample, true);
            view.setUint16(34, 16, true); // Bits per sample
            writeString(36, 'data');
            view.setUint32(40, dataSize, true);
            
            // Write audio data
            let offset = 44;
            for (let i = 0; i < length; i++) {
                for (let channel = 0; channel < channels; channel++) {
                    const channelData = buffer.getChannelData(channel);
                    const sample = Math.max(-1, Math.min(1, channelData[i])); // Clamp
                    view.setInt16(offset, sample * 0x7FFF, true);
                    offset += 2;
                }
            }
            
            const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
            resolve(URL.createObjectURL(blob));
        });
    }
    
    playSound(soundName) {
        if (this.audio.sounds[soundName]) {
            this.audio.sounds[soundName]();
        }
    }
    
    startBackgroundMusic() {
        if (this.audio.backgroundMusic && this.audio.musicEnabled) {
            this.audio.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    stopBackgroundMusic() {
        if (this.audio.backgroundMusic) {
            this.audio.backgroundMusic.pause();
        }
    }
    
    toggleMusic() {
        this.audio.musicEnabled = !this.audio.musicEnabled;
        if (this.audio.musicEnabled) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    }
    
    toggleSounds() {
        this.audio.soundEnabled = !this.audio.soundEnabled;
    }
    
    startAudioOnInteraction() {
        const startAudio = () => {
            // Start background music
            this.startBackgroundMusic();
            
            // Start ambient sounds
            this.playSound('ambient');
            
            // Set up periodic ambient sounds
            setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance every interval
                    this.playSound('ambient');
                }
            }, 8000); // Every 8 seconds
        };
        
        // Start audio after first user interaction
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
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
            {type: 'windmill', x: 500, y: 100, width: 120, height: 180},
            {type: 'machupicchu', x: 100, y: 1200, width: 200, height: 140},
            {type: 'riodejaneiro', x: 450, y: 1200, width: 200, height: 140},
            {type: 'sanmigueldeallende', x: 800, y: 1200, width: 200, height: 140},
            {type: 'okinawa', x: 1150, y: 1200, width: 200, height: 140}
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
        
        // Poop - add to garden elements
        this.gardenElements.push({
            type: 'poop',
            x: this.poop.x,
            y: this.poop.y,
            width: this.poop.width,
            height: this.poop.height,
            solid: false,
            shadowOffsetX: 2,
            shadowOffsetY: 2
        });
        
        console.log('Bike added to garden at:', this.bike.x, this.bike.y);
        console.log('Poop added to garden at:', this.poop.x, this.poop.y);
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Audio controls
            if (e.code === 'KeyM') {
                this.toggleMusic();
                e.preventDefault();
                return;
            }
            if (e.code === 'KeyN') {
                this.toggleSounds();
                e.preventDefault();
                return;
            }
            
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
        
        // Update particles
        this.updateParticles();
        
        // Update explosion
        this.updateExplosion();
        
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
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            
            // Add gravity for sparkles
            if (particle.type === 'sparkle') {
                particle.velocityY += 0.1;
            }
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
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
        
        // Check if player enters the mountain top/sky area (y < 150) 
        if (newY < 150 && !this.player.isFloating) {
            // Start floating
            this.player.isFloating = true;
            this.player.floatingTimer = 0;
            this.player.floatingStartY = newY;
            
            // Play floating sound effect
            this.playSound('float');
            
            // Teleport to random safe location after floating animation
            setTimeout(() => {
                this.teleportPlayerToRandomLocation();
            }, 2000); // 2 seconds of floating
        }
        
        // Check world boundaries (but allow mountain top area if floating)
        if (this.player.isFloating) {
            // When floating, allow movement in sky but keep within world bounds
            newX = Math.max(0, Math.min(this.worldWidth - this.player.width, newX));
            // Allow y to go into sky area when floating
            newY = Math.max(-100, Math.min(this.worldHeight - this.player.height, newY));
        } else {
            // Normal boundary checking - prevent entering mountain top area (y < 150)
            newX = Math.max(0, Math.min(this.worldWidth - this.player.width, newX));
            newY = Math.max(150, Math.min(this.worldHeight - this.player.height, newY));
        }
        
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
            // Check if player actually moved
            const moved = (Math.abs(this.player.x - newX) > 0.1 || Math.abs(this.player.y - newY) > 0.1);
            
            this.player.x = newX;
            this.player.y = newY;
            
            // Play footstep sound if player moved
            if (moved && this.player.isMoving) {
                // Throttle footstep sounds
                if (!this.lastFootstepTime || Date.now() - this.lastFootstepTime > 300) {
                    this.playSound('walk');
                    this.lastFootstepTime = Date.now();
                }
            }
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
        // Handle floating animation
        if (this.player.isFloating) {
            this.player.floatingTimer++;
            // Gentle floating up and down motion
            const floatOffset = Math.sin(this.player.floatingTimer * 0.1) * 10;
            this.player.y = this.player.floatingStartY + floatOffset - this.player.floatingTimer * 0.2; // Slow upward drift
            
            // Gentle floating animation
            this.player.animTimer++;
            if (this.player.animTimer > 30) { // Slower floating animation
                this.player.animFrame = (this.player.animFrame + 1) % 2;
                this.player.animTimer = 0;
            }
        } else if (this.player.isMoving) {
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
                // Man appears for the first time
                this.man.visible = true;
                this.man.facing = 'left'; // Face toward the player
                
                // Play bike sound effect when first approaching
                this.playSound('building');
            }
            
            // Show message every time player gets close to bike (if not already showing)
            if (!this.interaction.showingMessage) {
                this.interaction.showingMessage = true;
                this.interaction.messageTimer = 0;
            }
        } else {
            // Once the man appears, he never disappears (commenting out the disappearing logic)
            // if (this.man.visible && !this.man.isFollowing && distanceToBike > 120) {
            //     this.man.visible = false;
            //     this.interaction.showingMessage = false;
            //     this.interaction.messageTimer = 0;
            // }
        }
        
        // Update message timer
        if (this.interaction.showingMessage) {
            this.interaction.messageTimer++;
            if (this.interaction.messageTimer > 300) { // Show for 5 seconds
                this.interaction.showingMessage = false;
                // Don't reset messageTimer here - keep it for following logic
            }
        }
        
        // Start following after message has been shown (even if message is closed)
        if (this.man.visible && !this.man.isFollowing && this.interaction.messageTimer > 120) {
            this.man.isFollowing = true;
        }
        
        // Simple man animation when visible
        if (this.man.visible) {
            this.man.animTimer++;
            if (this.man.animTimer > 30) { // Slower, calm animation
                this.man.animFrame = (this.man.animFrame + 1) % 2;
                this.man.animTimer = 0;
            }
            
            // Man following behavior
            if (this.man.isFollowing) {
                this.updateManFollowing();
            }
        }
        
        // Check distance to windmill (500, 100)
        const distanceToWindmill = Math.sqrt(
            Math.pow(this.player.x - 500, 2) + 
            Math.pow(this.player.y - 100, 2)
        );
        
        if (distanceToWindmill < 200 && !this.effects.windmill.spinning) {
            this.effects.windmill.spinning = true;
            this.effects.windmill.spinTimer = 0;
            this.effects.windmill.spinSpeed = 0.2;
            
            // Play windmill spinning sound
            this.playSound('windmill');
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
        
        if (distanceToSushiro < 125 && !this.effects.sushiro.fishJumping) {
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
        
        // Check distance to Machu Picchu (100, 1200)
        const distanceToMachuPicchu = Math.sqrt(
            Math.pow(this.player.x - 100, 2) + 
            Math.pow(this.player.y - 1200, 2)
        );
        
        if (distanceToMachuPicchu < 100 && !this.effects.machuPicchu.llamasJumping) {
            this.effects.machuPicchu.llamasJumping = true;
            this.effects.machuPicchu.llamaTimer = 0;
            this.createJumpingLlamas();
        }
        
        // Update Machu Picchu llamas jumping
        if (this.effects.machuPicchu.llamasJumping) {
            this.effects.machuPicchu.llamaTimer++;
            this.updateJumpingLlamas();
            if (this.effects.machuPicchu.llamaTimer > 250) { // 5 seconds
                this.effects.machuPicchu.llamasJumping = false;
                this.effects.machuPicchu.llamas = [];
            }
        }
        
        // Check distance to Rio de Janeiro (450, 1200)
        const distanceToRio = Math.sqrt(
            Math.pow(this.player.x - 450, 2) + 
            Math.pow(this.player.y - 1200, 2)
        );
        
        if (distanceToRio < 100 && !this.effects.rioDeJaneiro.fireworksActive) {
            this.effects.rioDeJaneiro.fireworksActive = true;
            this.effects.rioDeJaneiro.fireworksTimer = 0;
            this.createFireworks();
        }
        
        // Update Rio fireworks
        if (this.effects.rioDeJaneiro.fireworksActive) {
            this.effects.rioDeJaneiro.fireworksTimer++;
            this.updateFireworks();
            if (this.effects.rioDeJaneiro.fireworksTimer > 300) { // 6 seconds
                this.effects.rioDeJaneiro.fireworksActive = false;
                this.effects.rioDeJaneiro.fireworks = [];
            }
        }
        
        // Check distance to San Miguel de Allende (800, 1200)
        const distanceToSanMiguel = Math.sqrt(
            Math.pow(this.player.x - 800, 2) + 
            Math.pow(this.player.y - 1200, 2)
        );
        
        if (distanceToSanMiguel < 100 && !this.effects.sanMiguelDeAllende.bellsRinging) {
            this.effects.sanMiguelDeAllende.bellsRinging = true;
            this.effects.sanMiguelDeAllende.bellTimer = 0;
            this.createBells();
        }
        
        // Update San Miguel bells
        if (this.effects.sanMiguelDeAllende.bellsRinging) {
            this.effects.sanMiguelDeAllende.bellTimer++;
            this.updateBells();
            if (this.effects.sanMiguelDeAllende.bellTimer > 280) { // 5.6 seconds
                this.effects.sanMiguelDeAllende.bellsRinging = false;
                this.effects.sanMiguelDeAllende.bells = [];
            }
        }
        
        // Check distance to Okinawa (1150, 1200)
        const distanceToOkinawa = Math.sqrt(
            Math.pow(this.player.x - 1150, 2) + 
            Math.pow(this.player.y - 1200, 2)
        );
        
        if (distanceToOkinawa < 100 && !this.effects.okinawa.shakuhachisPlaying) {
            this.effects.okinawa.shakuhachisPlaying = true;
            this.effects.okinawa.shakuhachiTimer = 0;
            this.createSakuraPetals();
        }
        
        // Update Okinawa shakuhachi and sakura petals
        if (this.effects.okinawa.shakuhachisPlaying) {
            this.effects.okinawa.shakuhachiTimer++;
            this.updateSakuraPetals();
            if (this.effects.okinawa.shakuhachiTimer > 350) { // 7 seconds
                this.effects.okinawa.shakuhachisPlaying = false;
                this.effects.okinawa.sakuraPetals = [];
            }
        }
        
        // Check collision with poop
        const distanceToPoop = Math.sqrt(
            Math.pow(this.player.x - this.poop.x, 2) + 
            Math.pow(this.player.y - this.poop.y, 2)
        );
        
        // If player steps on poop (within 20 pixels)
        if (distanceToPoop < 25 && !this.explosion.active) {
            this.triggerExplosion();
        }
    }
    
    updateManFollowing() {
        // Calculate distance to player
        const deltaX = this.player.x - this.man.x;
        const deltaY = this.player.y - this.man.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Follow if too far away (maintain some distance)
        const followDistance = 100; // Stay about 100 pixels away
        
        if (distance > followDistance) {
            // Move toward player but not too close
            const moveX = (deltaX / distance) * this.man.speed;
            const moveY = (deltaY / distance) * this.man.speed;
            
            const newX = this.man.x + moveX;
            const newY = this.man.y + moveY;
            
            // Check collision with garden elements
            const manRect = {x: newX, y: newY, width: this.man.width, height: this.man.height};
            let collision = false;
            
            for (let element of this.gardenElements) {
                if (element.solid && this.checkCollision(manRect, element)) {
                    collision = true;
                    break;
                }
            }
            
            // Update position if no collision
            if (!collision) {
                this.man.x = Math.max(0, Math.min(this.worldWidth - this.man.width, newX));
                this.man.y = Math.max(0, Math.min(this.worldHeight - this.man.height, newY));
                
                // Update facing direction based on movement
                if (Math.abs(moveX) > Math.abs(moveY)) {
                    this.man.facing = moveX > 0 ? 'right' : 'left';
                } else {
                    this.man.facing = moveY > 0 ? 'down' : 'up';
                }
            } else {
                // If collision, try to move around the obstacle
                // Try moving horizontally first
                const horizontalRect = {x: newX, y: this.man.y, width: this.man.width, height: this.man.height};
                let horizontalCollision = false;
                
                for (let element of this.gardenElements) {
                    if (element.solid && this.checkCollision(horizontalRect, element)) {
                        horizontalCollision = true;
                        break;
                    }
                }
                
                if (!horizontalCollision) {
                    this.man.x = Math.max(0, Math.min(this.worldWidth - this.man.width, newX));
                    this.man.facing = moveX > 0 ? 'right' : 'left';
                } else {
                    // Try moving vertically
                    const verticalRect = {x: this.man.x, y: newY, width: this.man.width, height: this.man.height};
                    let verticalCollision = false;
                    
                    for (let element of this.gardenElements) {
                        if (element.solid && this.checkCollision(verticalRect, element)) {
                            verticalCollision = true;
                            break;
                        }
                    }
                    
                    if (!verticalCollision) {
                        this.man.y = Math.max(0, Math.min(this.worldHeight - this.man.height, newY));
                        this.man.facing = moveY > 0 ? 'down' : 'up';
                    }
                }
            }
        }
    }
    
    teleportPlayerToRandomLocation() {
        // Find a safe random location on the ground (y > 300)
        let attempts = 0;
        let safeLocation = false;
        let newX, newY;
        
        while (!safeLocation && attempts < 50) {
            newX = Math.random() * (this.worldWidth - this.player.width);
            newY = 400 + Math.random() * (this.worldHeight - 500); // Ground area
            
            // Check if location is safe (no collision with solid elements)
            const testRect = {x: newX, y: newY, width: this.player.width, height: this.player.height};
            let collision = false;
            
            for (let element of this.gardenElements) {
                if (element.solid && this.checkCollision(testRect, element)) {
                    collision = true;
                    break;
                }
            }
            
            if (!collision) {
                safeLocation = true;
            }
            attempts++;
        }
        
        // If no safe location found, use a default safe spot
        if (!safeLocation) {
            newX = 400;
            newY = 600;
        }
        
        // Teleport player
        this.player.x = newX;
        this.player.y = newY;
        this.player.isFloating = false;
        this.player.floatingTimer = 0;
        
        // Create sparkle effect at new location
        this.createTeleportSparkles(newX, newY);
    }
    
    createTeleportSparkles(x, y) {
        // Add sparkle particles at teleport location
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x + this.player.width / 2,
                y: y + this.player.height / 2,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: (Math.random() - 0.5) * 6,
                life: 60,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                type: 'sparkle'
            });
        }
    }
    
    triggerExplosion() {
        this.explosion.active = true;
        this.explosion.timer = 0;
        this.explosion.particles = [];
        
        // Play explosion sound
        this.playSound('fire');
        
        // Create explosion particles
        for (let i = 0; i < 100; i++) {
            this.explosion.particles.push({
                x: this.poop.x + 16, // Center of poop
                y: this.poop.y + 12,
                velocityX: (Math.random() - 0.5) * 20,
                velocityY: (Math.random() - 0.5) * 20 - 5,
                life: 60 + Math.random() * 60,
                maxLife: 60 + Math.random() * 60,
                size: 2 + Math.random() * 8,
                color: ['#FF4500', '#FF6347', '#FFD700', '#FF8C00', '#B22222'][Math.floor(Math.random() * 5)]
            });
        }
        
        // Schedule respawn at home after explosion
        setTimeout(() => {
            this.respawnAtHome();
        }, 300); // 2 seconds
    }
    
    respawnAtHome() {
        // Find the home position (800, 300)
        this.player.x = 730;
        this.player.y = 400;
        this.player.isFloating = false;
        this.player.floatingTimer = 0;
        
        // End explosion
        this.explosion.active = false;
        this.explosion.particles = [];
        
        // Create sparkle effect at home
        this.createTeleportSparkles(800, 300);
    }
    
    updateExplosion() {
        if (!this.explosion.active) return;
        
        this.explosion.timer++;
        
        // Update explosion particles
        this.explosion.particles.forEach((particle, index) => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.5; // Gravity
            particle.life--;
            
            if (particle.life <= 0) {
                this.explosion.particles.splice(index, 1);
            }
        });
    }
    
    createFireParticles() {
        this.effects.dentalClinic.fireParticles = [];
        
        // Play fire crackling sound
        this.playSound('fire');
        
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
        
        // Play splash sound effect
        this.playSound('splash');
        
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
                    case 'machupicchu': sprite = this.machuPicchuSprite; break;
                    case 'riodejaneiro': sprite = this.rioDeJaneiroSprite; break;
                    case 'sanmigueldeallende': sprite = this.sanMiguelDeAllendeSprite; break;
                    case 'okinawa': sprite = this.okinawaSprite; break;
                    case 'bike': sprite = this.bikeSprite; break;
                    case 'poop': sprite = this.poopSprite; break;
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
        
        // Draw sky elements (sun and clouds) on top of everything
        this.drawSky();
        
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
    
    drawSky() {
        // Safety check: ensure sky system is initialized
        if (!this.sky || !this.sky.sun || !this.sky.clouds) {
            return;
        }
        
        // Draw sun
        const sun = this.sky.sun;
        const time = Date.now() * 0.001; // Convert to seconds for smoother animation
        
        // Safety check for sun properties
        if (!isFinite(sun.x) || !isFinite(sun.y) || !isFinite(sun.size) || !isFinite(sun.glowSize)) {
            return;
        }
        
        // Sun glow effect
        const sunGradient = this.ctx.createRadialGradient(
            sun.x, sun.y, 0,
            sun.x, sun.y, sun.glowSize
        );
        sunGradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
        sunGradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.4)');
        sunGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sun.x, sun.y, sun.glowSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sun core
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(sun.x, sun.y, sun.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw clouds with realistic appearance
        this.sky.clouds.forEach((cloud, index) => {
            // Safety check and reset for cloud properties
            if (!isFinite(cloud.x) || !isFinite(cloud.y) || !isFinite(cloud.width) || !isFinite(cloud.height) || !isFinite(cloud.speed)) {
                // Reset the cloud to valid values
                cloud.x = Math.random() * this.worldWidth;
                cloud.y = 20 + Math.random() * 80;
                cloud.speed = 0.2 + Math.random() * 0.6;
                if (!isFinite(cloud.width)) cloud.width = 120 + Math.random() * 100;
                if (!isFinite(cloud.height)) cloud.height = 60 + Math.random() * 50;
                return;
            }
            
            // Update cloud position for movement with safety checks
            const newX = cloud.x + cloud.speed;
            const newY = cloud.y + Math.sin(time + cloud.phase) * 0.5; // Gentle floating
            
            // Only update if the new values are finite
            if (isFinite(newX)) {
                cloud.x = newX;
            }
            if (isFinite(newY)) {
                cloud.y = newY;
            }
            
            // Wrap clouds around when they go off screen
            if (cloud.x > this.worldWidth + cloud.width) {
                cloud.x = -cloud.width;
            }
            
            // Draw realistic cloud using multiple overlapping circles (puffs)
            cloud.puffs.forEach(puff => {
                const puffX = cloud.x + puff.x;
                const puffY = cloud.y + puff.y + Math.sin(time + cloud.phase + puff.x * 0.01) * 2;
                
                // Create soft gradient for each puff
                const puffGradient = this.ctx.createRadialGradient(
                    puffX, puffY, 0,
                    puffX, puffY, puff.size
                );
                
                const baseOpacity = cloud.opacity * puff.opacity;
                puffGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`);
                puffGradient.addColorStop(0.4, `rgba(250, 250, 255, ${baseOpacity * 0.8})`);
                puffGradient.addColorStop(0.7, `rgba(240, 245, 255, ${baseOpacity * 0.4})`);
                puffGradient.addColorStop(1, `rgba(230, 240, 255, 0)`);
                
                this.ctx.fillStyle = puffGradient;
                this.ctx.beginPath();
                this.ctx.arc(puffX, puffY, puff.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            // Add subtle cloud shadow for depth
            this.ctx.fillStyle = `rgba(200, 200, 220, ${cloud.opacity * 0.1})`;
            cloud.puffs.forEach(puff => {
                const shadowX = cloud.x + puff.x + 2;
                const shadowY = cloud.y + puff.y + 2;
                this.ctx.beginPath();
                this.ctx.arc(shadowX, shadowY, puff.size * 0.9, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
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
        
        // Play heart sound effect
        this.playSound('heart');
        
        for (let i = 0; i < 5; i++) { // Reduced from 15 to 5 hearts
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
        
        // Add new hearts occasionally (reduced frequency)
        if (Math.random() < 0.04 && this.effects.house.hearts.length < 8) { // Much less frequent + max limit
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
    
    createJumpingLlamas() {
        this.effects.machuPicchu.llamas = [];
        
        // Play llama sound effect
        this.playSound('llama');
        
        for (let i = 0; i < 3; i++) { // Reduced from 8 to 3 llamas
            this.effects.machuPicchu.llamas.push({
                x: 120 + i * 40 + Math.random() * 20,
                y: 1220 + Math.random() * 40,
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: -Math.random() * 3 - 1,
                life: Math.random() * 200 + 150,
                size: Math.random() * 12 + 16, // Bigger llama emojis
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                bobSpeed: Math.random() * 0.1 + 0.05
            });
        }
    }
    
    updateJumpingLlamas() {
        this.effects.machuPicchu.llamas.forEach((llama, index) => {
            llama.x += llama.velocityX + Math.sin(llama.life * llama.bobSpeed) * 0.3;
            llama.y += llama.velocityY;
            llama.velocityY += 0.05; // Gravity
            llama.rotation += llama.rotationSpeed;
            llama.life--;
            
            if (llama.life <= 0 || llama.y > 1350) {
                this.effects.machuPicchu.llamas.splice(index, 1);
            }
        });
        
        // Add new llamas occasionally (reduced frequency)
        if (Math.random() < 0.05 && this.effects.machuPicchu.llamas.length < 5) { // Much less frequent + max limit
            this.effects.machuPicchu.llamas.push({
                x: 120 + Math.random() * 160,
                y: 1300, // From ground level near Machu Picchu
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: -Math.random() * 3 - 1,
                life: Math.random() * 200 + 150,
                size: Math.random() * 12 + 16,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                bobSpeed: Math.random() * 0.1 + 0.05
            });
        }
    }
    
    createFireworks() {
        this.effects.rioDeJaneiro.fireworks = [];
        
        // Play fireworks sound effect (using existing sound)
        this.playSound('splash');
        
        for (let i = 0; i < 4; i++) {
            this.effects.rioDeJaneiro.fireworks.push({
                x: 470 + i * 40 + Math.random() * 20,
                y: 1220 + Math.random() * 40,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 4 - 2,
                life: Math.random() * 180 + 120,
                color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 5)],
                size: Math.random() * 8 + 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                sparkles: []
            });
        }
    }
    
    updateFireworks() {
        this.effects.rioDeJaneiro.fireworks.forEach((firework, index) => {
            firework.x += firework.velocityX;
            firework.y += firework.velocityY;
            firework.velocityY += 0.06; // Gravity
            firework.rotation += firework.rotationSpeed;
            firework.life--;
            
            // Create sparkle trail
            if (Math.random() < 0.3) {
                firework.sparkles.push({
                    x: firework.x,
                    y: firework.y,
                    life: 20,
                    size: Math.random() * 3 + 2
                });
            }
            
            // Update sparkles
            firework.sparkles = firework.sparkles.filter(sparkle => {
                sparkle.life--;
                return sparkle.life > 0;
            });
            
            if (firework.life <= 0 || firework.y > 1380) {
                this.effects.rioDeJaneiro.fireworks.splice(index, 1);
            }
        });
        
        // Add new fireworks occasionally
        if (Math.random() < 0.08 && this.effects.rioDeJaneiro.fireworks.length < 6) {
            this.effects.rioDeJaneiro.fireworks.push({
                x: 470 + Math.random() * 160,
                y: 1320,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 4 - 2,
                life: Math.random() * 180 + 120,
                color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 5)],
                size: Math.random() * 8 + 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                sparkles: []
            });
        }
    }
    
    createBells() {
        this.effects.sanMiguelDeAllende.bells = [];
        
        // Play bell sound effect (realistic church bell)
        this.playSound('bell');
        
        for (let i = 0; i < 4; i++) {
            this.effects.sanMiguelDeAllende.bells.push({
                x: 820 + i * 50 + Math.random() * 20,
                y: 1180 + Math.random() * 30,
                velocityX: (Math.random() - 0.5) * 1,
                velocityY: -Math.random() * 1 - 0.2,
                life: Math.random() * 200 + 150,
                size: Math.random() * 8 + 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                swingPhase: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.1 + 0.05,
                color: ['#FFD700', '#FFA500', '#B8860B'][Math.floor(Math.random() * 3)] // Gold/bronze colors
            });
        }
    }
    
    updateBells() {
        this.effects.sanMiguelDeAllende.bells.forEach((bell, index) => {
            bell.x += bell.velocityX + Math.sin(bell.swingPhase) * 0.8;
            bell.y += bell.velocityY;
            bell.velocityY += 0.03; // Very gentle gravity
            bell.rotation += bell.rotationSpeed;
            bell.swingPhase += bell.swingSpeed;
            bell.life--;
            
            if (bell.life <= 0 || bell.y > 1380) {
                this.effects.sanMiguelDeAllende.bells.splice(index, 1);
            }
        });
        
        // Add new bells occasionally
        if (Math.random() < 0.04 && this.effects.sanMiguelDeAllende.bells.length < 6) {
            this.effects.sanMiguelDeAllende.bells.push({
                x: 820 + Math.random() * 160,
                y: 1180,
                velocityX: (Math.random() - 0.5) * 1,
                velocityY: -Math.random() * 1 - 0.2,
                life: Math.random() * 200 + 150,
                size: Math.random() * 8 + 12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                swingPhase: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.1 + 0.05,
                color: ['#FFD700', '#FFA500', '#B8860B'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    createSakuraPetals() {
        this.effects.okinawa.sakuraPetals = [];
        
        // Play zen sound effect (using existing sound)
        this.playSound('float');
        
        for (let i = 0; i < 5; i++) {
            this.effects.okinawa.sakuraPetals.push({
                x: 1170 + i * 35 + Math.random() * 20,
                y: 1220 + Math.random() * 40,
                velocityX: (Math.random() - 0.5) * 1.5,
                velocityY: -Math.random() * 1.5 - 0.3,
                life: Math.random() * 300 + 250,
                color: ['#FFB7C5', '#FFC0CB', '#FFCCCB', '#F8BBD9', '#F5A9BC'][Math.floor(Math.random() * 5)],
                size: Math.random() * 4 + 6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.06,
                driftSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    updateSakuraPetals() {
        this.effects.okinawa.sakuraPetals.forEach((petal, index) => {
            petal.x += petal.velocityX + Math.sin(petal.life * petal.driftSpeed) * 0.8;
            petal.y += petal.velocityY;
            petal.velocityY += 0.02; // Very gentle gravity
            petal.rotation += petal.rotationSpeed;
            petal.life--;
            
            if (petal.life <= 0 || petal.y > 1380) {
                this.effects.okinawa.sakuraPetals.splice(index, 1);
            }
        });
        
        // Add new petals occasionally
        if (Math.random() < 0.04 && this.effects.okinawa.sakuraPetals.length < 7) {
            this.effects.okinawa.sakuraPetals.push({
                x: 1020 + Math.random() * 160,
                y: 1320,
                velocityX: (Math.random() - 0.5) * 1.5,
                velocityY: -Math.random() * 1.5 - 0.3,
                life: Math.random() * 300 + 250,
                color: ['#FFB7C5', '#FFC0CB', '#FFCCCB', '#F8BBD9', '#F5A9BC'][Math.floor(Math.random() * 5)],
                size: Math.random() * 4 + 6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.06,
                driftSpeed: Math.random() * 0.02 + 0.01
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
        // Draw sparkle particles (teleport effects)
        this.particles.forEach(particle => {
            if (particle.type === 'sparkle') {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.globalAlpha = Math.max(0, particle.life / 60);
                this.ctx.fillStyle = particle.color;
                this.ctx.font = `${particle.size * 2}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('✨', 0, particle.size);
                this.ctx.restore();
            }
        });
        
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
        
        // Draw jumping llamas from Machu Picchu
        if (this.effects.machuPicchu.llamasJumping) {
            this.effects.machuPicchu.llamas.forEach(llama => {
                this.ctx.save();
                this.ctx.translate(llama.x, llama.y);
                this.ctx.rotate(llama.rotation);
                this.ctx.globalAlpha = 1.0; // Fully opaque
                
                // Add a subtle background for better visibility
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(0, llama.size * 0.3, llama.size * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw the llama emoji with enhanced visibility
                this.ctx.fillStyle = '#8B4513'; // Brown color fallback
                this.ctx.font = `bold ${llama.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.strokeStyle = '#654321';
                this.ctx.lineWidth = 1;
                this.ctx.strokeText('🦙', 0, llama.size * 0.3);
                this.ctx.fillText('🦙', 0, llama.size * 0.3);
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
        }
        
        // Draw fireworks from Rio de Janeiro
        if (this.effects.rioDeJaneiro.fireworksActive) {
            this.effects.rioDeJaneiro.fireworks.forEach(firework => {
                this.ctx.save();
                this.ctx.translate(firework.x, firework.y);
                this.ctx.rotate(firework.rotation);
                this.ctx.globalAlpha = Math.min(1.0, firework.life / 100);
                
                // Draw firework burst
                this.ctx.fillStyle = firework.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = firework.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, firework.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw sparkle trails
                firework.sparkles.forEach(sparkle => {
                    this.ctx.fillStyle = firework.color;
                    this.ctx.globalAlpha = sparkle.life / 20;
                    this.ctx.beginPath();
                    this.ctx.arc(sparkle.x - firework.x, sparkle.y - firework.y, sparkle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        }
        
        // Draw bells from San Miguel de Allende
        if (this.effects.sanMiguelDeAllende.bellsRinging) {
            this.effects.sanMiguelDeAllende.bells.forEach(bell => {
                this.ctx.save();
                this.ctx.translate(bell.x, bell.y);
                this.ctx.rotate(bell.rotation);
                this.ctx.globalAlpha = Math.min(1.0, bell.life / 120);
                
                // Draw bell shape
                this.ctx.fillStyle = bell.color;
                this.ctx.strokeStyle = '#8B4513';
                this.ctx.lineWidth = 2;
                
                // Bell body (trapezoid shape)
                this.ctx.beginPath();
                this.ctx.moveTo(-bell.size * 0.3, -bell.size * 0.4);
                this.ctx.lineTo(bell.size * 0.3, -bell.size * 0.4);
                this.ctx.lineTo(bell.size * 0.4, bell.size * 0.3);
                this.ctx.lineTo(-bell.size * 0.4, bell.size * 0.3);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                // Bell top
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(-bell.size * 0.1, -bell.size * 0.5, bell.size * 0.2, bell.size * 0.15);
                
                // Bell clapper
                this.ctx.fillStyle = '#2F4F4F';
                this.ctx.beginPath();
                this.ctx.arc(0, bell.size * 0.1, bell.size * 0.08, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
        }
        
        // Draw sakura petals from Okinawa
        if (this.effects.okinawa.shakuhachisPlaying) {
            this.effects.okinawa.sakuraPetals.forEach(petal => {
                this.ctx.save();
                this.ctx.translate(petal.x, petal.y);
                this.ctx.rotate(petal.rotation);
                this.ctx.globalAlpha = Math.min(1.0, petal.life / 200);
                
                // Draw petal shape
                this.ctx.fillStyle = petal.color;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, petal.size * 0.8, petal.size * 0.4, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add petal details
                this.ctx.strokeStyle = '#FF69B4';
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
        }
        
        // Draw explosion particles
        if (this.explosion.active) {
            this.explosion.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
                
                // Draw explosion particle
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = particle.size;
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            });
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            
            // Full screen explosion flash effect
            if (this.explosion.timer < 30) {
                const flashOpacity = (30 - this.explosion.timer) / 30 * 0.8;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
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