function orderOnWhatsapp(){
  if(!cart.length){
    showToast("السلة فارغة، أضف منتجاً أولاً");
    return;
  }

  const items = cart.map(x => ({
    product: products.find(p => p.id === x.id),
    qty: x.qty
  })).filter(x => x.product);

  if(!items.length) return;

  const total = items.reduce((sum,x) => sum + x.product.price * x.qty, 0);
  const instaPay = "eslamkamal2792@instapay";

  // ملخص + فورم في نافذة واحدة
  const lines = items.map(x =>
    `• ${x.product.name} × ${x.qty} = ${money(x.product.price * x.qty)}`
  ).join("\n");

  const info =
    `الدفع عن طريق InstaPay\n\n` +
    `${lines}\n\n` +
    `الإجمالي: ${money(total)}\n\n` +
    `حوّل على: ${instaPay}\n` +
    `ثم املأ البيانات التالية:`;

  // استبدال الـ alert/prompts بفورم بسيط
  const name = prompt(info + "\n\nاكتب اسمك بالكامل:");
  if(!name?.trim()) return;

  let phone = prompt("اكتب رقم موبايلك (11 رقم يبدأ بـ 01):");
  phone = phone?.trim().replace(/[^\d]/g, "");
  if(!/^01\d{9}$/.test(phone || "")){
    showToast("رقم الموبايل غير صحيح");
    return;
  }

  const address = prompt("اكتب عنوان الاستلام:")?.trim();
  if(!address) return;

  const transaction = prompt("اكتب رقم العملية بعد التحويل:")?.trim();
  if(!transaction || transaction.length < 4){
    showToast("اكتب رقم عملية صحيح");
    return;
  }

  if(typeof WHATSAPP_NUMBER === "undefined" || !WHATSAPP_NUMBER){
    showToast("رقم الواتساب غير متوفر حالياً");
    return;
  }

  const message =
    `مرحباً مكتبة المهندس، أريد تأكيد طلبي:\n\n` +
    `${lines}\n\n` +
    `الإجمالي: ${money(total)}\n\n` +
    `طريقة الدفع: InstaPay\n` +
    `عنوان الدفع: ${instaPay}\n` +
    `رقم العملية: ${transaction}\n` +
    `اسم العميل: ${name.trim()}\n` +
    `رقم الهاتف: ${phone}\n` +
    `العنوان: ${address}\n\n` +
    `حالة الطلب: في انتظار مراجعة التحويل وتأكيده.`;

  const waNumber = String(WHATSAPP_NUMBER).replace(/[^\d]/g, "");
  window.open(
    `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}
