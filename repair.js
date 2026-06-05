// repair.js
let allRepairs = [];
let currentRepairFilter = 'အားလုံး';

function initPage() {
    fetchRepairs();
}

function fetchRepairs() {
    db.collection("repairs").orderBy("date", "desc").onSnapshot((snap) => {
        allRepairs = [];
        snap.forEach((doc) => { allRepairs.push({ id: doc.id, ...doc.data() }); });
        renderRepairs();
    });
}

function setRepairFilter(status, btnElement) {
    currentRepairFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'border-transparent');
        btn.classList.add('bg-white', 'border-slate-200', 'text-slate-500');
    });
    
    btnElement.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
    btnElement.classList.add('bg-indigo-600', 'text-white', 'border-transparent');
    renderRepairs();
}

function renderRepairs() {
    const list = document.getElementById("repairList");
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let filteredHTML = "";
    
    let totalReceived = 0, totalDone = 0, totalPending = 0;

    allRepairs.forEach((d) => {
        // Stats တွက်ချက်ခြင်း
        totalReceived++;
        if (d.status === "ပြီးစီး" || d.status === "အပ်နှံပြီး") totalDone++;
        else totalPending++;

        let show = false;
        if (searchTerm !== "") {
            show = (d.name || '').toLowerCase().includes(searchTerm) || 
                   (d.vrno || '').toLowerCase().includes(searchTerm) || 
                   (d.model || '').toLowerCase().includes(searchTerm);
        } else {
            if (currentRepairFilter === 'အားလုံး') show = true;
            else if (currentRepairFilter === d.status) show = true;
        }

        if (show) {
            let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
            if (d.status === "ပြင်ဆင်ဆဲ") badgeClass = "bg-amber-100 text-amber-700 border-amber-200";
            if (d.status === "ပြီးစီး") badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
            if (d.status === "အပ်နှံပြီး") badgeClass = "bg-indigo-100 text-indigo-700 border-indigo-200";

            let costNum = Number(d.cost || 0);
            let incomeNum = Number(d.income || 0);
            let profit = incomeNum - costNum;

            filteredHTML += `
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-500 mr-1">Voucher: ${d.vrno || 'N/A'}</span>
                            <h3 class="text-sm font-bold text-slate-800 inline-block mt-1">${d.name} (${d.model})</h3>
                        </div>
                        <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold border whitespace-nowrap ${badgeClass}">${d.status}</span>
                    </div>
                    
                    <p class="text-xs text-slate-500 font-medium mb-2">🛠 ပြင်ဆင်ချက်: <span class="text-slate-700 font-bold">${d.job || '-'}</span></p>
                    
                    <div class="flex gap-4 text-xs mt-3">
                        <div class="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">အပ်ရက်</p><p class="font-bold text-slate-600">${d.date}</p></div>
                        <div class="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">ကုန်ကျစရိတ် / ရရှိငွေ</p><p class="font-bold text-slate-700">${costNum.toLocaleString()} / <span class="text-emerald-600">${incomeNum.toLocaleString()} Ks</span></p></div>
                    </div>

                    <div class="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-slate-200">
                        <span class="text-xs font-bold text-indigo-600">အမြတ်: ${profit.toLocaleString()} Ks</span>
                        <div class="flex gap-1.5">
                            ${d.status === 'ပြင်ဆင်ဆဲ' ? `<button onclick="updateRepairStatus('${d.id}', 'ပြီးစီး')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">ပြီးပြီ</button>` : ''}
                            ${d.status === 'ပြီးစီး' ? `<button onclick="updateRepairStatus('${d.id}', 'အပ်နှံပြီး', ${incomeNum}, ${costNum}, '${d.name}', '${d.model}')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">လူနာလာယူပြီ</button>` : ''}
                            <button onclick="showRepairForm('${d.id}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">ပြင်မည်</button>
                            <button onclick="deleteRepair('${d.id}', '${d.name}')" class="bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-100">ဖျက်မည်</button>
                        </div>
                    </div>
                </div>`;
        }
    });

    list.innerHTML = filteredHTML || `<div class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300"><p class="text-xs font-bold text-slate-400">ပြင်ဆင်မှုမှတ်တမ်း မရှိပါ</p></div>`;
    
    document.getElementById("totalReceived").innerText = `${totalReceived} လုံး`;
    document.getElementById("totalDone").innerText = `${totalDone} လုံး`;
    document.getElementById("totalPending").innerText = `${totalPending} လုံး`;
}

// ➕ ဖုန်းအပ်စာင်းသွင်းရန် / ပြင်ဆင်ရန် Popup Form
function showRepairForm(id = null) {
    let today = new Date().toISOString().split('T')[0];
    let r = id ? allRepairs.find(x => x.id === id) : { vrno: 'MA-'+Date.now().toString().slice(-4), name:'', model:'', job:'', cost:'', income:'', status:'ပြင်ဆင်ဆဲ', date: today };
    
    Swal.fire({
        title: id ? '📝 ပြင်ဆင်မှုစာရင်း ပြင်ရန်' : '🛠 ဖုန်းအပ်နှံမှု အသစ်သွင်းရန်',
        html: `
            <div class="text-left p-1">
                <div style="display: flex; gap: 10px;">
                    <div style="flex:1;">
                        <label class="swal-form-label">Voucher နံပါတ်</label>
                        <input id="swal-vrno" class="swal-form-input" value="${r.vrno}" placeholder="MA-0001">
                    </div>
                    <div style="flex:1;">
                        <label class="swal-form-label">ရက်စွဲ</label>
                        <input id="swal-date" type="date" class="swal-form-input" value="${r.date}">
                    </div>
                </div>

                <label class="swal-form-label">ဖောက်သည်အမည်</label>
                <input id="swal-name" class="swal-form-input" value="${r.name}" placeholder="ကိုမြတ်">
                
                <label class="swal-form-label">ဖုန်းမော်ဒယ် (Model)</label>
                <input id="swal-model" class="swal-form-input" value="${r.model}" placeholder="Redmi Note 8 Pro">

                <label class="swal-form-label">ဖြစ်ပွားသည့် ရောဂါ / ပြင်ဆင်ချက်</label>
                <input id="swal-job" class="swal-form-input" value="${r.job}" placeholder="Touch လဲရန် / CPU Reballing">

                <div style="display: flex; gap: 10px;">
                    <div style="flex:1;">
                        <label class="swal-form-label">ပစ္စည်းရင်းစျေး (စရိတ်)</label>
                        <input id="swal-cost" type="number" class="swal-form-input" value="${r.cost}" placeholder="0">
                    </div>
                    <div style="flex:1;">
                        <label class="swal-form-label">ပြင်ဆင်ခ လက်ခ (ရရှိငွေ)</label>
                        <input id="swal-income" type="number" class="swal-form-input" value="${r.income}" placeholder="0">
                    </div>
                </div>

                <label class="swal-form-label">အခြေအနေ</label>
                <select id="swal-status" class="swal-form-input">
                    <option value="ပြင်ဆင်ဆဲ" ${r.status==='ပြင်ဆင်ဆဲ'?'selected':''}>ပြင်ဆင်ဆဲ</option>
                    <option value="ပြီးစီး" ${r.status==='ပြီးစီး'?'selected':''}>ပြီးစီး (ပြင်ပြီး)</option>
                    <option value="အပ်နှံပြီး" ${r.status==='အပ်နှံပြီး'?'selected':''}>အပ်နှံပြီး (လူနာယူသွားပြီ)</option>
                </select>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'သိမ်းဆည်းမည်',
        cancelButtonText: 'မလုပ်တော့ပါ',
        confirmButtonColor: '#4f46e5',
        preConfirm: () => {
            const vrno = document.getElementById('swal-vrno').value.trim();
            const date = document.getElementById('swal-date').value;
            const name = document.getElementById('swal-name').value.trim();
            const model = document.getElementById('swal-model').value.trim();
            const job = document.getElementById('swal-job').value.trim();
            const cost = parseFloat(document.getElementById('swal-cost').value) || 0;
            const income = parseFloat(document.getElementById('swal-income').value) || 0;
            const status = document.getElementById('swal-status').value;

            if (!vrno || !name || !model || !job) {
                Swal.showValidationMessage('လိုအပ်သော အချက်အလက်များကို ဖြည့်စွက်ပေးပါ။');
                return false;
            }
            return { vrno, date, name, model, job, cost, income, status };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            let data = { ...result.value, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
            try {
                if(id) {
                    await db.collection("repairs").doc(id).update(data);
                    await logActivity("ဖုန်းပြင်မှတ်တမ်းပြင်ခြင်း", `${data.name} ၏ ${data.model} ပြင်ဆင်မှုစာရင်းကို ပြုပြင်လိုက်သည်။`);
                } else {
                    await db.collection("repairs").add(data);
                    await logActivity("ဖုန်းအပ်နှံမှုအသစ်", `${data.name} ၏ ${data.model} (${data.job}) ကို အပ်နှံစာရင်းသွင်းလိုက်သည်။`);
                }
                Swal.fire({ icon: 'success', title: 'သိမ်းဆည်းပြီးပါပြီ', showConfirmButton: false, timer: 1200 });
            } catch (e) {
                Swal.fire('အမှားအယွင်း', 'ဒေတာသိမ်းလို့မရပါ - ' + e.message, 'error');
            }
        }
    });
}

// 🔄 ပြင်ပြီး/လူနာလာယူပြီ အခြေအနေ တိုက်ရိုက်ပြောင်းလဲခြင်း လော့ဂျစ်
async function updateRepairStatus(id, newStatus, income = 0, cost = 0, name = '', model = '') {
    try {
        await db.collection("repairs").doc(id).update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        await logActivity("အခြေအနေပြောင်းလဲခြင်း", `${name} (${model}) ကို "${newStatus}" အဖြစ် ပြောင်းလဲလိုက်သည်။`);

        // လူနာလာယူပြီး အပ်နှံပြီး ဖြစ်သွားပါက Finance (ငွေစာရင်း) ထဲသို့ ဝင်ငွေ အလိုအလျောက် သွားပေါင်းမည်
        if (newStatus === "အပ်နှံပြီး" && income > 0) {
            let today = new Date().toISOString().split('T')[0];
            let profit = income - cost;
            await db.collection("finance").add({
                date: today,
                type: "ဝင်ငွေ",
                group: "Service",
                name: `ဖုန်းပြင်ခရငွေ: ${name} (${model})`,
                amount: income,
                cost: cost,
                profit: profit,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            Swal.fire({ icon: 'success', title: 'အပ်နှံမှု အောင်မြင်ပါသည်', text: `ငွေစာရင်းထဲသို့ +${income.toLocaleString()} Ks ဝင်ငွေအဖြစ် ထည့်သွင်းပြီးပါပြီ။`, timer: 2000 });
        } else {
            Swal.fire({ icon: 'success', title: 'အခြေအနေ အပ်ဒိတ်ဖြစ်သွားပါပြီ', showConfirmButton: false, timer: 1200 });
        }
    } catch (e) {
        Swal.fire('အမှားအယွင်း', 'ပြင်ဆင်၍မရပါ - ' + e.message, 'error');
    }
}

// 🗑️ ဖျက်ရမည့် လော့ဂျစ်
async function deleteRepair(id, name) {
    const res = await Swal.fire({
        title: 'သေချာပါသလား?',
        text: `"${name}" ၏ ဖုန်းပြင်မှတ်တမ်းကို အပြီးတိုင် ဖျက်ပစ်ပါမည်!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'ဖျက်မည်',
        cancelButtonText: 'မလုပ်တော့ပါ'
    });

    if (res.isConfirmed) {
        try {
            await db.collection("repairs").doc(id).delete();
            await logActivity("ဖုန်းပြင်မှတ်တမ်းဖျက်ခြင်း", `${name} ၏ စာရင်းကို ဖျက်ပစ်လိုက်သည်။`);
            Swal.fire('ဖျက်ပြီးပါပြီ', 'မှတ်တမ်းကို ဖျက်လိုက်ပါပြီ။', 'success');
        } catch (e) {
            Swal.fire('အမှားအယွင်း', 'ဖျက်လို့မရပါ - ' + e.message, 'error');
        }
    }
}
