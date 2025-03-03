// DOM yüklendikten sonra oyunu başlat
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded and ready");
    
    // DOM Elementleri
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const specialMessage = document.getElementById('special-message');
    const messageDisplay = document.getElementById('message-display');
    const messageList = document.getElementById('message-list');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Oyun Değişkenleri
    let currentLevel = 1;
    let maxLevel = 3;
    let player = {row: 1, col: 1};
    let maze = [];
    let hearts = [];
    let collectedMessages = [];
    let exit = {row: 0, col: 0};
    let cellSize = 0;
    let gameActive = false;
    let score = 0;
    
    // Dokunmatik kontroller için değişkenler
    let touchStartX = 0;
    let touchStartY = 0;
    let lastMoveTime = 0;
    const moveDelay = 100; // ms
    
    // Labirent boyutları
    let mazeRows = 9;
    let mazeCols = 9;
    
    // Aşk Mesajları
    const loveMessages = [
        "Seni her gün daha çok seviyorum! ❤️",
        "Kalbim sadece senin için atıyor! 💓",
        "Mesafeler aşkımızı engelleyemez! 💕",
        "Her an seni düşünüyorum! 💖",
        "Gözlerini kapattığında yanındayım! 💗",
        "Aşkım sonsuza kadar seninle! 💘",
        "Seninle geçirdiğim her an çok değerli! 💝",
        "Uzakta olsan da kalbimdesin! 💞",
        "Sen benim en güzel hayalimsin! 💟",
        "Birlikte olduğumuz günleri iple çekiyorum! 💌",
        "Seninle her şey daha güzel! ✨",
        "Birlikte yaşlanmak istediğim kişisin! 💑",
        "Seni özlüyorum canım! 💭",
        "Sen hayatımın anlamısın! 🌹",
        "Dünyada en çok seni seviyorum! 💫"
    ];
    
    // Özel bitirme mesajları
    const finalMessages = [
        "Seni her şeyden çok seviyorum! 💖",
        "Mesafeler değil, kalpler önemli! 💕",
        "Sen benim sonsuza dek aşkımsın! ❤️"
    ];
    
    // Event Listeners
    startButton.addEventListener('click', function() {
        console.log("Start button clicked");
        startGame();
    });
    
    restartButton.addEventListener('click', function() {
        console.log("Restart button clicked");
        startGame();
    });
    
    // Klavye kontrolleri
    window.addEventListener('keydown', function(e) {
        if (!gameActive) return;
        
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(-1, 0);
                e.preventDefault();
                break;
            case 'ArrowDown':
                movePlayer(1, 0);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                movePlayer(0, -1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                movePlayer(0, 1);
                e.preventDefault();
                break;
        }
    });
    
    // Dokunmatik kontroller
    document.addEventListener('touchstart', function(e) {
        if (!gameActive) return;
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!gameActive) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Minimum kaydırma mesafesi
        const minSwipeDistance = 30;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Yatay kaydırma
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    movePlayer(0, 1); // Sağa
                } else {
                    movePlayer(0, -1); // Sola
                }
            }
        } else {
            // Dikey kaydırma
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    movePlayer(1, 0); // Aşağı
                } else {
                    movePlayer(-1, 0); // Yukarı
                }
            }
        }
    });
    
    // Pencere boyutu değiştiğinde
    window.addEventListener('resize', function() {
        if (gameActive) {
            setupCanvas();
            drawGame();
        }
    });
    
    // Oyunu başlat
    function startGame() {
        console.log("Game started");
        // Değişkenleri sıfırla
        score = 0;
        collectedMessages = [];
        gameActive = true;
        currentLevel = 1;
        
        // Ekranları güncelle
        startScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        gameOverScreen.style.display = 'none';
        
        // Skoru güncelle
        scoreDisplay.textContent = score;
        
        // Arka planı ayarla
        document.body.className = '';
        document.body.classList.add('bg-' + currentLevel);
        
        // Canvas'ı ayarla
        setupCanvas();
        
        // İlk seviyeyi başlat
        initLevel();
        
        // İlk kareyi çiz
        drawGame();
    }
    
    // Canvas ayarları
    function setupCanvas() {
        const container = document.getElementById('game-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        cellSize = Math.min(
            canvas.width / mazeCols,
            canvas.height / mazeRows
        );
    }
    
    // Seviye başlat
    function initLevel() {
        // Labirent boyutlarını seviyeye göre ayarla
        if (currentLevel === 1) {
            mazeRows = 9;
            mazeCols = 9;
        } else if (currentLevel === 2) {
            mazeRows = 11;
            mazeCols = 11;
        } else {
            mazeRows = 13;
            mazeCols = 13;
        }
        
        // Canvas'ı yeniden boyutlandır
        setupCanvas();
        
        // Labirenti oluştur
        generateMaze();
        
        // Oyuncuyu başlangıç pozisyonuna yerleştir
        player = {
            row: 1,
            col: 1
        };
        
        // Çıkışı en uzak köşeye yerleştir
        exit = {
            row: mazeRows - 2,
            col: mazeCols - 2
        };
        
        // Kalpleri yerleştir
        placeHearts();
    }
    
    // Labirent oluşturma
    function generateMaze() {
        // 1: duvar, 0: yol için boş bir grid oluştur
        maze = [];
        for (let i = 0; i < mazeRows; i++) {
            maze[i] = [];
            for (let j = 0; j < mazeCols; j++) {
                maze[i][j] = 1;
            }
        }
        
        // DFS algoritması ile labirent oluştur
        const stack = [];
        const start = { row: 1, col: 1 };
        
        // Başlangıç noktasını yol yap
        maze[start.row][start.col] = 0;
        stack.push(start);
        
        while (stack.length > 0) {
            // Yığının en üstündeki hücreyi al
            const current = stack[stack.length - 1];
            
            // Ziyaret edilmemiş komşuları kontrol et
            const neighbors = getUnvisitedNeighbors(current.row, current.col);
            
            if (neighbors.length === 0) {
                // Komşu kalmadıysa geri dön
                stack.pop();
            } else {
                // Rastgele bir komşu seç
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Seçilen komşuyu yol yap
                maze[next.row][next.col] = 0;
                
                // Aradaki duvarı kaldır
                maze[(current.row + next.row) / 2][(current.col + next.col) / 2] = 0;
                
                // Komşuyu yığına ekle
                stack.push(next);
            }
        }
        
        // Kenarları duvar yap
        for (let i = 0; i < mazeRows; i++) {
            maze[i][0] = 1;
            maze[i][mazeCols - 1] = 1;
        }
        for (let j = 0; j < mazeCols; j++) {
            maze[0][j] = 1;
            maze[mazeRows - 1][j] = 1;
        }
        
        // Çıkış yolunu garantile
        maze[exit.row][exit.col] = 0;
        
        // Çıkışa giden yolu açık tut
        ensurePathToExit();
    }
    
    // Çıkışa giden yolu garantile
    function ensurePathToExit() {
        // Çıkışın etrafında en az bir açık yol olduğunu garanti et
        let hasPath = false;
        
        // Çıkışın etrafındaki hücreleri kontrol et
        if (exit.row > 0 && maze[exit.row - 1][exit.col] === 0) hasPath = true;
        if (exit.row < mazeRows - 1 && maze[exit.row + 1][exit.col] === 0) hasPath = true;
        if (exit.col > 0 && maze[exit.row][exit.col - 1] === 0) hasPath = true;
        if (exit.col < mazeCols - 1 && maze[exit.row][exit.col + 1] === 0) hasPath = true;
        
        // Eğer çıkışa giden yol yoksa, bir tane aç
        if (!hasPath) {
            if (exit.row > 1) maze[exit.row - 1][exit.col] = 0;
            else if (exit.col > 1) maze[exit.row][exit.col - 1] = 0;
        }
    }
    
    // Ziyaret edilmemiş komşuları bul
    function getUnvisitedNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            { row: -2, col: 0 },  // Yukarı
            { row: 2, col: 0 },   // Aşağı
            { row: 0, col: -2 },  // Sol
            { row: 0, col: 2 }    // Sağ
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            // Sınırlar içinde ve ziyaret edilmemiş mi?
            if (newRow > 0 && newRow < mazeRows - 1 && 
                newCol > 0 && newCol < mazeCols - 1 && 
                maze[newRow][newCol] === 1) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }
        
        return neighbors;
    }
    
    // Kalpleri yerleştir
    function placeHearts() {
        hearts = [];
        
        // Seviyeye göre kalp sayısını belirle
        const heartCount = 3 + currentLevel * 2;
        let placed = 0;
        
        while (placed < heartCount && placed < 100) { // Sonsuz döngüyü önlemek için max deneme
            const row = Math.floor(Math.random() * (mazeRows - 2)) + 1;
            const col = Math.floor(Math.random() * (mazeCols - 2)) + 1;
            
            // Hücre yol mu, başlangıç veya çıkış değil mi, ve henüz kalp yerleştirilmemiş mi?
            if (maze[row][col] === 0 && 
                !(row === player.row && col === player.col) && 
                !(row === exit.row && col === exit.col) &&
                !hearts.some(h => h.row === row && h.col === col)) {
                
                hearts.push({
                    row: row,
                    col: col,
                    collected: false,
                    pulseValue: 0,
                    pulseDir: 0.05
                });
                
                placed++;
            }
        }
    }
    
    // Oyun ekranını çiz
    function drawGame() {
        // Ekranı temizle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Labirenti çiz
        drawMaze();
        
        // Kalpleri çiz
        drawHearts();
        
        // Çıkışı çiz
        drawExit();
        
        // Oyuncuyu çiz
        drawPlayer();
    }
    
    // Labirenti çiz
    function drawMaze() {
        for (let row = 0; row < mazeRows; row++) {
            for (let col = 0; col < mazeCols; col++) {
                const x = col * cellSize;
                const y = row * cellSize;
                
                if (maze[row][col] === 1) {
                    // Duvar
                    ctx.fillStyle = '#555';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    // Duvar efekti
                    ctx.fillStyle = '#444';
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                } else {
                    // Yol
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }
    
    // Oyuncuyu çiz
    function drawPlayer() {
        const x = player.col * cellSize + cellSize / 2;
        const y = player.row * cellSize + cellSize / 2;
        const size = cellSize * 0.4;
        
        // Kalp çiz
        ctx.fillStyle = '#e83e8c';
        drawHeart(x, y, size);
        
        // Gözler
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.15, size * 0.1, 0, Math.PI * 2);
        ctx.arc(x + size * 0.2, y - size * 0.15, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Göz bebekleri
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.15, size * 0.05, 0, Math.PI * 2);
        ctx.arc(x + size * 0.2, y - size * 0.15, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Gülümseme
        ctx.strokeStyle = 'white';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.arc(x, y + size * 0.1, size * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    }
    
    // Kalpleri çiz
    function drawHearts() {
        for (const heart of hearts) {
            if (heart.collected) continue;
            
            const x = heart.col * cellSize + cellSize / 2;
            const y = heart.row * cellSize + cellSize / 2;
            
            // Kalp atışı animasyonu
            heart.pulseValue += heart.pulseDir;
            if (heart.pulseValue >= 0.3 || heart.pulseValue <= 0) {
                heart.pulseDir *= -1;
            }
            
            const size = cellSize * 0.3 * (1 + heart.pulseValue);
            
            // Işıltı efekti
            ctx.fillStyle = 'rgba(255, 192, 203, 0.5)';
            drawHeart(x, y, size * 1.2);
            
            // Kalp
            ctx.fillStyle = '#ff6b6b';
            drawHeart(x, y, size);
        }
    }
    
    // Çıkışı çiz
    function drawExit() {
        const x = exit.col * cellSize;
        const y = exit.row * cellSize;
        
        // Çıkış arka planı
        ctx.fillStyle = 'rgba(132, 250, 176, 0.7)';
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Kapı
        ctx.fillStyle = '#63a83b';
        ctx.fillRect(x + cellSize * 0.2, y + cellSize * 0.1, cellSize * 0.6, cellSize * 0.8);
        
        // Kapı kolu
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x + cellSize * 0.7, y + cellSize * 0.5, cellSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Kalp şekli çiz
    function drawHeart(x, y, size) {
        ctx.beginPath();
        
        // Kalp şekli
        ctx.moveTo(x, y + size * 0.3);
        
        // Sol tepe
        ctx.bezierCurveTo(
            x, y, 
            x - size, y, 
            x - size, y + size * 0.7
        );
        
        // Sol alt
        ctx.bezierCurveTo(
            x - size, y + size, 
            x, y + size * 1.3, 
            x, y + size * 1.3
        );
        
        // Sağ alt
        ctx.bezierCurveTo(
            x, y + size * 1.3, 
            x + size, y + size, 
            x + size, y + size * 0.7
        );
        
        // Sağ tepe
        ctx.bezierCurveTo(
            x + size, y, 
            x, y, 
            x, y + size * 0.3
        );
        
        ctx.closePath();
        ctx.fill();
    }
    
    // Oyuncuyu hareket ettir
    function movePlayer(rowDir, colDir) {
        const now = Date.now();
        if (now - lastMoveTime < moveDelay) return;
        lastMoveTime = now;
        
        const newRow = player.row + rowDir;
        const newCol = player.col + colDir;
        
        // Hareket edilebilir mi?
        if (newRow >= 0 && newRow < mazeRows && 
            newCol >= 0 && newCol < mazeCols && 
            maze[newRow][newCol] === 0) {
            
            player.row = newRow;
            player.col = newCol;
            
            // Kalplere bakıyoruz
            checkHeartCollection();
            
            // Çıkış kontrolü
            checkExit();
            
            // Ekranı güncelle
            drawGame();
        }
    }
    
    // Kalp toplama kontrolü
    function checkHeartCollection() {
        for (let i = 0; i < hearts.length; i++) {
            if (!hearts[i].collected && 
                player.row === hearts[i].row && 
                player.col === hearts[i].col) {
                
                // Kalbi topla
                hearts[i].collected = true;
                
                // Skoru güncelle
                score++;
                scoreDisplay.textContent = score;
                
                // Rastgele mesaj seç ve göster
                const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)];
                showMessage(randomMessage);
                
                // Mesajı toplanan mesajlar listesine ekle
                collectedMessages.push(randomMessage);
                
                break;
            }
        }
    }
    
    // Çıkış kontrolü
    function checkExit() {
        if (player.row === exit.row && player.col === exit.col) {
            if (currentLevel < maxLevel) {
                // Sonraki seviyeye geç
                currentLevel++;
                
                // Arka planı değiştir
                document.body.className = '';
                document.body.classList.add('bg-' + currentLevel);
                
                // Seviye geçiş mesajı
                showMessage(`Seviye ${currentLevel}'e hoş geldin!`);
                
                // Yeni seviyeyi başlat
                initLevel();
            } else {
                // Oyunu bitir
                endGame();
            }
        }
    }
    
    // Mesaj göster
    function showMessage(text) {
        messageDisplay.textContent = text;
        messageDisplay.style.opacity = 1;
        
        // 3 saniye sonra mesajı gizle
        setTimeout(function() {
            messageDisplay.style.opacity = 0;
        }, 3000);
    }
    
    // Oyunu bitir
    function endGame() {
        gameActive = false;
        
        // Final skorunu güncelle
        finalScoreDisplay.textContent = score;
        
        // Özel mesajı seç (toplanan kalp sayısına göre)
        let messageIndex = Math.min(Math.floor(score / 5), finalMessages.length - 1);
        specialMessage.textContent = finalMessages[messageIndex];
        
        // Toplanan mesajları listele
        messageList.innerHTML = '';
        if (collectedMessages.length > 0) {
            collectedMessages.forEach(message => {
                const messageItem = document.createElement('div');
                messageItem.className = 'message-item';
                messageItem.textContent = message;
                messageList.appendChild(messageItem);
            });
        } else {
            const noMessagesItem = document.createElement('div');
            noMessagesItem.className = 'message-item';
            noMessagesItem.textContent = 'Hiç mesaj bulamadın. Tekrar dene!';
            messageList.appendChild(noMessagesItem);
        }
        
        // Game over ekranını göster
        gameScreen.style.display = 'none';
        gameOverScreen.style.display = 'flex';
    }
});