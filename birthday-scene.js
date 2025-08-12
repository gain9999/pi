// Utility function for smooth interpolation
Math.smoothstep = function(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
};

class BirthdayScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('canvas'),
            antialias: true
        });
        
        this.time = 0;
        this.mouse = { x: 0, y: 0 };
        this.flowers = [];
        this.waves = [];
        this.terrain = null;
        this.ocean = null;
        
        this.init();
        this.createTextures();
        this.createScene();
        this.setupEventListeners();
        this.animate();
        this.createFloatingHearts();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffd4a3); // Warm sunset color
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Better camera positioning - higher up, looking down the coastline
        this.camera.position.set(15, 35, 25);
        this.camera.lookAt(-5, 0, -30);
        this.camera.fov = 65;
        this.camera.updateProjectionMatrix();
        
        // Improved fog for atmospheric perspective
        this.scene.fog = new THREE.Fog(0xffd4a3, 30, 120);
    }
    
    createTextures() {
        // Terrain textures
        this.terrainTexture = this.createTerrainTexture();
        this.grassTexture = this.createPixelGrassTexture();
        this.rockTexture = this.createRockTexture();
        
        // Ocean texture
        this.oceanTexture = this.createOceanTexture();
        
        // Beach texture
        this.beachTexture = this.createBeachTexture();
        
        // Sky texture for skybox
        this.skyTexture = this.createSkyTexture();
        
        // Flower textures
        this.flowerTextures = {
            poppy: this.createFlowerTexture('poppy'),
            wildflower: this.createFlowerTexture('wildflower'),
            grass: this.createGrassTexture()
        };
        
        // Sun texture
        this.sunTexture = this.createSunTexture();
    }
    
    createTerrainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Base terrain color (rocky/earthy)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, 128, 128);
        
        // Add rocky texture
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < 64; i += 8) {
            for (let j = 0; j < 64; j += 8) {
                if (Math.random() > 0.6) {
                    ctx.fillRect(i, j, 8, 8);
                }
            }
        }
        
        // Add some grass patches
        ctx.fillStyle = '#6B8E23';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const size = Math.random() * 4 + 2;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(16, 16);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createPixelGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base grass color
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 64, 64);
        
        // Add grass variation
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 64; i += 4) {
            for (let j = 0; j < 64; j += 4) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(i, j, 4, 4);
                }
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createRockTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base rock color
        ctx.fillStyle = '#696969';
        ctx.fillRect(0, 0, 64, 64);
        
        // Add rock texture
        ctx.fillStyle = '#2F4F4F';
        for (let i = 0; i < 64; i += 8) {
            for (let j = 0; j < 64; j += 8) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(i, j, 8, 8);
                }
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createOceanTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Ocean gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#4682B4');
        gradient.addColorStop(0.5, '#1E90FF');
        gradient.addColorStop(1, '#000080');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        // Add wave patterns
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 128; i += 16) {
            ctx.fillRect(0, i, 128, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createSkyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#ff6b6b');    // Sunset pink
        gradient.addColorStop(0.3, '#ffa07a');  // Light salmon
        gradient.addColorStop(0.6, '#ffd93d');  // Golden yellow
        gradient.addColorStop(0.8, '#ffb347');  // Peach
        gradient.addColorStop(1, '#ff8c69');    // Coral
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);
        
        // Add some clouds
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 100 + 50;
            const width = Math.random() * 80 + 40;
            const height = Math.random() * 30 + 15;
            
            ctx.beginPath();
            ctx.arc(x, y, width/2, 0, Math.PI * 2);
            ctx.arc(x + width/3, y, height/2, 0, Math.PI * 2);
            ctx.arc(x - width/3, y, height/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createMountainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Mountain silhouette
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(0, 128);
        
        for (let i = 0; i <= 512; i += 8) {
            const height = Math.sin(i * 0.01) * 30 + Math.sin(i * 0.005) * 50 + 40;
            ctx.lineTo(i, 128 - height);
        }
        
        ctx.lineTo(512, 128);
        ctx.closePath();
        ctx.fill();
        
        // Add some highlights
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.moveTo(0, 128);
        
        for (let i = 0; i <= 512; i += 8) {
            const height = Math.sin(i * 0.01) * 30 + Math.sin(i * 0.005) * 50 + 40;
            ctx.lineTo(i, 128 - height + 10);
        }
        
        ctx.lineTo(512, 128);
        ctx.closePath();
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createBeachTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Sand gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 64);
        gradient.addColorStop(0, '#f4e4bc');
        gradient.addColorStop(0.5, '#deb887');
        gradient.addColorStop(1, '#d2b48c');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 64);
        
        // Add sand texture
        ctx.fillStyle = 'rgba(210, 180, 140, 0.3)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 64;
            const size = Math.random() * 2 + 1;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = 4;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createWaveTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Water gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 32);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#4682b4');
        gradient.addColorStop(1, '#1e3a8a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 32);
        
        // Wave foam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        for (let i = 0; i <= 256; i += 4) {
            const height = Math.sin(i * 0.1) * 3 + 5;
            ctx.lineTo(i, height);
        }
        ctx.lineTo(256, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = 8;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createFlowerTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        // Stem
        ctx.fillStyle = '#228B22';
        ctx.fillRect(14, 24, 4, 24);
        
        if (type === 'poppy') {
            // California poppy
            ctx.fillStyle = '#ff6347';
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x = 16 + Math.cos(angle) * 8;
                const y = 20 + Math.sin(angle) * 8;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Center
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(16, 20, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Wildflower
            ctx.fillStyle = '#da70d6';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const x = 16 + Math.cos(angle) * 6;
                const y = 20 + Math.sin(angle) * 6;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Center
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(16, 20, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#32cd32';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 16;
            const height = Math.random() * 20 + 12;
            ctx.fillRect(x, 32 - height, 1, height);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Sun gradient
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.7, '#ffa500');
        gradient.addColorStop(1, '#ff4500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 48, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun rays
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x1 = 64 + Math.cos(angle) * 52;
            const y1 = 64 + Math.sin(angle) * 52;
            const x2 = 64 + Math.cos(angle) * 60;
            const y2 = 64 + Math.sin(angle) * 60;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
    
    createScene() {
        // Warm sunset lighting
        const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.4);
        this.scene.add(ambientLight);
        
        // Main sun light
        const sunLight = new THREE.DirectionalLight(0xffa500, 1.2);
        sunLight.position.set(-40, 60, -20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 150;
        sunLight.shadow.camera.left = -80;
        sunLight.shadow.camera.right = 80;
        sunLight.shadow.camera.top = 80;
        sunLight.shadow.camera.bottom = -80;
        sunLight.shadow.bias = -0.0001;
        this.scene.add(sunLight);
        
        // Fill light for softer shadows
        const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
        fillLight.position.set(30, 20, 30);
        this.scene.add(fillLight);
        
        // Create realistic terrain
        this.createRealisticTerrain();
        
        // Create beautiful ocean
        this.createRealisticOcean();
        
        // Create sun
        this.createRealisticSun();
        
        // Add vegetation
        this.create3DFlowers();
    }
    
    createRealisticTerrain() {
        // Create main terrain with higher resolution
        const terrainGeometry = new THREE.PlaneGeometry(150, 120, 80, 60);
        
        // Generate realistic height map
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Distance from ocean (negative z is ocean)
            const distanceFromOcean = Math.max(0, z + 40);
            
            // Multiple octaves of noise for natural terrain
            let height = 0;
            height += Math.sin(x * 0.03) * Math.cos(z * 0.02) * 8; // Large hills
            height += Math.sin(x * 0.08) * Math.cos(z * 0.06) * 3; // Medium details
            height += Math.sin(x * 0.15) * Math.cos(z * 0.12) * 1; // Fine details
            
            // Elevation increases inland with some randomness
            height += distanceFromOcean * 0.4 + Math.random() * 2;
            
            // Smooth coastline transition
            if (z > -45 && z < -20) {
                height *= Math.smoothstep(-45, -20, z);
            }
            
            vertices[i + 1] = Math.max(0, height);
        }
        
        terrainGeometry.computeVertexNormals();
        
        // Enhanced terrain material
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            map: this.terrainTexture,
            color: 0xc4a484
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.castShadow = true;
        this.scene.add(this.terrain);
        
        // Add vegetation layer
        const grassGeometry = new THREE.PlaneGeometry(140, 100, 60, 40);
        const grassVertices = grassGeometry.attributes.position.array;
        
        for (let i = 0; i < grassVertices.length; i += 3) {
            const x = grassVertices[i];
            const z = grassVertices[i + 2];
            const distanceFromOcean = Math.max(0, z + 40);
            
            let height = 0;
            height += Math.sin(x * 0.03) * Math.cos(z * 0.02) * 8;
            height += Math.sin(x * 0.08) * Math.cos(z * 0.06) * 3;
            height += Math.sin(x * 0.15) * Math.cos(z * 0.12) * 1;
            height += distanceFromOcean * 0.4;
            
            if (z > -45 && z < -20) {
                height *= Math.smoothstep(-45, -20, z);
            }
            
            grassVertices[i + 1] = Math.max(0.2, height + 0.2);
        }
        
        grassGeometry.computeVertexNormals();
        
        const grassMaterial = new THREE.MeshLambertMaterial({
            map: this.grassTexture,
            transparent: true,
            opacity: 0.7,
            color: 0x7cb342
        });
        
        const grassLayer = new THREE.Mesh(grassGeometry, grassMaterial);
        grassLayer.rotation.x = -Math.PI / 2;
        grassLayer.position.y = 0;
        this.scene.add(grassLayer);
    }
    
    createRealisticOcean() {
        // Main ocean surface
        const oceanGeometry = new THREE.PlaneGeometry(200, 150, 100, 75);
        
        // Create wave displacement
        const vertices = oceanGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Gentle wave pattern
            const wave1 = Math.sin(x * 0.02) * 0.8;
            const wave2 = Math.cos(z * 0.03) * 0.6;
            const smallWaves = Math.sin(x * 0.1) * Math.cos(z * 0.08) * 0.2;
            
            vertices[i + 1] = wave1 + wave2 + smallWaves;
        }
        
        oceanGeometry.computeVertexNormals();
        
        // Beautiful ocean material
        const oceanMaterial = new THREE.MeshPhongMaterial({
            color: 0x2596be,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            specular: 0x87ceeb
        });
        
        this.ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.set(0, -1, -75);
        this.scene.add(this.ocean);
        
        // Beach/shore area
        const beachGeometry = new THREE.PlaneGeometry(120, 25, 40, 10);
        const beachVertices = beachGeometry.attributes.position.array;
        
        for (let i = 0; i < beachVertices.length; i += 3) {
            const x = beachVertices[i];
            const z = beachVertices[i + 2];
            
            // Gentle slope down to water
            const slope = Math.max(0, z + 12) * 0.1;
            const sandRipples = Math.sin(x * 0.2) * 0.1;
            
            beachVertices[i + 1] = slope + sandRipples;
        }
        
        beachGeometry.computeVertexNormals();
        
        const beachMaterial = new THREE.MeshLambertMaterial({
            map: this.beachTexture,
            color: 0xf4e4bc
        });
        
        const beach = new THREE.Mesh(beachGeometry, beachMaterial);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, 0, -27);
        beach.receiveShadow = true;
        this.scene.add(beach);
    }
    
    createRealisticSun() {
        // Sun sphere
        const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            emissive: 0xff4500,
            emissiveIntensity: 0.3
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(-35, 35, -60);
        this.scene.add(this.sun);
        
        // Sun glow effect
        const glowGeometry = new THREE.SphereGeometry(12, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.2
        });
        
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGlow.position.copy(this.sun.position);
        this.scene.add(sunGlow);
        this.sunGlow = sunGlow;
    }
    
    create3DFlowers() {
        const flowerTypes = ['poppy', 'wildflower'];
        
        // Scattered flowers across the hillside
        for (let i = 0; i < 50; i++) {
            const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            const flowerGeometry = new THREE.PlaneGeometry(1.2, 1.8);
            const flowerMaterial = new THREE.MeshLambertMaterial({ 
                map: this.flowerTextures[type],
                transparent: true,
                alphaTest: 0.1
            });
            
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            
            // Position flowers on the terrain
            const x = (Math.random() - 0.5) * 160;
            const z = Math.random() * 80 + 10;
            
            // Calculate terrain height at this position
            const distanceFromCoast = Math.max(0, z + 50);
            const noise = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
            const terrainHeight = (distanceFromCoast * 0.3) + noise;
            
            flower.position.set(x, terrainHeight + 0.9, z);
            flower.lookAt(this.camera.position);
            
            flower.userData = { 
                originalPosition: flower.position.clone(),
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.3 + Math.random() * 0.4,
                type: 'flower'
            };
            
            flower.castShadow = true;
            this.flowers.push(flower);
            this.scene.add(flower);
        }
        
        // Add grass clumps
        for (let i = 0; i < 80; i++) {
            const grassGeometry = new THREE.PlaneGeometry(0.6, 1.2);
            const grassMaterial = new THREE.MeshLambertMaterial({ 
                map: this.flowerTextures.grass,
                transparent: true,
                alphaTest: 0.1
            });
            
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            
            const x = (Math.random() - 0.5) * 180;
            const z = Math.random() * 90 + 5;
            
            const distanceFromCoast = Math.max(0, z + 50);
            const noise = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
            const terrainHeight = (distanceFromCoast * 0.3) + noise;
            
            grass.position.set(x, terrainHeight + 0.6, z);
            grass.lookAt(this.camera.position);
            
            grass.userData = { 
                originalPosition: grass.position.clone(),
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.5 + Math.random() * 0.3,
                type: 'grass'
            };
            
            this.flowers.push(grass);
            this.scene.add(grass);
        }
    }
    
    createFloatingHearts() {
        const heartsContainer = document.getElementById('hearts-container');
        
        setInterval(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '💕';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
            heart.style.animationDelay = Math.random() * 2 + 's';
            
            heartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 8000);
        }, 800);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        });
        
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        
        // Animate sun with gentle movement
        if (this.sun) {
            this.sun.position.y = 35 + Math.sin(this.time * 0.2) * 2;
            this.sun.position.x = -35 + Math.cos(this.time * 0.15) * 3;
        }
        
        if (this.sunGlow) {
            this.sunGlow.position.copy(this.sun.position);
            this.sunGlow.material.opacity = 0.2 + Math.sin(this.time * 0.5) * 0.1;
        }
        
        // Animate ocean waves
        if (this.ocean && this.ocean.geometry) {
            const vertices = this.ocean.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const z = vertices[i + 2];
                const originalY = vertices[i + 1];
                
                // Create rolling wave motion
                const wave1 = Math.sin(this.time * 0.5 + x * 0.02) * 0.4;
                const wave2 = Math.cos(this.time * 0.3 + z * 0.03) * 0.3;
                const smallWaves = Math.sin(this.time * 2 + x * 0.1 + z * 0.08) * 0.1;
                
                vertices[i + 1] = wave1 + wave2 + smallWaves;
            }
            this.ocean.geometry.attributes.position.needsUpdate = true;
            this.ocean.geometry.computeVertexNormals();
        }
        
        // Animate flowers swaying gently
        this.flowers.forEach(flower => {
            const sway = Math.sin(this.time * flower.userData.swaySpeed + flower.userData.swayOffset) * 0.03;
            const swayX = Math.sin(this.time * flower.userData.swaySpeed * 0.8 + flower.userData.swayOffset) * 0.02;
            
            flower.rotation.z = sway;
            flower.position.x = flower.userData.originalPosition.x + swayX;
            flower.position.y = flower.userData.originalPosition.y + Math.abs(sway) * 0.1;
        });
        
        // Smooth camera movement with mouse interaction
        const mouseInfluence = 3;
        const targetX = 15 + Math.sin(this.time * 0.08) * 2 + this.mouse.x * mouseInfluence;
        const targetY = 35 + Math.cos(this.time * 0.06) * 1.5 + this.mouse.y * mouseInfluence;
        const targetZ = 25 + Math.sin(this.time * 0.1) * 1;
        
        // Smooth camera interpolation
        this.camera.position.x += (targetX - this.camera.position.x) * 0.02;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.02;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.02;
        
        // Look at point that follows mouse
        const lookAtX = -5 + this.mouse.x * 5;
        const lookAtY = 0 + this.mouse.y * 2;
        const lookAtZ = -30;
        
        this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
        
        // Animate atmospheric colors
        const sunsetProgress = (Math.sin(this.time * 0.03) + 1) * 0.5;
        const fogColor = new THREE.Color();
        fogColor.lerpColors(
            new THREE.Color(0xffd4a3), // Warm sunset
            new THREE.Color(0xff8c69),  // Deeper orange
            sunsetProgress * 0.3
        );
        
        this.scene.fog.color = fogColor;
        this.renderer.setClearColor(fogColor);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the birthday scene
window.addEventListener('DOMContentLoaded', () => {
    new BirthdayScene();
});