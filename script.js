// بيانات المنتجات التجريبية: عدّل الأسماء والأسعار والصور التعبيرية كما تريد.
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

// ضع رقم واتساب المكتبة بصيغة دولية بدون + أو مسافات، مثال مصر: 201xxxxxxxxx
const WHATSAPP_NUMBER = "201122273609";

let cart = JSON.parse(localStorage.getItem("mohandesCart") || "[]");
let activeCategory = "الكل";
let searchTerm = "";

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
function orderOnWhatsapp(){
  if(!cart.length){showToast("السلة فارغة، أضف منتجاً أولاً");return;}
  const lines=cart.map(x=>{const p=products.find(y=>y.id===x.id);return `• ${p.name} × ${x.qty} = ${money(p.price*x.qty)}`;});
  const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);
  const message=`مرحباً مكتبة المهندس، أريد طلب المنتجات التالية:\n${lines.join("\n")}\n\nالإجمالي المبدئي: ${money(total)}\nالاسم:\nالعنوان:\nرقم الهاتف:`;
  if(WHATSAPP_NUMBER==="201000000000"){showToast("عدّل رقم واتساب المكتبة داخل ملف script.js أولاً");return;}
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank");
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
document.getElementById("contactWhatsapp").addEventListener("click",e=>{
  if(WHATSAPP_NUMBER==="201000000000"){e.preventDefault();showToast("عدّل رقم واتساب المكتبة داخل ملف script.js أولاً");}
  else e.currentTarget.href=`https://wa.me/${WHATSAPP_NUMBER}`;
});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();
