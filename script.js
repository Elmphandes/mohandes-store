// بيانات المنتجات التجريبية
const products = [
  {id:1,name:"أساسيات الهندسة المدنية",category:"كتب ومراجع",price:180,emoji:"📘",tag:"الأكثر طلباً"},
  {id:2,name:"الرسم الهندسي والإسقاط",category:"كتب ومراجع",price:145,emoji:"📗",tag:""},
  {id:3,name:"آلة حاسبة علمية",category:"أدوات هندسية",price:320,emoji:"🧮",tag:""},
  {id:4,name:"طقم أدوات رسم هندسي",category:"أدوات هندسية",price:95,emoji:"📐",tag:""},
  {id:5,name:"دفتر محاضرات 200 ورقة",category:"أدوات مكتبية",price:65,emoji:"📓",tag:""},
  {id:6,name:"مجموعة أقلام جاف",category:"أدوات مكتبية",price:35,emoji:"🖊️",tag:""},
  {id:7,name:"ملزمة رياضيات تطبيقية",category:"مستلزمات دراسية",price:75,emoji:"📒",tag:"جديد"},
  {id:8,name:"شنطة أدوات دراسية",category:"مستلزمات دراسية",price:210,emoji:"🎒",tag:""},
  {id:9,name:"مسطرة هندسية معدنية",category:"أدوات هندسية",price:55,emoji:"📏",tag:""},
  {id:10,name:"مرجع ميكانيكا هندسية",category:"كتب ومراجع",price:220,emoji:"📙",tag:""},
  {id:11,name:"ملف حفظ أوراق",category:"أدوات مكتبية",price:28,emoji:"🗂️",tag:""},
  {id:12,name:"كشكول سلك فاخر",category:"مستلزمات دراسية",price:48,emoji:"📔",tag:""}
];

const WHATSAPP_NUMBER = "201122273609";
const INSTAPAY_ADDRESS = "eslamkamal2792@instapay";

let cart = [];
try { cart = JSON.parse(localStorage.getItem("mohandesCart") || "[]"); } catch(e){ cart = []; }
let activeCategory = "الكل";
let searchTerm = "";
let pendingOrder = null;

// متغيرات خاصة بخدمة الطباعة
let currentPrintFile = null;
let filePages = 0;

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const money = value => new Intl.NumberFormat("ar-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(value);

function renderProducts(){
  const shown = products.filter(p =>
    (activeCategory === "الكل" || p.category === activeCategory) &&
    (p.name + " " + p.category).toLowerCase().includes(searchTerm.toLowerCase())
  );
  productGrid.innerHTML = shown.map(p => `
    <article class="product-card">
      <div class="product-visual"><span class="product-emoji">${p.emoji}</span>${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}</div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3>
        <div class="product-bottom"><strong class="price">${money(p.price)}</strong>
          <button class="add-btn" onclick="addToCart(${p.id})">+ أضف للسلة</button>
        </div>
      </div>
    </article>`).join("");
  document.getElementById("resultCount").textContent = `${shown.length} منتج`;
  document.getElementById("emptyState").hidden = shown.length !== 0;
}

function saveCart(){ localStorage.setItem("mohandesCart",JSON.stringify(cart)); renderCart(); }

function addToCart(id, customItem = null){
  if(customItem) {
    cart.push(customItem);
  } else {
    const item = cart.find(x=>x.id===id);
    if(item) item.qty++; else cart.push({id,qty:1});
  }
  saveCart(); showToast("تمت إضافة العنصر إلى السلة");
}

function changeQty(index,delta){
  if(typeof index === 'string' && index.startsWith('print_')) {
    const item = cart.find(x => x.cartId === index);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0) cart = cart.filter(x => x.cartId !== index);
  } else {
    const item = cart.find(x => x.id === index);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0) cart = cart.filter(x => x.id !== index);
  }
  saveCart();
}

function removeItem(index){
  if(typeof index === 'string' && index.startsWith('print_')) {
    cart = cart.filter(x => x.cartId !== index);
  } else {
    cart = cart.filter(x => x.id !== index);
  }
  saveCart();
}

function renderCart(){
  const count = cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById("cartCount").textContent = count;
  
  let total = 0;
  const itemsHtml = cart.map(x => {
    if(x.isPrint) {
      let itemTotal = x.price * x.qty;
      total += itemTotal;
      return `
        <div class="cart-row">
          <div class="cart-thumb">🖨️</div>
          <div>
            <h4>طباعة: ${x.fileName}</h4>
            <small>${x.colorText} - ${x.sidesText} (${x.sheets} ورقة) - ${money(x.price)} للنسخة</small>
            <div class="quantity">
              <button onclick="changeQty('${x.cartId}',-1)" aria-label="تقليل">−</button>
              <b>${x.qty}</b>
              <button onclick="changeQty('${x.cartId}',1)" aria-label="زيادة">+</button>
            </div>
          </div>
          <button class="remove" onclick="removeItem('${x.cartId}')">حذف</button>
        </div>`;
    } else {
      const p = products.find(prod => prod.id === x.id);
      if(!p) return '';
      let itemTotal = p.price * x.qty;
      total += itemTotal;
      return `
        <div class="cart-row">
          <div class="cart-thumb">${p.emoji}</div>
          <div>
            <h4>${p.name}</h4>
            <small>${money(p.price)} للقطعة</small>
            <div class="quantity">
              <button onclick="changeQty(${p.id},-1)" aria-label="تقليل">−</button>
              <b>${x.qty}</b>
              <button onclick="changeQty(${p.id},1)" aria-label="زيادة">+</button>
            </div>
          </div>
          <button class="remove" onclick="removeItem(${p.id})">حذف</button>
        </div>`;
    }
  }).join("");

  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("cartItems").innerHTML = itemsHtml.length ? itemsHtml : '<div class="cart-empty">🛒<br><br>السلة فارغة حالياً<br>أضف بعض المنتجات لتظهر هنا.</div>';
}

function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false");}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true");}
function showToast(message){
  const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}

// --- معالجة وحساب ملفات الطباعة ---
const printFileInput = document.getElementById("printFile");
const dropZone = document.getElementById("dropZone");

printFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  await handleSelectedFile(file);
});

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.borderColor = "var(--blue)"; });
dropZone.addEventListener("dragleave", () => { dropZone.style.borderColor = "#cbd5e1"; });
dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#cbd5e1";
  const file = e.dataTransfer.files[0];
  if(file) {
    await handleSelectedFile(file);
  }
});

async function handleSelectedFile(file) {
  currentPrintFile = file;
  document.getElementById("fileName").textContent = file.name;
  
  if(file.type === "application/pdf" || file.name.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      filePages = pdfDoc.numPages;
    } catch(err) {
      filePages = 1;
      showToast("تعذر قراءة عدد صفحات الـ PDF بدقة، تم افتراض صفحة واحدة");
    }
  } else {
    filePages = 1;
  }

  document.getElementById("filePagesCount").textContent = `${filePages} صفحة`;
  document.getElementById("printOptions").style.display = "block";
  calculatePrintCost();
}

function getPrintPages(){const m=document.getElementById("moh-pages");if(m&&+m.value>0)return +m.value;return filePages||1;}
function getPrintCopies(){return parseInt(document.getElementById("printCopies").value)||1;}
function calculatePrintCost() {
  const colorType = document.getElementById("printColorType").value;
  const sides = document.getElementById("printSides").value;
  const copies = getPrintCopies();
  const pages = getPrintPages();
  const paper = document.getElementById("moh-paper")?.value||"A4";
  const bind = document.getElementById("moh-bind")?.value||"none";
  let s1 = sides==="double"?Math.ceil(pages/2):pages;
  let per = (colorType==="color"?3:1)*(paper==="A3"?2:1);
  let bf = {none:0,staple:5,spiral:15,lux:25}[bind]||0;
  let total = s1*per*copies+bf*copies;
  document.getElementById("calcSheets").textContent = s1*copies;
  document.getElementById("calcTotal").textContent = money(total);
  const d=document.getElementById("moh-bd");
  if(d){const cn=colorType==="color"?"ملون":"أبيض وأسود",sn=sides==="double"?"وجهين":"وجه واحد",bn={none:"بدون تجليد",staple:"دبوس",spiral:"سلك",lux:"فاخر"}[bind];
  d.innerHTML="الصفحات: <b>"+pages+"</b> - الورق/نسخة: <b>"+s1+"</b> ("+sn+")<br>سعر الورقة: <b>"+per+" ج</b> ("+cn+(paper==="A3"?"+A3":"")+") + "+bn+" ("+bf+" ج)<br>الإجمالي لـ <b>"+copies+"</b> نسخة: <b style=color:#b57a1e>"+money(total)+"</b>";}
  return {pages,s1,per,bf,copies,total};
}

document.getElementById("printColorType").addEventListener("change", calculatePrintCost);
document.getElementById("printSides").addEventListener("change", calculatePrintCost);
document.getElementById("printCopies").addEventListener("input", calculatePrintCost);
["moh-paper","moh-bind","moh-pages"].forEach(id=>{const el=document.getElementById(id);if(el){el.addEventListener("input",()=>setTimeout(calculatePrintCost,30));el.addEventListener("change",()=>setTimeout(calculatePrintCost,30));}});
setInterval(()=>{const t=document.getElementById("filePagesCount")?.textContent||"";const n=parseInt(t)||0;const m=document.getElementById("moh-pages");if(n>0&&m&&m.dataset.a!==t){m.value=n;m.dataset.a=t;}},900);

document.getElementById("addPrintToCartBtn").addEventListener("click", () => {
  if(!currentPrintFile) return;
  const colorType = document.getElementById("printColorType").value;
  const sides = document.getElementById("printSides").value;
  const copies = parseInt(document.getElementById("printCopies").value) || 1;
  
  let pagesNow = (document.getElementById("moh-pages")&&+document.getElementById("moh-pages").value>0)?+document.getElementById("moh-pages").value:filePages;
  let sheets = sides === "double" ? Math.ceil(pagesNow / 2) : pagesNow;
  let paperV = document.getElementById("moh-paper")?.value||"A4";
  let bindV = document.getElementById("moh-bind")?.value||"none";
  let pricePerSheet = (colorType === "color" ? 3 : 1)*(paperV==="A3"?2:1);
  let bindFee={none:0,staple:5,spiral:15,lux:25}[bindV]||0;
  let itemPrice = sheets * pricePerSheet + bindFee;

  const colorText = colorType === "color" ? "طباعة ملونة" : "أبيض وأسود";
  const sidesText = sides === "double" ? "وجهين" : "وجه واحد";

  const printItem = {
    cartId: 'print_' + Date.now(),
    isPrint: true,
    fileName: currentPrintFile.name,
    fileSize: currentPrintFile.size,
    pages: filePages,
    sheets: sheets * copies,
    colorText: colorText+(paperV==="A3"?" + A3":"")+" + "+({none:"بدون تجليد",staple:"دبوس",spiral:"سلك",lux:"فاخر"}[bindV]),
    sidesText,
    price: itemPrice,
    qty: copies
  };

  addToCart(null, printItem);
  openCart();
});

// --- الطلب عبر واتساب ---
function orderOnWhatsapp(){
  if(!cart.length){ showToast("السلة فارغة، أضف منتجاً أو خدمة طباعة أولاً"); return; }

  const itemsLines = cart.map(x => {
    if(x.isPrint) {
      return `• طباعة ملف: ${x.fileName}\n  (${x.colorText} - ${x.sidesText} - عدد النسخ: ${x.qty}) = ${money(x.price * x.qty)}`;
    } else {
      const p = products.find(prod => prod.id === x.id);
      return `• ${p.name} × ${x.qty} = ${money(p.price * x.qty)}`;
    }
  }).join("\n");

  if(typeof WHATSAPP_NUMBER === "undefined" || !WHATSAPP_NUMBER){
    showToast("رقم الواتساب غير متوفر حالياً");
    return;
  }

  const total = cart.reduce((sum, x) => {
    if(x.isPrint) return sum + (x.price * x.qty);
    const p = products.find(prod => prod.id === x.id);
    return sum + (p ? p.price * x.qty : 0);
  }, 0);

  pendingOrder = { total, lines: itemsLines };

  document.getElementById("orderSummary").textContent =
    `${itemsLines}\n\nالإجمالي: ${money(total)}\n\nحوّل على InstaPay:\n${INSTAPAY_ADDRESS}\nثم املأ البيانات التالية:`;

  document.getElementById("orderModal").classList.add("show");
}

function closeOrderModal(){
  document.getElementById("orderModal").classList.remove("show");
  pendingOrder = null;
}

function submitOrderForm(){
  if(!pendingOrder) return;
  const { total, lines } = pendingOrder;

  const name = document.getElementById("f_name").value.trim();
  let phone = document.getElementById("f_phone").value.trim().replace(/[^\d]/g, "");
  const address = document.getElementById("f_address").value.trim();
  const transaction = document.getElementById("f_trx").value.trim();

  if(!name){ showToast("اكتب اسمك بالكامل"); return; }
  if(!/^01\d{9}$/.test(phone)){ showToast("رقم الموبايل غير صحيح"); return; }
  if(!address){ showToast("اكتب عنوان الاستلام"); return; }
  if(!transaction || transaction.length < 4){ showToast("رقم العملية غير صحيح"); return; }

  const message =
    `مرحباً مكتبة المهندس، أريد تأكيد طلبي:\n\n` +
    `${lines}\n\n` +
    `الإجمالي: ${money(total)}\n\n` +
    `طريقة الدفع: InstaPay\n` +
    `عنوان الدفع: ${INSTAPAY_ADDRESS}\n` +
    `رقم العملية: ${transaction}\n` +
    `اسم العميل: ${name}\n` +
    `رقم الهاتف: ${phone}\n` +
    `العنوان: ${address}\n\n` +
    `ملاحظة: بالنسبة للملفات المطلوبة للطباعة، يرجى إرسالها في محادثة الواتساب هنا بعد تأكيد الطلب.\n` +
    `حالة الطلب: في انتظار مراجعة التحويل وتأكيده.`;

  const waNumber = String(WHATSAPP_NUMBER).replace(/[^\d]/g, "");
  closeOrderModal();
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

document.getElementById("filters").addEventListener("click",e=>{
  const btn=e.target.closest(".filter");if(!btn)return;
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");activeCategory=btn.dataset.category;renderProducts();
});
document.getElementById("searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=document.getElementById("searchInput").value.trim();renderProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"});});
document.getElementById("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim();renderProducts();});
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.getElementById("checkoutBtn").addEventListener("click",orderOnWhatsapp);
document.getElementById("orderClose").addEventListener("click",closeOrderModal);
document.getElementById("orderModal").addEventListener("click",e=>{ if(e.target.id==="orderModal") closeOrderModal(); });
document.getElementById("orderSubmit").addEventListener("click",submitOrderForm);
document.getElementById("contactWhatsapp").addEventListener("click",e=>{
  if(WHATSAPP_NUMBER==="201000000000"){e.preventDefault();showToast("عدّل رقم واتساب المكتبة داخل ملف script.js أولاً");}
  else e.currentTarget.href=`https://wa.me/${WHATSAPP_NUMBER}`;
});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();