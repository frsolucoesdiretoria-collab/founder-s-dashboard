const loadScreen = {
    containerId: 'loading-grid-container',
    numColumns: 3,
    numRows: 3,
    animationDuration: 1000,

    init: function () {
        this.createGrid();
        this.addResizeListener();
        this.loadText();
    },

    createGrid: function () {
        const gridContainer = document.getElementById(this.containerId);
        gridContainer.innerHTML = ''; // Clear existing lines if any

        const columnWidth = window.innerWidth / this.numColumns;
        const rowHeight = window.innerHeight / this.numRows;

        // Create vertical lines
        for (let i = 1; i <= this.numColumns; i++) {
            const verticalLine = document.createElement('div');
            verticalLine.classList.add('loading-grid-line', 'loading-grid-vertical-line');
            verticalLine.style.left = `${i * columnWidth}px`;
            verticalLine.style.animationDelay = `${(i * this.animationDuration) / (this.numColumns + this.numRows)}ms`;
            gridContainer.appendChild(verticalLine);
        }

        // Create horizontal lines
        for (let i = 1; i <= this.numRows; i++) {
            const horizontalLine = document.createElement('div');
            horizontalLine.classList.add('loading-grid-line', 'loading-grid-horizontal-line');
            horizontalLine.style.top = `${i * rowHeight}px`;
            horizontalLine.style.animationDelay = `${
                (this.numColumns + i) * this.animationDuration / (this.numColumns + this.numRows)
            }ms`;
            gridContainer.appendChild(horizontalLine);
        }
    },

    loadText: () => {
        var spanText = function spanText(text) {
            var string = text.innerText;
            var spaned = '';
            for (var i = 0; i < string.length; i++) {
                if (string.substring(i, i + 1) === ' ') spaned += string.substring(i, i + 1);
                else spaned += '<span>' + string.substring(i, i + 1) + '</span>';
            }
            text.innerHTML = spaned;
        }

        let headline = document.querySelector("h1");

        spanText(headline);

        let animations = document.querySelectorAll('h1');

        animations.forEach(animation => {
            let letters = animation.querySelectorAll('span');
            letters.forEach((letter, i) => {
                letter.style.animationDelay = (i * 0.1) + 's';
            })
        });

        let animationStep2 = document.querySelector('h1 span:last-of-type');
        let animationStep3 = document.querySelector('h1::before');
        animationStep2.addEventListener('animationend', () => {
            headline.classList.add('animation--step-2');
            setTimeout(() => {
                headline.classList.remove('animation--step-2');
                headline.classList.add('animation--step-3');
            }, 1000);
        });
    },

    addResizeListener: function () {
        window.addEventListener('resize', () => {
            this.createGrid();
        });
    },
};

loadScreen.init();