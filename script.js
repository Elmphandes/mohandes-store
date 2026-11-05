// بيانات المنتجات التجريبية: عدّل الأسماء والأسعار والصور التعبيرية كما تريد.
const products = [
  {id:1,name:" الوان طباعة",category:"طباعة",price:5,emoji:"📘",tag:"الأكثر طلباً"},
  {id:1,name:" اسود طباعة",category:"طباعة",price:1,emoji:"📘",tag:"الأكثر طلباً"},
  {id:1,name:" نكعيب",category:"طباعة",price:25,emoji:"📘",tag:"الأكثر طلباً"},
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

// ضع رقم واتساب المكتبة بصيغة دولية بدون + أو مسافات، مثال مصر: 201xxxxxxxxx
const WHATSAPP_NUMBER = "201122273609";
const INSTAPAY_ADDRESS = "eslamkamal2792@instapay";

let cart = [];
try { cart = JSON.parse(localStorage.getItem("mohandesCart") || "[]"); } catch(e){ cart = []; }
let activeCategory = "الكل";
let searchTerm = "";
let pendingOrder = null;

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
function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++; else cart.push({id,qty:1});
  saveCart(); showToast("تمت إضافة المنتج إلى السلة");
}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id); if(!item)return;
  item.qty+=delta; if(item.qty<=0) cart=cart.filter(x=>x.id!==id);
  saveCart();
}
function removeItem(id){cart=cart.filter(x=>x.id!==id);saveCart();}
function renderCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById("cartCount").textContent=count;
  const items=cart.map(x=>({...products.find(p=>p.id===x.id),qty:x.qty})).filter(x=>x.id);
  const total=items.reduce((s,x)=>s+x.price*x.qty,0);
  document.getElementById("cartTotal").textContent=money(total);
  document.getElementById("cartItems").innerHTML=items.length ? items.map(p=>`
    <div class="cart-row"><div class="cart-thumb">${p.emoji}</div><div><h4>${p.name}</h4><small>${money(p.price)} للقطعة</small>
      <div class="quantity"><button onclick="changeQty(${p.id},-1)" aria-label="تقليل">−</button><b>${p.qty}</b><button onclick="changeQty(${p.id},1)" aria-label="زيادة">+</button></div></div>
      <button class="remove" onclick="removeItem(${p.id})">حذف</button></div>`).join("") : '<div class="cart-empty">🛒<br><br>السلة فارغة حالياً<br>أضف بعض المنتجات لتظهر هنا.</div>';
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false");}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true");}
function showToast(message){
  const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}

// --- الطلب عبر فورم واحد بدل prompt ---
function orderOnWhatsapp(){
  if(!cart.length){ showToast("السلة فارغة، أضف منتجاً أولاً"); return; }

  const items = cart.map(x => ({
    product: products.find(p => p.id === x.id),
    qty: x.qty
  })).filter(x => x.product);

  if(!items.length) return;

  if(typeof WHATSAPP_NUMBER === "undefined" || !WHATSAPP_NUMBER){
    showToast("رقم الواتساب غير متوفر حالياً");
    return;
  }

  const total = items.reduce((sum,x) => sum + x.product.price * x.qty, 0);
  const lines = items.map(x =>
    `• ${x.product.name} × ${x.qty} = ${money(x.product.price * x.qty)}`
  ).join("\n");

  pendingOrder = { total, lines };

  document.getElementById("orderSummary").textContent =
    `${lines}\n\nالإجمالي: ${money(total)}\n\nحوّل على InstaPay:\n${INSTAPAY_ADDRESS}\nثم املأ البيانات التالية:`;

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
  if(!transaction || transaction.length < 4){ showToast("اكتب رقم عملية صحيح"); return; }

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
