<!-- حط ده قبل </body> -->
<div id="orderModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;align-items:center;justify-content:center;padding:15px">
  <div style="background:#fff;border-radius:12px;max-width:450px;width:100%;padding:20px;max-height:90vh;overflow:auto" dir="rtl">
    <h3 style="margin:0 0 10px">تأكيد الطلب - الدفع InstaPay</h3>
    <div id="orderSummary" style="background:#f8f9fa;border-radius:8px;padding:10px;font-size:14px;white-space:pre-line;margin-bottom:12px"></div>
    <input id="f_name" placeholder="اسمك بالكامل" style="width:100%;margin-bottom:8px;padding:10px;border:1px solid #ddd;border-radius:8px" />
    <input id="f_phone" placeholder="رقم الموبايل 01xxxxxxxxx" inputmode="numeric" maxlength="11" style="width:100%;margin-bottom:8px;padding:10px;border:1px solid #ddd;border-radius:8px" />
    <input id="f_address" placeholder="عنوان الاستلام" style="width:100%;margin-bottom:8px;padding:10px;border:1px solid #ddd;border-radius:8px" />
    <input id="f_trx" placeholder="رقم العملية بعد التحويل" style="width:100%;margin-bottom:12px;padding:10px;border:1px solid #ddd;border-radius:8px" />
    <div style="display:flex;gap:8px">
      <button onclick="submitOrderForm()" style="flex:1;background:#25D366;color:#fff;border:0;padding:12px;border-radius:8px;font-weight:bold">تأكيد عبر واتساب</button>
      <button onclick="document.getElementById('orderModal').style.display='none'" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;background:#fff">إلغاء</button>
    </div>
  </div>
</div>
