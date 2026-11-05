function orderOnWhatsapp(){
  if(!cart.length){
    showToast("السلة فارغة، أضف منتجاً أولاً");
    return;
  }

  const items = cart.map(x => ({
    product: products.find(p => p.id === x.id),
    qty: x.qty
  })).filter(x => x.product);

  const total = items.reduce(
    (sum,x) => sum + x.product.price * x.qty, 0
  );

  const instaPay = "eslamkamal2792@instapay";

  alert(
    "الدفع عن طريق InstaPay\n\n" +
    "إجمالي الطلب: " + money(total) + "\n\n" +
    "عنوان الدفع:\n" + instaPay + "\n\n" +
    "حوّل المبلغ المطلوب، ثم اضغط موافق لإكمال بيانات الطلب."
  );

  const name = prompt("اكتب اسمك بالكامل:");
  if(!name || !name.trim()) return;

  const phone = prompt("اكتب رقم موبايلك:");
  if(!phone || !phone.trim()) return;

  const address = prompt("اكتب عنوان الاستلام:");
  if(!address || !address.trim()) return;

  const transaction = prompt("اكتب رقم العملية بعد التحويل:");
  if(!transaction || !transaction.trim()) return;

  const lines = items.map(x =>
    "• " + x.product.name +
    " × " + x.qty +
    " = " + money(x.product.price * x.qty)
  );

  const message =
    "مرحباً مكتبة المهندس، أريد تأكيد طلبي:\n\n" +
    lines.join("\n") +
    "\n\nالإجمالي: " + money(total) +
    "\n\nطريقة الدفع: InstaPay" +
    "\nعنوان الدفع: " + instaPay +
    "\nرقم العملية: " + transaction +
    "\nاسم العميل: " + name +
    "\nرقم الهاتف: " + phone +
    "\nالعنوان: " + address +
    "\n\nحالة الطلب: في انتظار مراجعة التحويل وتأكيده.";

  window.open(
    "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(message),
    "_blank"
  );
}
