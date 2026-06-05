// inventory.js
let allProducts = [];
let currentFilter = 'အားလုံး';

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

// ... (showProductForm, sellOne, handleDelete code တွေက ယခင်ပေးထားတဲ့အတိုင်း ဒီဖိုင်ထဲမှာ ဆက်ရေးပါမယ်) ...
// နေရာမဆန့်မည်စိုးသဖြင့် Form လော့ဂျစ်များကို ချုံးထားပါသည်။ အပေါ်က JS များကို ယူထည့်နိုင်ပါသည်။
