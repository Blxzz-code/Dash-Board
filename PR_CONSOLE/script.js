const prContainer = document.getElementById('pr-container');
const conflictModal = document.getElementById('conflict-modal');
const conflictMsg = document.getElementById('conflict-msg');
let currentConflictStep = null;

function createPR() {
    const prNumberInput = document.getElementById('pr-number');
    const prNumber = prNumberInput.value.trim();
    if(!prNumber) {
        alert("Por favor ingresa el número de PR antes de crear.");
        return;
    }

    const prBlock = document.createElement('div');
    prBlock.classList.add('pr-block');
    prBlock.innerHTML = `
        <div class="pr-header">TASK_ID: PR#${prNumber}</div>
        <div class="branch-grid">
            ${['DEVELOP','TESTING'].map(branch => `
            <div class="branch-column">
                <div class="branch-title">TARGET: ${branch} <span class="success-tag">[PENDING]</span></div>
                <ul class="step-list">
                    <li class="step">
                        <span class="step-id">01</span>
                        <span>GIT CHECKOUT -B CR_FIX_PR</span>
                        <button class="done-btn">✔</button>
                    </li>
                    <li class="step">
                        <span class="step-id">02</span>
                        <span>CHERRY-PICK </span>
                        <input type="text" class="hash-input" placeholder="HASH" />
                        <button class="done-btn">✔</button>
                        <button class="conflict-btn">X</button>
                    </li>
                    <li class="step">
                        <span class="step-id">03</span>
                        <span>BROWSER TEST</span>
                        <button class="done-btn">✔</button>
                    </li>
                    <li class="step">
                        <span class="step-id">04</span>
                        <span>GIT PUSH & PR CREATED</span>
                        <button class="done-btn">✔</button>
                    </li>
                </ul>
                <button class="add-cherry-btn">Agregar Cherry-Pick</button>
            </div>`).join('')}
        </div>
    `;
    prContainer.appendChild(prBlock);

    initializePREvents(prBlock);
}

function initializePREvents(prBlock) {
    prBlock.querySelectorAll('.done-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepLi = btn.closest('.step');
            markStepDone(stepLi);
        });
    });

    prBlock.querySelectorAll('.conflict-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentConflictStep = btn.closest('.step');
            conflictMsg.value = '';
            conflictModal.style.display = 'flex';
        });
    });

    prBlock.querySelectorAll('.add-cherry-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const column = btn.closest('.branch-column');
            addCherryPick(column);
        });
    });
}

function addCherryPick(column) {
    const stepList = column.querySelector('.step-list');
    const pushStep = Array.from(stepList.children).find(li => li.querySelector('span').textContent.includes('GIT PUSH'));
    const newStepNumber = stepList.children.length;
    const li = document.createElement('li');
    li.classList.add('step');
    li.innerHTML = `
        <span class="step-id">${newStepNumber.toString().padStart(2,'0')}</span>
        <span>CHERRY-PICK </span>
        <input type="text" class="hash-input" placeholder="HASH" />
        <button class="done-btn">✔</button>
        <button class="conflict-btn">X</button>
    `;
    stepList.insertBefore(li, pushStep); // Inserta antes de push

    // Eventos para nuevos botones
    li.querySelector('.done-btn').addEventListener('click', () => markStepDone(li));
    li.querySelector('.conflict-btn').addEventListener('click', () => {
        currentConflictStep = li;
        conflictMsg.value = '';
        conflictModal.style.display = 'flex';
    });

    renumberSteps(stepList);
}

// Renumera pasos automáticamente
function renumberSteps(stepList) {
    Array.from(stepList.children).forEach((li,index)=>{
        li.querySelector('.step-id').textContent = (index+1).toString().padStart(2,'0');
    });
}

// Marca paso como completado
function markStepDone(stepLi) {
    stepLi.querySelector('.step-id').classList.add('success-tag');
    stepLi.querySelectorAll('button').forEach(b => b.disabled = true);
}

// Modal de conflicto
document.getElementById('conflict-save-btn').addEventListener('click', () => {
    if(currentConflictStep){
        const note = document.createElement('div');
        note.classList.add('conflict-note');
        note.textContent = `RESOLVED: ${conflictMsg.value}`;
        currentConflictStep.after(note);
        markStepDone(currentConflictStep);
        currentConflictStep = null;
    }
    conflictModal.style.display = 'none';
});
document.getElementById('conflict-cancel-btn').addEventListener('click', () => {
    currentConflictStep = null;
    conflictModal.style.display = 'none';
});

// Botones principales
document.getElementById('new-pr-btn').addEventListener('click', createPR);
document.getElementById('export-btn').addEventListener('click', () => {
    html2pdf().set({ 
        margin:10,
        filename:`MigrationLog.pdf`,
        jsPDF:{orientation:'landscape', unit:'mm', format:'a4'}
    }).from(document.body).save();
});