function toggleFloatingMenu() {
        const container = document.getElementById('floatingMenu');
        container.classList.toggle('active');
    }

    window.addEventListener('click', function(e) {
        const container = document.getElementById('floatingMenu');
        if (container && container.classList.contains('active') && !container.contains(e.target)) {
            container.classList.remove('active');
        }
    });

    let gameData = JSON.parse(localStorage.getItem('gameHomeworkData_v15')) || [];

        gameData.forEach(acc => {
            if (acc.expedition === undefined) acc.expedition = 84;
            if (acc.transcend === undefined) acc.transcend = 56;
        });
        
        let lastChecked = localStorage.getItem('lastOdeUpdateTime_v15') || Date.now();
        localStorage.setItem('lastOdeUpdateTime_v15', lastChecked);
        
        let lastAbyssReset = localStorage.getItem('lastAbyssResetTime_v15') || "0";
        let accordionStatus = JSON.parse(localStorage.getItem('accordionStatus_v15')) || {};
        
        let lastDailyReset = localStorage.getItem('lastDailyResetTime_v15') || "0";
        let lastWeeklyReset = localStorage.getItem('lastWeeklyResetTime_v15') || "0";
        
        let alarmSettings = JSON.parse(localStorage.getItem('alarmSettings_v15')) || {
            festa: true,
            invasion: true,
            space: true
        };


    function updateServerClock() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = weekDays[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const clockElement = document.getElementById('server-clock');
        if (clockElement) {
            clockElement.innerText = `⏰ 현재 시간: ${year}-${month}-${date}(${dayOfWeek}) ${hours}:${minutes}:${seconds}`;
        }
    }
    
    window.addEventListener('DOMContentLoaded', () => {
        updateServerClock();
        setInterval(updateServerClock, 1000);
    });

    function playBeepSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const now = ctx.currentTime;
            const mainGain = ctx.createGain();
            mainGain.connect(ctx.destination);
            mainGain.gain.setValueAtTime(0.05, now);
            const sequence = [
                { pitch: 523.25, start: 0.0,  duration: 0.4, type: 'sine', volume: 0.4 }, 
                { pitch: 659.25, start: 0.15, duration: 0.3, type: 'triangle', volume: 0.6 }, 
                { pitch: 1046.50, start: 0.3,  duration: 0.6, type: 'sine', volume: 0.8 }
            ];
            sequence.forEach((note) => {
                const startTime = now + note.start;
                const stopTime = startTime + note.duration;
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.type = note.type;
                osc.frequency.setValueAtTime(note.pitch, startTime);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(note.volume, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
                osc.connect(gainNode); gainNode.connect(mainGain);
                osc.start(startTime); osc.stop(stopTime + 0.1);
            });
        } catch (e) { console.error(e); }
    }
    
    function toggleMembershipUI() {
        const isMembership = document.querySelector('input[name="modalAccMembership"]:checked').value === 'O';
        document.getElementById('membershipWarningArea').style.display = isMembership ? 'none' : 'block';
        document.getElementById('membershipTimeArea').style.display = isMembership ? 'block' : 'none';
    }

    let accEditMode = false;

    function openAccountModal(accId = null, event = null) {
        if (event) event.stopPropagation();
        document.getElementById('accountForm').reset();
        
        if (accId) {
            accEditMode = true;
            const acc = gameData.find(a => a.id === accId);
            document.getElementById('modalAccId').value = accId;
            document.getElementById('modalAccName').value = acc.name;
            if (acc.membership === 'X') {
                document.querySelector('input[name="modalAccMembership"][value="X"]').checked = true;
            } else {
                document.querySelector('input[name="modalAccMembership"][value="O"]').checked = true;
                let d = acc.membershipDays !== undefined ? acc.membershipDays : 30;
                let h = acc.membershipHours !== undefined ? acc.membershipHours : 0;
                if (acc.membershipUpdatedAt) {
                    const diffMins = Math.floor((Date.now() - acc.membershipUpdatedAt) / 60000);
                    if (diffMins > 0) {
                        let tot = (d * 24) + h - Math.floor(diffMins / 60);
                        tot = Math.max(0, tot); d = Math.floor(tot / 24); h = tot % 24;
                    }
                }
                document.getElementById('membershipDays').value = d;
                document.getElementById('membershipHours').value = h;
            }
            document.getElementById('accountModalTitle').innerText = "계정 설정 수정";
        } else {
            accEditMode = false;
            document.getElementById('modalAccId').value = "";
            document.querySelector('input[name="modalAccMembership"][value="O"]').checked = true;
            document.getElementById('membershipDays').value = 30;
            document.getElementById('membershipHours').value = 0;
            document.getElementById('accountModalTitle').innerText = "새 계정 추가";
        }
        toggleMembershipUI();
        document.getElementById('accountModal').style.display = 'flex';
    }

    function closeAccountModal() { document.getElementById('accountModal').style.display = 'none'; accEditMode = false; }

    function submitAccountForm(e) {
        e.preventDefault();
        const accId = document.getElementById('modalAccId').value;
        const name = document.getElementById('modalAccName').value.trim();
        const membership = document.querySelector('input[name="modalAccMembership"]:checked').value;
        const days = membership === 'O' ? parseInt(document.getElementById('membershipDays').value) || 0 : 0;
        const hours = membership === 'O' ? parseInt(document.getElementById('membershipHours').value) || 0 : 0;

        if (accEditMode) {
            const acc = gameData.find(a => a.id === parseInt(accId));
            if (acc) { acc.name = name; acc.membership = membership; acc.membershipDays = days; acc.membershipHours = hours; acc.membershipUpdatedAt = Date.now(); }
        } else {
            const newId = Date.now();
            gameData.push({ 
                id: newId, name: name, membership: membership, membershipDays: days, membershipHours: hours, membershipUpdatedAt: Date.now(), dailyMissionChecked: false, membershipPassChecked: false,
                shugo: 2, dimension: 1, expedition: 0, transcend: 0, odeBuyChecked: false, villageOrderChecked: false, abyssOrderChecked: false, dailyDungeonChecked: false, characters: [] 
            });
            accordionStatus[newId] = true;
            localStorage.setItem('accordionStatus_v15', JSON.stringify(accordionStatus));
        }
        closeAccountModal(); saveData(); 
    }

    function toggleAlarmSetting(type) {
        alarmSettings[type] = document.getElementById(`toggle-${type}`).checked;
        localStorage.setItem('alarmSettings_v15', JSON.stringify(alarmSettings));
        updateTopAlertTimers();
    }

    function initAlarmToggles() {
        document.getElementById('toggle-festa').checked = alarmSettings.festa;
        document.getElementById('toggle-invasion').checked = alarmSettings.invasion;
        document.getElementById('toggle-space').checked = alarmSettings.space;
    }

    function getNextOdeResetTime() {
        const now = new Date();
        let baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
        if (now.getTime() < baseTime.getTime()) baseTime.setDate(baseTime.getDate() - 1);
        const cycles = Math.ceil((now.getTime() - baseTime.getTime()) / 10800000);
        return baseTime.getTime() + (cycles * 10800000);
    }

    function exportBackup() {
        if (gameData.length === 0) { alert("백업할 데이터가 없습니다."); return; }
        const bData = { gameData, lastChecked, lastAbyssReset, lastDailyReset, lastWeeklyReset, accordionStatus, alarmSettings };
        const blob = new Blob([JSON.stringify(bData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `homework_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    function importBackup(event) {
        const file = event.target.files[0]; if (!file) return;
        if (!confirm("⚠️ 주의: 파일을 불러오면 현재 데이터가 덮어씌워집니다.")) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.gameData && Array.isArray(parsed.gameData)) {
                    gameData = parsed.gameData; lastChecked = parsed.lastChecked || Date.now();
                    lastAbyssReset = parsed.lastAbyssReset || "0"; lastDailyReset = parsed.lastDailyReset || "0"; lastWeeklyReset = parsed.lastWeeklyReset || "0";
                    accordionStatus = parsed.accordionStatus || {}; alarmSettings = parsed.alarmSettings || { festa: true, invasion: true, space: true };
                    
                    localStorage.setItem('gameHomeworkData_v15', JSON.stringify(gameData));
                    localStorage.setItem('lastOdeUpdateTime_v15', lastChecked);
                    localStorage.setItem('lastAbyssResetTime_v15', lastAbyssReset);
                    localStorage.setItem('lastDailyResetTime_v15', lastDailyReset);
                    localStorage.setItem('lastWeeklyResetTime_v15', lastWeeklyReset);
                    localStorage.setItem('accordionStatus_v15', JSON.stringify(accordionStatus));
                    localStorage.setItem('alarmSettings_v15', JSON.stringify(alarmSettings));
                    alert("✅ 성공: 데이터를 정상적으로 불러왔습니다!"); initAlarmToggles(); render();
                } else { alert("❌ 파일 형식이 올바르지 않습니다."); }
            } catch (err) { alert("❌ 해석 중 오류 발생"); }
        };
        reader.readAsText(file);
    }

    function updateTopAlertTimers() {
        const now = new Date(); const currentMin = now.getMinutes(); const currentSec = now.getSeconds();
        const fEl = document.getElementById('timer-festa');
        if(fEl) {
            if (!alarmSettings.festa) { fEl.innerText = "OFF"; fEl.className = "alarm-timer disabled"; }
            else {
                let m = 59 - currentMin; let s = 59 - currentSec; if (m === 0 && s === 0) playBeepSound();
                fEl.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} 남음`;
                fEl.className = "alarm-timer" + (m < 5 ? " alarm-urgent" : "");
            }
        }
        const iEl = document.getElementById('timer-invasion');
        if(iEl) {
            if (!alarmSettings.invasion) { iEl.innerText = "OFF"; iEl.className = "alarm-timer disabled"; }
            else {
                let m = (currentMin < 30) ? (29 - currentMin) : (59 - currentMin + 30); let s = 59 - currentSec; if (m === 0 && s === 0) playBeepSound();
                iEl.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} 남음`;
                iEl.className = "alarm-timer" + (m < 5 ? " alarm-urgent" : "");
            }
        }
        const sEl = document.getElementById('timer-space');
        if(sEl) {
            if (!alarmSettings.space) { sEl.innerText = "OFF"; sEl.className = "alarm-timer disabled"; }
            else {
                const targets = [2, 5, 8, 11, 14, 17, 20, 23]; let nextT = null;
                for (let h of targets) {
                    let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0, 0);
                    if (t.getTime() > now.getTime()) { nextT = t; break; }
                }
                if (!nextT) nextT = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 2, 0, 0, 0);
                const diff = nextT.getTime() - now.getTime();
                const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
                if (h === 0 && m === 0 && s === 0) playBeepSound();
                sEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} 남음`;
                sEl.className = "alarm-timer" + (h === 0 && m < 10 ? " alarm-urgent" : "");
            }
        }
    }

    let isOdeUpdating = false;
    function updateOdeAutomatically() {
        if (isOdeUpdating || !gameData) return;
        isOdeUpdating = true;
        const lastExpected = getNextOdeResetTime() - 10800000;
        let pChecked = parseInt(lastChecked);
        if (isNaN(pChecked) || !pChecked) { pChecked = lastExpected - 10800000; lastChecked = pChecked; }
        
        if (pChecked < lastExpected) {
            const cycles = Math.round((lastExpected - pChecked) / 10800000);
            if (cycles >= 1) {
                const addOde = cycles * 15; lastChecked = lastExpected;
                localStorage.setItem('lastOdeUpdateTime_v15', lastChecked.toString());
                gameData.forEach(acc => {
                    if(acc.characters) acc.characters.forEach(char => {
                        if ((char.ode || 0) < 840) char.ode = Math.min(840, (char.ode || 0) + addOde);
                    });
                    if(acc.dailyMissionChecked===undefined)
                    acc.dailyMissionChecked=false;
                });
                localStorage.setItem('gameHomeworkData_v15', JSON.stringify(gameData));
                render();
            }
        }
        setTimeout(() => { isOdeUpdating = false; }, 500);
    }
    
    function updateTimerDisplay() {
        const diff = getNextOdeResetTime() - Date.now();
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        const tStr = `${h}:${m}:${s} 남음`;
        
        gameData.forEach(acc => {
            if(acc.characters) acc.characters.forEach(char => {
                const el = document.getElementById(`timer-${char.id}`);
                if (el) {
                    if (char.ode >= 840) { el.innerText = "[MAX]"; el.style.color = "var(--text-muted)"; }
                    else { el.innerText = `[${tStr}]`; el.style.color = "var(--timer-color)"; }
                }
            });
        });
        updateTopAlertTimers();
    }

    function checkAndReduceMembershipTime() {
        let changed = false; const now = Date.now();
        gameData.forEach(acc => {
            if (acc.membership === 'O') {
                if (!acc.membershipUpdatedAt) { acc.membershipUpdatedAt = now; changed = true; return; }
                const diffMins = Math.floor((now - acc.membershipUpdatedAt) / 60000);
                if (diffMins >= 60) {
                    let tot = ((acc.membershipDays || 0) * 24) + (acc.membershipHours || 0) - Math.floor(diffMins / 60);
                    if (tot <= 0) { acc.membership = 'X'; acc.membershipDays = 0; acc.membershipHours = 0; }
                    else { acc.membershipDays = Math.floor(tot / 24); acc.membershipHours = tot % 24; }
                    acc.membershipUpdatedAt = now; changed = true;
                }
            }
        });
        if (changed) { localStorage.setItem('gameHomeworkData_v15', JSON.stringify(gameData)); render(); }
    }

    function checkAbyssReset() {
        const now = new Date();
        function getPrev(d) {
            let t = new Date(d.getTime()); t.setHours(22, 0, 0, 0);
            if (d.getTime() < t.getTime()) d.setDate(d.getDate() - 1);
            while (t.getDay() !== 3 && t.getDay() !== 6) t.setDate(t.getDate() - 1);
            return t.getTime();
        }
        const currentTarget = getPrev(now);
        if (parseInt(lastAbyssReset) < currentTarget) {
            gameData.forEach(acc => { if(acc.characters) acc.characters.forEach(char => { char.abyssChecked = false; }); });
            localStorage.setItem('lastAbyssResetTime_v15', currentTarget.toString()); lastAbyssReset = currentTarget.toString(); saveData();
        }
    }

    function checkDailyReset() {
        const now = new Date(); let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
        if (now.getTime() < t.getTime()) t.setDate(t.getDate() - 1);
        if (parseInt(lastDailyReset) < t.getTime()) {
            gameData.forEach(acc => {
                acc.shugo = Math.min(14, (acc.shugo || 0) + 2); acc.dimension = Math.min(7, (acc.dimension || 0) + 1);
                    acc.dailyMissionChecked = false;
                if(acc.characters) acc.characters.forEach(char => {
                    char.nightmareTicket = Math.min(14, (char.nightmareTicket !== undefined ? char.nightmareTicket : 2) + 2);
                    char.homeworks.forEach(hw => { if (hw.type === 'daily') hw.checked = false; });
                });
            });
            localStorage.setItem('lastDailyResetTime_v15', t.getTime().toString()); lastDailyReset = t.getTime().toString(); saveData();
        }
    }

    function checkWeeklyReset() {
        const now = new Date(); let t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
        if (now.getTime() < t.getTime()) t.setDate(t.getDate() - 1);
        while (t.getDay() !== 3) t.setDate(t.getDate() - 1);
        if (parseInt(lastWeeklyReset) < t.getTime()) {
            gameData.forEach(acc => {
                acc.odeBuyChecked = false; acc.villageOrderChecked = false; acc.abyssOrderChecked = false; acc.dailyDungeonChecked = false; acc.dailyMissionChecked=false; acc.expedition = 0; acc.transcend = 0;
                if(acc.characters) acc.characters.forEach(char => {
                    char.charBuyChecked = false; char.nightmareChecked = false; char.awakeningChecked = false;
                    char.homeworks.forEach(hw => { if (hw.type === 'weekly') hw.checked = false; });
                });
            });
            localStorage.setItem('lastWeeklyResetTime_v15', t.getTime().toString()); lastWeeklyReset = t.getTime().toString(); saveData();
        }
    }

        function initializeAccountData() {
            gameData.forEach(acc => {
        
                if (acc.expedition === undefined)
                    acc.expedition = 84;
        
                if (acc.transcend === undefined)
                    acc.transcend = 56;
        
            });
        }

    function saveData() { localStorage.setItem('gameHomeworkData_v15', JSON.stringify(gameData)); render(); }

    function toggleAccordion(accId) {
        accordionStatus[accId] = accordionStatus[accId] === undefined ? false : !accordionStatus[accId];
        localStorage.setItem('accordionStatus_v15', JSON.stringify(accordionStatus));
        const body = document.getElementById(`acc-body-${accId}`);
        const icon = document.getElementById(`acc-icon-${accId}`);
        if (body && icon) {
            if (accordionStatus[accId]) { body.classList.remove('collapsed'); icon.innerText = '▲'; }
            else { body.classList.add('collapsed'); icon.innerText = '▼'; }
        }
    }

    function openCharModal(accId, event) { event.stopPropagation(); document.getElementById('modalAccId').value = accId; document.getElementById('charForm').reset(); document.getElementById('charModal').style.display = 'flex'; }
    let editMode = false, editAccId = null, editCharId = null;

    function openEditCharModal(accId, charId, event) {
        if (event) event.stopPropagation(); const char = gameData.find(a => a.id === accId).characters.find(c => c.id === charId);
        editMode = true; editAccId = accId; editCharId = charId;
        document.getElementById('modalAccId').value = accId; document.getElementById('modalCharName').value = char.name;
        document.getElementById('modalCharJob').value = char.job; document.getElementById('modalCharPower').value = char.power;
        document.querySelector('#charModal h3').innerText = "캐릭터 정보 수정"; document.getElementById('charModal').style.display = 'flex';
    }

    function closeCharModal() { document.getElementById('charModal').style.display = 'none'; editMode = false; document.querySelector('#charModal h3').innerText = "새 캐릭터 추가"; }

    function submitCharacterForm(e) {
        e.preventDefault(); const accId = parseInt(document.getElementById('modalAccId').value);
        const name = document.getElementById('modalCharName').value.trim(); const job = document.getElementById('modalCharJob').value; const power = document.getElementById('modalCharPower').value;
        const acc = gameData.find(a => a.id === accId);
        if (editMode) {
            const char = acc.characters.find(c => c.id === editCharId); if (char) { char.name = name; char.job = job; char.power = power; }
        } else {
            if(!acc.characters) acc.characters = [];
            acc.characters.push({
                id: Date.now(), name, job, power, ode: 0, extraOde: 0, nightmareTicket: 2, memo: '', charBuyChecked: false, awakeningChecked: false, hidden: false,
                homeworks: [{ name: '시즌주간미션', type: 'weekly', checked: false }, { name: '투기장', type: 'weekly', checked: false }, { name: '루드라', type: 'weekly', checked: false }]
            });
        }
        closeCharModal(); saveData();
    }

    let memoAccId = null, memoCharId = null;
    function openMemoModal(accId, charId, event) {
        if (event) event.stopPropagation(); memoAccId = accId; memoCharId = charId;
        const char = gameData.find(a => a.id === accId).characters.find(c => c.id === charId);
        document.getElementById('memoAccId').value = accId; document.getElementById('memoCharId').value = charId;
        document.getElementById('modalMemoText').value = char.memo || '';
        document.getElementById('memoModalTitle').innerText = `[${char.name}] 메모 관리`; document.getElementById('memoModal').style.display = 'flex';
    }
    function closeMemoModal() { document.getElementById('memoModal').style.display = 'none'; }
    function submitMemoForm(e) {
        e.preventDefault(); const char = gameData.find(a => a.id === memoAccId).characters.find(c => c.id === memoCharId);
        if (char) char.memo = document.getElementById('modalMemoText').value; closeMemoModal(); saveData();
    }

    function removeAccount(accId, event) {
        event.stopPropagation(); if(confirm("계정의 모든 데이터가 영구 삭제됩니다.")) {
            gameData = gameData.filter(a => a.id !== accId); delete accordionStatus[accId]; saveData();
        }
    }
    function removeCharacter(accId, charId) { if(confirm("캐릭터를 삭제하시겠습니까?")) { const acc = gameData.find(a => a.id === accId); acc.characters = acc.characters.filter(c => c.id !== charId); saveData(); } }

    function changeVal(accId, charId, key, diff) {
            const acc = gameData.find(a => a.id === accId);
        
            if (charId === null) {
        
                acc[key] = Math.max(0, (acc[key] || 0) + diff);
        
                if (key === 'shugo') acc[key] = Math.min(14, acc[key]);
                if (key === 'dimension') acc[key] = Math.min(7, acc[key]);
                if (key === 'expedition') acc[key] = Math.min(84, acc[key]);
                if (key === 'transcend') acc[key] = Math.min(56, acc[key]);
        
            } else {
        
                const char = acc.characters.find(c => c.id === charId);
        
                char[key] = Math.max(0, (char[key] || 0) + diff);
        
                if (key === 'nightmareTicket') char[key] = Math.min(14, char[key]);
            }
        
            render();
            saveData();
        }

    function setDirectVal(accId, charId, key, val) {
            const acc = gameData.find(a => a.id === accId);
        
            let num = Math.max(0, parseInt(val) || 0);
        
            if (charId === null) {
        
                if (key === 'shugo') num = Math.min(14, num);
                if (key === 'dimension') num = Math.min(7, num);
                if (key === 'expedition') num = Math.min(84, num);
                if (key === 'transcend') num = Math.min(56, num);
        
                acc[key] = num;
        
            } else {
        
                const char = acc.characters.find(c => c.id === charId);
        
                if (key === 'nightmareTicket')
                    num = Math.min(14, num);
        
                char[key] = num;
            }
        
            render();
            saveData();
        }

    function toggleCheckbox(accId, charId, field, origIndex = null) {
        const acc = gameData.find(a => a.id === accId);
        if (charId === null) acc[field] = !acc[field];
        else {
            const char = acc.characters.find(c => c.id === charId);
            if (origIndex !== null) {
                char.homeworks[origIndex].checked = !char.homeworks[origIndex].checked;
                if (char.homeworks[origIndex].type === 'once' && char.homeworks[origIndex].checked) char.homeworks.splice(origIndex, 1);
            } else char[field] = !char[field];
        }
        saveData();
    }

    function createCustomHomework(e, accId, charId) {
        e.preventDefault(); const name = e.target.hwName.value.trim(); const type = e.target.hwType.value;
        gameData.find(a => a.id === accId).characters.find(c => c.id === charId).homeworks.push({ name, type, checked: false }); saveData();
    }

    function createBatchHomework(e, accId) {
        e.preventDefault(); const name = e.target.batchHwName.value.trim(); const type = e.target.batchHwType.value;
        const acc = gameData.find(a => a.id === accId); if (!acc.characters || acc.characters.length === 0) return;
        acc.characters.forEach(c => c.homeworks.push({ name, type, checked: false })); saveData();
    }

    function deleteCustomHomework(accId, charId, origIndex) { if (confirm("이 숙제를 삭제하시겠습니까?")) { gameData.find(a => a.id === accId).characters.find(c => c.id === charId).homeworks.splice(origIndex, 1); saveData(); } }

    let isHideCompleted = JSON.parse(localStorage.getItem('isHideCompleted_v15')) || false;
    let isShowHiddenChars = JSON.parse(localStorage.getItem('isShowHiddenChars_v15')) || false;

    function toggleHideCompleted() { isHideCompleted = !isHideCompleted; localStorage.setItem('isHideCompleted_v15', JSON.stringify(isHideCompleted)); render(); }
    function toggleShowHiddenChars() { isShowHiddenChars = !isShowHiddenChars; localStorage.setItem('isShowHiddenChars_v15', JSON.stringify(isShowHiddenChars)); render(); }
    function toggleHideCharacter(accId, charId, event) { event.stopPropagation(); const char = gameData.find(a => a.id === accId).characters.find(c => c.id === charId); char.hidden = !char.hidden; saveData(); }

// ==========================================
// 0. 전역 상태 정의
// ==========================================
let filterConfig = JSON.parse(localStorage.getItem('filterConfig_v1')) || {
    includeCompleted: false, // 완료숙제 포함 여부
    selectedHomeworks: [],   // 선택된 숙제명 배열
    searchKeyword: '',       // 실시간 검색어
    isActive: false          // 필터 적용 활성화 여부
};


// ==========================================
// 1. 단일 버튼 이중 기능 & 드로어 제어
// ==========================================

// 상단 [숙제 필터 / 필터 초기화] 단일 버튼 클릭 핸들러
function handleFilterBtnClick() {
    if (filterConfig.isActive) {
        // 필터가 적용된 상태라면 -> 필터 즉시 초기화
        resetHomeworkFilter();
    } else {
        // 필터가 적용되지 않은 상태라면 -> 필터 드로어 열기
        toggleFilterDrawer(true);
    }
}

// 드로어 열기/닫기
function toggleFilterDrawer(isOpen) {
    const drawer = document.getElementById('filterDrawer');
    const overlay = document.getElementById('filterOverlay');
    if (!drawer || !overlay) return;

    if (typeof isOpen !== 'boolean') {
        isOpen = !drawer.classList.contains('active');
    }

    if (isOpen) {
        drawer.classList.add('active', 'open');
        overlay.classList.add('active', 'open');
        syncFilterUI();             // 열릴 때 UI 동기화
        renderFilterHomeworkList(); // 항목 리스트 렌더링
    } else {
        drawer.classList.remove('active', 'open');
        overlay.classList.remove('active', 'open');
    }
}

function closeFilterDrawer() {
    toggleFilterDrawer(false);
}

// UI 상태 동기화 (filterConfig -> DOM)
function syncFilterUI() {
    // 1) 라디오 버튼 동기화
    const radioVal = filterConfig.includeCompleted ? 'include' : 'exclude';
    const radioElem = document.querySelector(`input[name="filterCompleted"][value="${radioVal}"]`);
    if (radioElem) radioElem.checked = true;

    // 2) 검색창 동기화
    const searchInput = document.getElementById('filterSearchInput');
    if (searchInput) {
        searchInput.value = filterConfig.searchKeyword || '';
    }

    // 3) 상단 버튼 텍스트 및 배지 상태 업데이트
    updateFilterBadge();
}

// 라디오 버튼 변경 이벤트
function onFilterConfigChange() {
    const selectedRadio = document.querySelector('input[name="filterCompleted"]:checked');
    if (selectedRadio) {
        filterConfig.includeCompleted = (selectedRadio.value === 'include');
    }
}

// 실시간 검색어 입력 이벤트
function onFilterSearchInput(val) {
    filterConfig.searchKeyword = val || '';
    renderFilterHomeworkList();
}

// 검색어 초기화
function clearFilterSearch() {
    filterConfig.searchKeyword = '';
    const searchInput = document.getElementById('filterSearchInput');
    if (searchInput) searchInput.value = '';
    renderFilterHomeworkList();
}

// 체크박스 전체 해제
function clearAllFilterCheckboxes() {
    filterConfig.selectedHomeworks = [];
    renderFilterHomeworkList();
}

// 상단 필터 버튼 텍스트 및 배지 업데이트 (3번 요구사항 핵심)
function updateFilterBadge() {
    const filterBtn = document.getElementById('filterToggleBtn');
    if (!filterBtn) return;

    // 필터 활성화 여부 재판별
    const hasActiveFilter = filterConfig.includeCompleted || 
                            (filterConfig.selectedHomeworks && filterConfig.selectedHomeworks.length > 0) || 
                            (filterConfig.searchKeyword && filterConfig.searchKeyword.trim() !== '');

    filterConfig.isActive = hasActiveFilter;

    // 💡 innerHTML로 텍스트와 배지를 강제 즉시 변경
    if (hasActiveFilter) {
        const countStr = filterConfig.selectedHomeworks.length > 0 ? ` (${filterConfig.selectedHomeworks.length})` : '';
        filterBtn.innerHTML = `📋 숙제 필터 초기화 <span class="badge" style="background:#e74c3c; color:#fff; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:4px;">ON${countStr}</span>`;
        filterBtn.classList.add('btn-filter-active');
    } else {
        filterBtn.innerHTML = `📋 숙제 필터`;
        filterBtn.classList.remove('btn-filter-active');
    }
}


// ==========================================
// 2. 캐릭터 전용 숙제 목록 추출 및 렌더링 (1번 요구사항 반영)
// ==========================================

function renderFilterHomeworkList() {
    const container = document.getElementById('filterHomeworkList');
    if (!container) return;

    container.innerHTML = '';
    const keyword = (filterConfig.searchKeyword || '').trim().toLowerCase();

    // 캐릭터 숙제만 중복 없이 수집 (계정 공통 제외)
    const charHwMap = new Map();

    if (typeof gameData !== 'undefined' && Array.isArray(gameData)) {
        gameData.forEach(acc => {
            if (acc.characters && Array.isArray(acc.characters)) {
                acc.characters.forEach(char => {
                    if (char.homeworks && Array.isArray(char.homeworks)) {
                        char.homeworks.forEach(hw => {
                            if (hw.name && !charHwMap.has(hw.name)) {
                                const typeLabel = hw.type === 'weekly' ? '주간' : (hw.type === 'daily' ? '일일' : '기타');
                                charHwMap.set(hw.name, typeLabel);
                            }
                        });
                    }
                });
            }
        });
    }

    const homeworkItems = [];
    charHwMap.forEach((typeLabel, hwName) => {
        homeworkItems.push({ id: hwName, name: hwName, type: typeLabel });
    });

    // 검색 키워드 필터링
    const filteredItems = homeworkItems.filter(item => {
        if (!keyword) return true;
        return item.name.toLowerCase().includes(keyword);
    });

    if (filteredItems.length === 0) {
        container.innerHTML = '<div class="empty-msg" style="text-align:center; color:#888; padding:20px; font-size:13px;">등록된 캐릭터 숙제가 없습니다.</div>';
        return;
    }

    // 주간/일일/기타 분류별 렌더링
    const groups = {};
    filteredItems.forEach(item => {
        if (!groups[item.type]) groups[item.type] = [];
        groups[item.type].push(item);
    });

    Object.keys(groups).forEach(groupType => {
        const catGroup = document.createElement('div');
        catGroup.className = 'filter-homework-group';
        catGroup.style.marginBottom = '12px';

        const catTitle = document.createElement('div');
        catTitle.className = 'filter-group-title';
        catTitle.style.cssText = 'font-size:12px; font-weight:bold; color:#4a90e2; margin-bottom:6px;';
        catTitle.textContent = `[${groupType} 숙제]`;
        catGroup.appendChild(catTitle);

        const itemList = document.createElement('div');
        itemList.className = 'filter-item-list';
        itemList.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px;';

        groups[groupType].forEach(item => {
            const isChecked = filterConfig.selectedHomeworks.includes(item.id);

            const label = document.createElement('label');
            label.style.cssText = `display:inline-flex; align-items:center; gap:5px; padding:5px 9px; border-radius:4px; background:${isChecked ? 'rgba(74, 144, 226, 0.25)' : 'rgba(255,255,255,0.06)'}; border:1px solid ${isChecked ? '#4a90e2' : 'transparent'}; font-size:12px; cursor:pointer; color:#fff;`;
            label.innerHTML = `
                <input type="checkbox" value="${item.id}" ${isChecked ? 'checked' : ''} onchange="onHomeworkFilterCheckChange(this)">
                <span>${item.name}</span>
            `;
            itemList.appendChild(label);
        });

        catGroup.appendChild(itemList);
        container.appendChild(catGroup);
    });
}

// 체크박스 클릭 핸들러
function onHomeworkFilterCheckChange(checkbox) {
    const val = checkbox.value;
    if (checkbox.checked) {
        if (!filterConfig.selectedHomeworks.includes(val)) {
            filterConfig.selectedHomeworks.push(val);
        }
    } else {
        filterConfig.selectedHomeworks = filterConfig.selectedHomeworks.filter(id => id !== val);
    }
}


// ==========================================
// 3. 필터 적용 및 초기화
// ==========================================

function applyHomeworkFilter() {
    // 1. 상태 및 localStorage 저장
    localStorage.setItem('filterConfig_v1', JSON.stringify(filterConfig));
    
    // 2. 버튼 텍스트/배지 즉시 최신화 (순서 중요)
    updateFilterBadge();
    
    // 3. 드로어 닫기
    toggleFilterDrawer(false);
    
    // 4. 메인 화면 재렌더링
    if (typeof render === 'function') {
        render();
    }
}

function resetHomeworkFilter() {
    filterConfig = {
        includeCompleted: false,
        selectedHomeworks: [],
        searchKeyword: '',
        isActive: false
    };
    localStorage.removeItem('filterConfig_v1');
    syncFilterUI();
    toggleFilterDrawer(false);
    if (typeof render === 'function') render(); // 메인 화면 재렌더링
}


// ==========================================
// 4. 캐릭터 필터링 판별 로직 (2번 요구사항 반영)
// ==========================================

function checkCharacterHasHomework(char, config) {
    // 필터가 꺼져 있으면 모든 캐릭터 표시
    if (!config || !config.isActive) return true;

    const homeworks = char.homeworks || [];

    // 1) 특정 숙제가 선택된 경우 (예: 루드라 선택)
    if (config.selectedHomeworks && config.selectedHomeworks.length > 0) {
        const hasMatchingHw = config.selectedHomeworks.some(selectedName => {
            const hw = homeworks.find(h => h.name === selectedName || h.id === selectedName);
            if (!hw) return false;

            const isDone = hw.checked || hw.isDone;

            // 완료 숙제 미포함 조건 시 -> 미완료된 숙제일 때만 true
            if (!config.includeCompleted) {
                return !isDone;
            }
            return true; // 완료 숙제 포함 조건 시 -> 존재만 하면 true
        });

        if (!hasMatchingHw) return false;
    } 
    // 2) 특정 숙제 선택 없이 '완료숙제 미포함' 옵션만 켜져 있는 경우
    else if (!config.includeCompleted) {
        const hasUnfinished = homeworks.some(hw => !(hw.checked || hw.isDone));
        if (!hasUnfinished) return false;
    }

    return true;
}

// ==========================================
// 추천 숙제 데이터 프리셋 (여기서 자유롭게 추가/삭제 가능)
// type: "fixed" 고정숙제
// type: "weekly" 주간숙제
// type: "daily" 일일숙제
// type: "once" 일회성숙제
// ==========================================
const recommendedHomeworkList = [
    { name: "시즌미션 주간보상", type: "weekly" },
    { name: "주간 보급의뢰", type: "weekly" },
    { name: "패스 경험치", type: "weekly" },
    { name: "투기장", type: "weekly" },
    { name: "악몽 10회", type: "weekly" },
    { name: "어비스 몬스터잡기", type: "weekly" },
    { name: "회랑(수)", type: "weekly" },
    { name: "회랑(토)", type: "weekly" },
    { name: "루드라", type: "weekly" },
    { name: "침식", type: "weekly" },
    { name: "무스펠", type: "weekly" },
    { name: "원정(시련)", type: "weekly" },
    { name: "이벤트 퀘스트, 구매", type: "weekly" },
    { name: "보급의뢰", type: "daily" },
    { name: "신규대륙 스토리", type: "once" },
];

let recModalAccId = null;

// 추천 숙제 모달 열기
function openRecModal(accId, event) {
    if (event) event.stopPropagation();
    recModalAccId = accId;
    
    const acc = gameData.find(a => a.id === accId);
    const container = document.getElementById('recHomeworkListContainer');
    const checkAllBox = document.getElementById('selectAllRecHw');
    
    if (checkAllBox) checkAllBox.checked = false;

    if (container) {
        container.innerHTML = '';
        
        recommendedHomeworkList.forEach((hw, idx) => {
            let typeLabel = "기타";
            let typeClass = "once";
            
            if (hw.type === 'fixed') { typeLabel = "고정"; typeClass = "fixed"; }
            else if (hw.type === 'weekly') { typeLabel = "주간"; typeClass = "weekly"; }
            else if (hw.type === 'daily') { typeLabel = "일일"; typeClass = "daily"; }
            else if (hw.type === 'once') { typeLabel = "일회성"; typeClass = "once"; }

            const itemDiv = document.createElement('div');
            itemDiv.className = 'rec-hw-item';
            itemDiv.innerHTML = `
                <label class="hw-label" style="cursor:pointer; display:flex; align-items:center; gap:8px; width:100%;">
                    <input type="checkbox" class="rec-hw-checkbox" data-type="${hw.type}" value="${idx}" onchange="syncSelectAllCheckbox()">
                    <span class="rec-badge ${typeClass}">${typeLabel}</span>
                    <span style="font-size:13px; color:#fff;">${hw.name}</span>
                </label>
            `;
            container.appendChild(itemDiv);
        });
    }

    const titleEl = document.getElementById('recModalTitle');
    if (titleEl && acc) titleEl.innerText = `[${acc.name}] 추천 숙제 일괄 추가`;
    
    const modal = document.getElementById('recHomeworkModal');
    if (modal) modal.style.display = 'flex';
}

// 전체 선택/해제
function toggleAllRecHomework(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.rec-hw-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = masterCheckbox.checked;
    });
}

// 특정 타입(fixed, weekly, daily, once) 전체 선택/해제 토글
function toggleRecHomeworkByType(type) {
    const targetBoxes = document.querySelectorAll(`.rec-hw-checkbox[data-type="${type}"]`);
    if (targetBoxes.length === 0) return;

    // 해당 타입 항목들이 모두 체크되어 있다면 해제, 아니라면 모두 체크
    const isAllChecked = Array.from(targetBoxes).every(cb => cb.checked);
    targetBoxes.forEach(cb => {
        cb.checked = !isAllChecked;
    });

    // 전체 선택 체크박스 상태 업데이트
    syncSelectAllCheckbox();
}

// 개별 체크박스 변경 시 상단 '전체 선택' 상태 동기화
function syncSelectAllCheckbox() {
    const totalBoxes = document.querySelectorAll('.rec-hw-checkbox');
    const checkedBoxes = document.querySelectorAll('.rec-hw-checkbox:checked');
    const checkAllBox = document.getElementById('selectAllRecHw');
    
    if (checkAllBox) {
        checkAllBox.checked = (totalBoxes.length > 0 && totalBoxes.length === checkedBoxes.length);
    }
}

// 추천 숙제 모달 닫기
function closeRecModal() {
    const modal = document.getElementById('recHomeworkModal');
    if (modal) modal.style.display = 'none';
    recModalAccId = null;
}

// 체크된 추천 숙제를 계정의 모든 캐릭터에 일괄 추가
function submitRecHomeworkForm(e) {
    e.preventDefault();
    if (!recModalAccId) return;

    const acc = gameData.find(a => a.id === recModalAccId);
    if (!acc || !acc.characters || acc.characters.length === 0) {
        alert("숙제를 추가할 캐릭터가 없습니다.");
        closeRecModal();
        return;
    }

    const checkboxes = document.querySelectorAll('.rec-hw-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("추가할 추천 숙제를 선택해 주세요.");
        return;
    }

    checkboxes.forEach(cb => {
        const hwIndex = parseInt(cb.value);
        const selectedHw = recommendedHomeworkList[hwIndex];

        acc.characters.forEach(char => {
            if (selectedHw.type === 'fixed') {
                // 고정 숙제의 경우 기존 속성 활성화
                if (selectedHw.name.includes("오드")) char.charBuyChecked = false;
                if (selectedHw.name.includes("각성")) char.awakeningChecked = false;
            } else {
                // 커스텀 숙제 리스트에 추가 (중복 방지 체크)
                if (!char.homeworks) char.homeworks = [];
                const isExist = char.homeworks.some(h => h.name === selectedHw.name && h.type === selectedHw.type);
                if (!isExist) {
                    char.homeworks.push({
                        name: selectedHw.name,
                        type: selectedHw.type,
                        checked: false
                    });
                }
            }
        });
    });

    closeRecModal();
    saveData();
}


function render() {
    const app = document.getElementById('app'); 
    if (!app) return;

    if (gameData.length === 0) { 
        app.innerHTML = `<p style="text-align:center; color:#fff; margin-top: 50px; font-weight:600;">우측 하단의 <span style="color:var(--accent)">메뉴 단추</span>를 눌러 새 계정을 추가해 주세요!</p>`; 
        return; 
    }

    let html = `<div class="global-action-bar">
        <button id="btnToggleHide" class="btn-toggle-action" onclick="toggleHideCompleted()">${isHideCompleted ? '👀 모든 숙제 보기' : '✅ 완료 숙제 제외'}</button>
        <button id="btnToggleHiddenChars" class="btn-toggle-action" onclick="toggleShowHiddenChars()">${isShowHiddenChars ? '🙈 제외 캐릭터 감추기' : '🙉 제외 캐릭터 관리'}</button>
        <button id="filterToggleBtn" class="btn" onclick="handleFilterBtnClick()">📋 숙제 필터</button>
    </div>`;

    gameData.forEach(acc => {
        if (accordionStatus[acc.id] === undefined) accordionStatus[acc.id] = true;
        const isCollapsed = !accordionStatus[acc.id];
        let d = acc.membershipDays || 0, h = acc.membershipHours || 0;
        
        if (acc.membership === 'O' && acc.membershipUpdatedAt) {
            const diffMins = Math.floor((Date.now() - acc.membershipUpdatedAt) / 60000);
            if (diffMins > 0) { 
                let tot = Math.max(0, (d * 24) + h - Math.floor(diffMins / 60)); 
                d = Math.floor(tot / 24); 
                h = tot % 24; 
            }
        }
        const mText = acc.membership === 'O' ? `멤버십 남은기간 : ${d}일 ${h}시간` : '멤버십 미이용';

        html += `<div class="account-section">
            <div class="account-header" onclick="toggleAccordion(${acc.id})">
                <div style="display: flex; align-items: center;">
                    <span class="accordion-icon" id="acc-icon-${acc.id}">${isCollapsed ? '▼' : '▲'}</span>
                    <h2 style="margin:0; font-size:14px; margin-left:6px;">${acc.name} <span style="font-size:12px; background:rgba(255,255,255,0.06); color:var(--text-muted); padding:2px 6px; border-radius:4px; margin-left:8px; font-weight:normal;">${mText}</span></h2>
                </div>
                <div onclick="event.stopPropagation();">
                    <button class="btn btn-sm" onclick="openCharModal(${acc.id}, event)">+ 캐릭터 추가</button>
                    <button class="btn btn-sm btn-char-edit" onclick="openAccountModal(${acc.id}, event)">⚙️</button>
                    <button class="btn btn-sm btn-char-del" onclick="removeAccount(${acc.id}, event)">🗑️</button>
                </div>
            </div>
            <div class="account-body ${isCollapsed ? 'collapsed' : ''}" id="acc-body-${acc.id}">
                <div class="account-contents">

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; ">
                              <span class="account-contents-title">계정 공통 콘텐츠 <button type="button" class="btn btn-xs btn-b3" style="margin-left:8px;" onclick="openRecModal(${acc.id}, event)">⭐ 추천 숙제 추가</button></span>
                               
                              <div style="display:flex; align-items:center; gap:6px;">
                                  
                        
                                  <form class="batch-add-form"
                                      onclick="event.stopPropagation();"
                                      onsubmit="createBatchHomework(event, ${acc.id})">
                        
                                      <input type="text"
                                          name="batchHwName"
                                          placeholder="일괄 추가할 숙제 명"
                                          required>
                        
                                      <select name="batchHwType">
                                          <option value="daily">일일</option>
                                          <option value="weekly">주간</option>
                                          <option value="once">일회성</option>
                                      </select>
                        
                                      <button type="submit" class="btn btn-xs">
                                          일괄 추가
                                      </button>
                                  </form>
                              </div>
                          </div>

                    <div class="account-common-wrap">

                        <!-- 자원 -->
                        <div class="common-card">
                            <div class="resource-item">
                                <span class="char-name">슈고 페스타</span>

                                <div class="counter-controls">
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'shugo',-1)">-</button>

                                    <span class="counter-progress">
                                        ${acc.shugo} <span class="max">/14</span>
                                    </span>

                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'shugo',1)">+</button>
                                </div>
                            </div>

                            <div class="resource-item">
                                <span class="char-name">차원 침공</span>

                                <div class="counter-controls">
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'dimension',-1)">-</button>

                                    <span class="counter-progress">
                                        ${acc.dimension} <span class="max">/7</span>
                                    </span>

                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'dimension',1)">+</button>
                                </div>
                            </div>

                            <div class="resource-item">
                                <span class="char-name">원정</span>
                                
                                <div class="counter-controls">
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'expedition',-1)">
                                        -
                                    </button>
                                
                                    <span class="counter-progress">
                                        <input
                                            type="number"
                                            class="counter-input"
                                            value="${acc.expedition || 0}"
                                            min="0"
                                            max="84"
                                            onchange="setDirectVal(${acc.id},null,'expedition',this.value)"
                                        >
                                        <span class="max">/84</span>
                                    </span>
                                
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'expedition',1)">
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <div class="resource-item">
                                <span class="char-name">초월</span>
                                
                                <div class="counter-controls">
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'transcend',-1)">
                                        -
                                    </button>
                                
                                    <span class="counter-progress">
                                        <input
                                            type="number"
                                            class="counter-input"
                                            value="${acc.transcend || 0}"
                                            min="0"
                                            max="56"
                                            onchange="setDirectVal(${acc.id},null,'transcend',this.value)"
                                        >
                                        <span class="max">/56</span>
                                    </span>
                                
                                    <button class="btn btn-xs"
                                        onclick="changeVal(${acc.id},null,'transcend',1)">
                                        +
                                    </button>
                                </div>
                            </div>

                        </div>

                        <!-- 체크리스트 -->
                        <div class="common-card">
                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.odeBuyChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'odeBuyChecked')">

                                    <span class="${acc.odeBuyChecked?'checked-text':''}" style="font-size:13px;">
                                        🍀 오드구매·제작(16)
                                    </span>
                                </label>
                            </div>

                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.villageOrderChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'villageOrderChecked')">

                                    <span class="${acc.villageOrderChecked?'checked-text':''}" style="font-size:13px;">
                                        📜 지령서 (마을)
                                    </span>
                                </label>
                            </div>

                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.abyssOrderChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'abyssOrderChecked')">

                                    <span class="${acc.abyssOrderChecked?'checked-text':''}" style="font-size:13px;">
                                        🌀 지령서 (어비스)
                                    </span>
                                </label>
                            </div>

                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.dailyDungeonChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'dailyDungeonChecked')">

                                    <span class="${acc.dailyDungeonChecked?'checked-text':''}" style="font-size:13px;">
                                        🏦 일일던전
                                    </span>
                                </label>
                            </div>

                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.dailyMissionChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'dailyMissionChecked')">

                                    <span class="${acc.dailyMissionChecked?'checked-text':''}" style="font-size:13px;">
                                        📅 일일사명퀘
                                    </span>
                                </label>
                            </div>

                            <div class="resource-item">
                                <label class="hw-label">
                                    <input type="checkbox"
                                        ${acc.membershipPassChecked?'checked':''}
                                        onchange="toggleCheckbox(${acc.id},null,'membershipPassChecked')">

                                    <span class="${acc.membershipPassChecked?'checked-text':''}" style="font-size:13px;">
                                        🪙 멤버십 패스
                                    </span>
                                </label>
                            </div>


                        </div>

                    </div>

                </div>
                
                <div class="char-grid">`;

        if (acc.characters && acc.characters.length > 0) {
    acc.characters.forEach(char => {
        // ==========================================
        // 💡 [숙제 필터 검사] 조건에 맞지 않는 캐릭터 스킵
        // ==========================================
        if (typeof checkCharacterHasHomework === 'function') {
            const isVisible = checkCharacterHasHomework(char, filterConfig);
            if (!isVisible) return; // 조건 미충족 시 해당 캐릭터 카드 생성 안 함
        }

        const ticket = char.nightmareTicket !== undefined ? char.nightmareTicket : 2;
        const isHidden = char.hidden || false;
        
        html += `<div class="char-card ${isHidden ? 'is-hidden-char' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--card-border); padding-bottom:8px;">
                <div style="display:flex; flex-direction:column; max-width:130px;"><span class="char-name">${char.name}</span><span class="char-sub-info">${char.job} | <span class="char-power">${Number(char.power).toLocaleString()}</span></span></div>
                <button class="btn-char-hide" onclick="toggleHideCharacter(${acc.id}, ${char.id}, event)">${isHidden ? '🙉 포함' : '🙈 숨김'}</button>
            </div>
            <div class="resource-group">
                <div style="display:flex; justify-content:space-between; align-items:center;"><strong>오드에너지</strong><span class="ode-timer" id="timer-${char.id}">[로딩중...]</span></div>
                <div class="ode-row"><span>기본오드</span><span>[ <input type="number" class="counter-input" value="${char.ode || 0}" onchange="setDirectVal(${acc.id}, ${char.id}, 'ode', this.value)"> ] / 840</span></div>
                <div class="ode-row"><span>추가오드</span><span>[ <input type="number" class="counter-input" value="${char.extraOde || 0}" onchange="setDirectVal(${acc.id}, ${char.id}, 'extraOde', this.value)"> ] / 2000</span></div>
            </div>
            <div class="resource-group" style="display:flex; justify-content:space-between; align-items:center; padding-top:0;">
    <span class="char-name">악몽 티켓</span>

    <div class="counter-controls">
        <button class="btn btn-xs" 
            onclick="changeVal(${acc.id}, ${char.id}, 'nightmareTicket', -1)">-</button>

        <span class="counter-progress">
            ${ticket} <span class="max">/14</span>
        </span>

        <button class="btn btn-xs" 
            onclick="changeVal(${acc.id}, ${char.id}, 'nightmareTicket', 1)">+</button>
    </div>
</div>
            <div class="homework-group">
                <strong style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">📌 고정 숙제</strong>
                <div class="hw-item"><label class="hw-label"><input type="checkbox" ${char.charBuyChecked ? 'checked' : ''} onchange="toggleCheckbox(${acc.id}, ${char.id}, 'charBuyChecked')"><span class="hw-text ${char.charBuyChecked ? 'checked-text' : ''}">오드구매,제작 (4)</span></label></div>
                <div class="hw-item"><label class="hw-label"><input type="checkbox" ${char.awakeningChecked ? 'checked' : ''} onchange="toggleCheckbox(${acc.id}, ${char.id}, 'awakeningChecked')"><span class="hw-text ${char.awakeningChecked ? 'checked-text' : ''}">각성전</span></label></div>
            </div>
            <div class="homework-group" style="border:none; padding:0;">
                <strong style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">📝 숙제 리스트</strong>`;

        // 원래 배열 구조와 인덱스를 유지하면서 정렬하여 HTML 출력
        const typeOrder = { 'weekly': 1, 'daily': 2, 'once': 3 };
        const mappedHomeworks = (char.homeworks || []).map((hw, index) => ({ hw, index }));
        
        mappedHomeworks.sort((a, b) => (typeOrder[a.hw.type] || 99) - (typeOrder[b.hw.type] || 99));

        let currentType = "";

        mappedHomeworks.forEach(({ hw, index }) => {
            if (currentType !== hw.type) {
                currentType = hw.type;
                html += `
                    <div class="custom-homework-category ${hw.type}">
                        ${
                            hw.type === "weekly"
                                ? "[주간]"
                                : hw.type === "daily"
                                ? "[일일]"
                                : "[일회성]"
                        }
                    </div>
                `;
            }
        
            html += `
                <div class="hw-item">
                    <label class="hw-label">
                        <input
                            type="checkbox"
                            ${hw.checked ? 'checked' : ''}
                            onchange="toggleCheckbox(${acc.id}, ${char.id}, null, ${index})">
                        
                        <span class="hw-text ${hw.checked ? 'checked-text' : ''}">
                            ${hw.name}
                        </span>
                    </label>
                
                    <button
                        class="btn-danger2"
                        style="padding:1px 4px;font-size:10px;filter:contrast(.1);border:none;"
                        onclick="deleteCustomHomework(${acc.id}, ${char.id}, ${index})">
                        ❌
                    </button>
                </div>
            `;
        });

        html += `</div>
            <form class="add-form" onsubmit="createCustomHomework(event, ${acc.id}, ${char.id})">
                <input type="text" name="hwName" placeholder="숙제 명" required>
                <select name="hwType"><option value="weekly">주간</option><option value="daily">일일</option><option value="once">일회성</option></select>
                <button type="submit" class="btn btn-xs">+</button>
            </form>
            <div class="char-control-footer">
                <div style="position:relative;"><button class="btn btn-xs btn-char-edit" onclick="openMemoModal(${acc.id}, ${char.id}, event)">메모</button>${char.memo?'<span class="memo-red-dot"></span>':''}</div>
                <button class="btn btn-xs btn-char-edit" onclick="openEditCharModal(${acc.id}, ${char.id}, event)">설정</button>
                <button class="btn btn-xs btn-char-del" onclick="removeCharacter(${acc.id}, ${char.id}, event)">삭제</button>
            </div>
        </div>`;
    });
} else {
    html += `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); font-size:13px; padding:20px 0;">💡 캐릭터를 추가해 주세요!</div>`;
}

        html += `</div></div></div>`;
    });

    app.innerHTML = html; 
    updateTimerDisplay();
    updateFilterBadge();

    if (isHideCompleted) document.body.classList.add('hide-completed-mode'); 
    else document.body.classList.remove('hide-completed-mode');

    if (isShowHiddenChars) document.body.classList.add('show-hidden-chars-mode'); 
    else document.body.classList.remove('show-hidden-chars-mode');
}

// 최초 실행 및 타이머 설정
checkAndReduceMembershipTime(); 
updateOdeAutomatically(); 
checkAbyssReset(); 
checkDailyReset(); 
checkWeeklyReset(); 
render(); 
initAlarmToggles();

setInterval(updateTimerDisplay, 1000);
setInterval(() => { 
    checkAndReduceMembershipTime(); 
    updateOdeAutomatically(); 
    checkAbyssReset(); 
    checkDailyReset(); 
    checkWeeklyReset(); 
}, 60000);

function updateExpedition(input, accountId) {
    let value = parseInt(input.value) || 0;

    const max = 84;

    if (value < 0) value = 0;
    if (value > max) value = max;

    input.value = value;

    // 기존 데이터 저장
    const account = gameData.find(a => a.id == accountId);
    if (account) {
        account.expedition = value;
    }

    saveData();
    render();
}
