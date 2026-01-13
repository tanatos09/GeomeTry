// nacitani canvasu
const canvas = document.getElementById('game');
// 2D kresleni
const ctx = canvas.getContext('2d');

//promenna pro velikost platna
let width, height;

// nastaveni velikosti canvasu dle okna
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

//reakce na zmenu velikosti okna
window.addEventListener('resize', resize);
//nastaveni velikosti
resize();

//vyska podlahy
const floorHeight = 100

// true = geome se dotyka prekazky
let isColliding = false;

//geome - hrac
const geome = {
    x: width * 0.25, //poloha
    y: height / 2, //poloha
    radius: 30, //velikost
    velocityY: 0, //vertikalni velikost
    gravity: 0.6, //gravitace
    lift: -12 //sila skoku
};

//prekazky
const obstacles = []; //pole prekazek
const obstacleWidth = 200; //sirka prekazky
const obstacleGap = 500; //mezera prekazky
const obstacleSpeed = 4; //rychlost pohybu
let frameCount = 0; //pocitadlo snimku pro generovani
let gamePaused = false; //pauza pohybu

// kresleni polygonu
function drawPolygon(x, y, radius, sides, color) {
    if (sides < 3) return; //minimalne 3 strany
    const angleStep = (2 * Math.PI) / sides; //uhel mezi jednotlivymi vrcholy
    ctx.beginPath(); //novy tvar

    for (let i = 0; i < sides; i++) { //projde vsechny vrcholy polygonu
        const angle = i * angleStep; //aktualni uhel pro dany vrchol
        const pointX = x + Math.cos(angle) * radius; //souradnice vrcholu X
        const pointY = y + Math.sin(angle) * radius ;// souradnice vrcholu Y
        i === 0 ? ctx.moveTo(pointX, pointY) : ctx.lineTo(pointX, pointY);
    }
    
    ctx.closePath(); //uzavriti tvaru

    ctx.fillStyle = color; // nastaveni barvy
    
    ctx.fill(); //vypln tvaru
}

//skok
window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") { //space nebo sipka nahoru
        geome.velocityY = geome.lift; //skok
        gamePaused = false; //znovu rozjet hru
    }
});
window.addEventListener("mousedown", e => { //kliknuti
    geome.velocityY = geome.lift
});

//herni smycka
function gameLoop() {
    //vycisti pozadi
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, width, height); 

    //vykresli podlahu
    ctx.fillStyle = "#555";
    ctx.fillRect(0, height - floorHeight, width, floorHeight); 

    //pohyb geome pri kolizi kdyz neni hra pauznuta    
    geome.velocityY += geome.gravity; //gravitace
    geome.y += geome.velocityY; //posun nahoru dolu
    
    
    // omezit strop
    if (geome.y - geome.radius < 0) {
        geome.y = geome.radius;
        geome.velocityY = 0;
    }

    // omezit podlahu
    if (geome.y + geome.radius > height - floorHeight) {
        geome.y = height - floorHeight - geome.radius;
        geome.velocityY = 0;
    }

    //generovani prekazek
    if (!isColliding) {
        frameCount++;
        if (frameCount % 100 === 0) { //kazdych 100 snimku
            const type = Math.floor(Math.random() * 3); // nahodny typ prekazky (0 - horni, 1 - dolni, 2 - oboje)
            const topHeight = Math.random() * (height - obstacleGap - floorHeight - 80) + 40; //vyska horni prekazky

            //objekt prekazky
            obstacles.push({
                x: width, //zacatek zprava
                width: obstacleWidth,
                top: type !== 1 ? topHeight : 0, //pokud neni jen dolni
                bottom: type !== 0 ? height - topHeight - obstacleGap : 0, //pokud neni jen horni
            });
        }
    }

    //vykresleni a posun prekazek a kolize
    ctx.fillStyle = "#0ff"; 
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        
        //pohyb jen pokud hra bezi
        if (!isColliding) obs.x -= obstacleSpeed;

        //horni prekazka
        if (obs.top > 0) {
            ctx.fillRect(obs.x, 0, obs.width, obs.top); 
        }

        // spodni prekazka
        if (obs.bottom > 0) {
            ctx.fillRect(obs.x, height - floorHeight - obs.bottom, obs.width,obs.bottom);
        } 
        
        //kolize geome/prekazka
        const hitX =
            geome.x + geome.radius > obs.x &&
            geome.x - geome.radius < obs.x + obs.width;

        const hitTop =
            obs.top > 0 && geome.y - geome.radius < obs.top;

        const hitBottom =
            obs.bottom > 0 && geome.y + geome.radius > height - floorHeight - obs.bottom;

        if (hitX && (hitTop || hitBottom)) {
            if (!isColliding) { 
                isColliding = true;
                geome.velocityY = 0;
            }
        }
                
        //odstraneni prekazky mimo obraz
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    if (isColliding) {
        isColliding = obstacles.some(obs => {
            const hitX = 
            geome.x + geome.radius > obs.x &&
            geome.x - geome.radius < obs.x + obs.width;

            const hitTop =
                obs.top > 0 && geome.y - geome.radius < obs.top;

            const hitBottom = 
                obs.bottom > 0 && geome.y +geome.radius > height - floorHeight - obs.bottom;

            return hitX && (hitTop || hitBottom);
        });
    }

    //vykresleni Geome - tvar
    drawPolygon(geome.x, geome.y, geome.radius, 3, '#00e5ff');

    requestAnimationFrame(gameLoop);
}

gameLoop();
console.log('Canvas', canvas.width, canvas.height)
