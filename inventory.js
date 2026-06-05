// inventory.js
let allProducts = [];
let currentFilter = 'အားလုံး';

// စာမျက်နှာ စဖွင့်တာနဲ့ ပစ္စည်းစာရင်းကို Firebase ကနေ ဆွဲယူမည်
function initPage() {
    fetchProducts();
}

function fetchProducts() {
    db.collection("products").orderBy("updatedAt", "desc").onSnapshot((snap) => {
        allProducts = [];
        snap.forEach((doc) => { allProducts.push({ id: doc.id, ...doc.data() }); });
        renderProducts();
    });
}

// အမျိုးအစားအလိုက် Filter Chip နှိပ်ရင် အလုပ်လုပ်မည့်အပိုင်း
function setFilter(cat, btnElement) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'border-transparent');
        btn.classList.add('bg-white', 'border-slate-200');
        if(btn.innerText.includes('ရောင်းပြီး')) btn.classList.add('text-rose-500');
        else btn.classList.add('text-slate-500');
    });
    
    btnElement.classList.remove('bg-white', 'text-slate-500', 'text-rose-500', 'border-slate-200');
    btnElement.classList.add('bg-indigo-600', 'text-white', 'border-transparent');
    renderProducts();
}

// HTML ပေါ်မှာ Card လေးတွေ ပေါ်အောင်ဆွဲပေးမည့်အပိုင်း
function renderProducts() {
    const list = document.getElementById("productList");
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let filteredHTML = "";
    let t=0, g=0, h=0, a=0, s=0, totalValue=0, totalQty=0;

    allProducts.forEach((d) => {
        const amt = Number(d.amount || 0);
        const prc = Number(d.price || 0);
        const cost = Number(d.costPrice || 0);
        
        if(d.status !== "ရောင်းပြီး") {
            t++; totalValue += (amt * cost); totalQty += amt;
            if(d.category === "အထွေထွေ") g += amt;
            if(d.category === "Hardwareအပိုပစ္စည်") h += amt;
            if(d.category === "accessories") a += amt;
        } else { s += amt; }

        let show = false;
        if(searchTerm !== "") show = d.name.toLowerCase().includes(searchTerm);
        else {
            if(currentFilter === 'အားလုံး' && d.status !== "ရောင်းပြီး") show = true;
            else if(currentFilter === d.category && d.status !== "ရောင်းပြီး") show = true;
            else if(currentFilter === 'ရောင်းပြီး' && d.status === "ရောင်းပြီး") show = true;
        }

        if(show) {
            let badgeClass = d.status === "ရောင်းပြီး" ? "bg-rose-100 text-rose-700 border-rose-200" : 
                            (d.status === "ပြင်ဆင်ရန်" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200");
            let safeName = d.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

            filteredHTML += `
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-sm font-bold text-slate-800 leading-tight pr-2">${d.name}</h3>
                        <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold border whitespace-nowrap ${badgeClass}">${d.status}</span>
                    </div>
                    <div class="flex gap-4 text-xs mt-3">
                        <div class="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">အုပ်စု</p><p class="font-bold text-slate-600 truncate">${d.category}</p></div>
                        <div class="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">လက်ကျန် (ခုရေ)</p><p class="font-black text-indigo-600">${amt}</p></div>
                    </div>
                    <div class="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-slate-200">
                        <div class="text-xs">
                            <p class="text-[10px] text-slate-400 font-bold mb-0.5">အရင်း / ရောင်းဈေး</p>
                            <p class="font-bold text-slate-700"><span class="text-slate-400">${cost.toLocaleString()}</span> / <span class="text-emerald-600">${prc.toLocaleString()} Ks</span></p>
                        </div>
                        <div class="flex gap-1.5">
                            ${d.status !== 'ရောင်းပြီး' && amt > 0 ? `<button onclick="sellOne('${d.id}', '${safeName}', ${amt}, ${prc}, ${cost}, '${d.category}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">ရောင်းမည်</button>` : ''}
                            <button onclick="showProductForm('${d.id}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">ပြင်မည်</button>
                            <button onclick="handleDelete('${d.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-100">ဖျက်မည်</button>
                        </div>
                    </div>
                </div>`;
        }
    });

    list.innerHTML = filteredHTML || `<div class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300"><p class="text-xs font-bold text-slate-400">ပစ္စည်းမရှိပါ</p></div>`;
    
    document.getElementById("totalAssetValue").innerText = `${totalValue.toLocaleString()} Ks`;
    document.getElementById("totalStockCount").innerText = `${totalQty.toLocaleString()} ခု`;
    document.getElementById("count-all").innerText = t; document.getElementById("count-gen").innerText = g;
    document.getElementById("count-hw").innerText = h; document.getElementById("count-acc").innerText = a;
    document.getElementById("count-sold").innerText = s;
}

// ➕ ပစ္စည်းအသစ်ထည့်ရန် / ပြင်ဆင်ရန် Popup Form လော့ဂျစ်
function showProductForm(id = null) {
    let p = id ? allProducts.find(x => x.id === id) : { name:'', category:'အထွေထွေ', amount:1, price:'', costPrice:'', status:'အဆင်သင့်' };
    
    Swal.fire({
        title: id ? '📝 ပစ္စည်းစာရင်း ပြင်ဆင်ရန်' : '➕ ပစ္စည်းအသစ် ထည့်သွင်းရန်',
        html: `
            <div class="text-left p-1">
                <label class="swal-form-label">ပစ္စည်းအမည်</label>
                <input id="swal-name" class="swal-form-input" value="${p.name}" placeholder="ဥပမာ - Redmi Note 8 Pro Touch">
                
                <label class="swal-form-label">အုပ်စုအမျိုးအစား</label>
                <select id="swal-cat" class="swal-form-input">
                    <option value="အထွေထွေ" ${p.category==='အထွေထွေ'?'selected':''}>အထွေထွေ</option>
                    <option value="Hardwareအပိုပစ္စည်" ${p.category==='Hardwareအပိုပစ္စည်'?'selected':''}>Hardware အပိုပစ္စည်း</option>
                    <option value="accessories" ${p.category==='accessories'?'selected':''}>Accessories</option>
                </select>

                <div style="display: flex; gap: 10px;">
                    <div style="flex:1;">
                        <label class="swal-form-label">အရေအတွက်</label>
                        <input id="swal-amt" type="number" class="swal-form-input" value="${p.amount}">
                    </div>
                    <div style="flex:1;">
                        <label class="swal-form-label">အခြေအနေ</label>
                        <select id="swal-status" class="swal-form-input">
                            <option value="အဆင်သင့်" ${p.status==='အဆင်သင့်'?'selected':''}>အဆင်သင့်</option>
                            <option value="ပြင်ဆင်ရန်" ${p.status==='ပြင်ဆင်ရန်'?'selected':''}>ပြင်ဆင်ရန်</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <div style="flex:1;">
                        <label class="swal-form-label">ရင်းစျေး (Ks)</label>
                        <input id="swal-cost" type="number" class="swal-form-input" value="${p.costPrice}" placeholder="0">
                    </div>
                    <div style="flex:1;">
                        <label class="swal-form-label">ရောင်းစျေး (Ks)</label>
                        <input id="swal-price" type="number" class="swal-form-input" value="${p.price}" placeholder="0">
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'သိမ်းဆည်းမည်',
        cancelButtonText: 'မလုပ်တော့ပါ',
        confirmButtonColor: '#4f46e5',
        preConfirm: () => {
            const name = document.getElementById('swal-name').value.trim();
            const category = document.getElementById('swal-cat').value;
            const amount = parseInt(document.getElementById('swal-amt').value) || 0;
            const status = document.getElementById('swal-status').value;
            const costPrice = parseFloat(document.getElementById('swal-cost').value) || 0;
            const price = parseFloat(document.getElementById('swal-price').value) || 0;

            if (!name || amount <= 0 || price <= 0 || costPrice <= 0) {
                Swal.showValidationMessage('အချက်အလက်များကို ပြည့်စုံမှန်ကန်စွာ ဖြည့်စွက်ပေးပါ။');
                return false;
            }
            return { name, category, amount, status, costPrice, price };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            let data = { ...result.value, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
            try {
                if(id) {
                    await db.collection("products").doc(id).update(data);
                    await logActivity("ပြင်ဆင်ခြင်း", `${data.name} ကို ပြုပြင်မွမ်းမံလိုက်သည်။`);
                } else {
                    await db.collection("products").add(data);
                    await logActivity("ပစ္စည်းအသစ်ထည့်ခြင်း", `${data.name} (${data.amount} ခု) စာရင်းသွင်းလိုက်သည်။`);
                }
                Swal.fire({ icon: 'success', title: 'သိမ်းဆည်းပြီးပါပြီ', showConfirmButton: false, timer: 1200 });
            } catch (e) {
                Swal.fire('အမှားအယွင်း', 'ဒေတာသိမ်းလို့မရပါ - ' + e.message, 'error');
            }
        }
    });
}

// 💰 ရောင်းမည် ခလုတ်နှိပ်လျှင် အလုပ်လုပ်မည့်အပိုင်း
async function sellOne(id, name, currentAmt, price, costPrice, category) {
    const { value: qty } = await Swal.fire({
        title: '🛍️ ပစ္စည်းရောင်းချခြင်း',
        text: `"${name}" ကို အရေအတွက် မည်မျှ ရောင်းချမည်လဲ? (လက်ကျန်: ${currentAmt} ခု)`,
        input: 'number',
        inputValue: 1,
        showCancelButton: true,
        inputValidator: (value) => {
            let v = parseInt(value);
            if (!v || v <= 0) return 'အရေအတွက် မှန်ကန်စွာ ဖြည့်ပါ။';
            if (v > currentAmt) return 'လက်ကျန်ထက် ကျော်လွန်ရောင်းချ၍ မရပါ။';
        }
    });

    if (qty) {
        const sellQty = parseInt(qty);
        const totalIncome = sellQty * price;
        const totalCost = sellQty * costPrice;
        const netProfit = totalIncome - totalCost;
        const newAmt = currentAmt - sellQty;

        try {
            // ၁။ ပစ္စည်းရဲ့ လက်ကျန် အရေအတွက်ကို လျှော့ချမည်
            if(newAmt === 0) {
                // အကုန်ရောင်းပြီးသွားရင် Status ကိုပါ "ရောင်းပြီး" ပြောင်းမည်
                await db.collection("products").doc(id).update({ amount: 0, status: "ရောင်းပြီး", updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            } else {
                await db.collection("products").doc(id).update({ amount: newAmt, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            }

            // ၂။ ငွေစာရင်း (Finance) စနစ်ထဲသို့ ဝင်ငွေအဖြစ် အလိုအလျောက် သွားပေါင်းထည့်ပေးမည်
            let today = new Date().toISOString().split('T')[0];
            await db.collection("finance").add({
                date: today,
                type: "ဝင်ငွေ",
                group: "Sales",
                name: `ရောင်းရငွေ: ${name} (${sellQty}ခု)`,
                amount: totalIncome,
                cost: totalCost,
                profit: netProfit,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // ၃။ လုပ်ဆောင်ချက် မှတ်တမ်း (Log) သွင်းမည်
            await logActivity("ပစ္စည်းရောင်းရခြင်း", `${name} (${sellQty} ခု) ကို ${totalIncome.toLocaleString()} Ks ဖြင့် ရောင်းချခဲ့သည်။`);

            Swal.fire({ icon: 'success', title: 'ရောင်းချမှု အောင်မြင်ပါသည်', text: `ငွေစာရင်းထဲသို့ +${totalIncome.toLocaleString()} Ks ထည့်သွင်းပြီးပါပြီ။`, timer: 2000 });
        } catch (e) {
            Swal.fire('အမှားအယွင်း', 'အရောင်းမှတ်တမ်း မအောင်မြင်ပါ - ' + e.message, 'error');
        }
    }
}

// 🗑️ ဖျက်မည် ခလုတ်နှိပ်လျှင် အလုပ်လုပ်မည့်အပိုင်း
async function handleDelete(id) {
    const res = await Swal.fire({
        title: 'ပစ္စည်းဖျက်မှာ သေချာလား?',
        text: "ဤပစ္စည်းကို စာရင်းထဲမှ အပြီးတိုင် ဖျက်ပစ်ပါမည်!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'သေချာတယ် ဖျက်မယ်',
        cancelButtonText: 'မဖျက်တော့ပါ'
    });

    if (res.isConfirmed) {
        try {
            const doc = await db.collection("products").doc(id).get();
            if(doc.exists) {
                const pName = doc.data().name;
                await db.collection("products").doc(id).delete();
                await logActivity("စာရင်းဖျက်ခြင်း", `${pName} ကို စာရင်းထဲမှ ဖျက်ပစ်လိုက်သည်။`);
                Swal.fire('ဖျက်ပြီးပါပြီ', 'ပစ္စည်းစာရင်းကို ဖျက်လိုက်ပါပြီ။', 'success');
            }
        } catch (e) {
            Swal.fire('အမှားအယွင်း', 'ဖျက်လို့မရပါ - ' + e.message, 'error');
        }
    }
}
