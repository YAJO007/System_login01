// ตัวอย่างข้อมูลสินค้า (เอาไปเปลี่ยนเป็นดึงจากฐานข้อมูลทีหลังได้)
const PRODUCTS = [
  {
    id: 1,
    title: "GTA V Premium Edition",
    platform: "Steam",
    type: "full",
    price: 299,
    stock: 5,
    note: "รหัส Redeem บน Steam โซน SEA / TH ใช้ได้ครั้งเดียว",
  },
  {
    id: 2,
    title: "Minecraft Java Edition",
    platform: "Microsoft",
    type: "full",
    price: 690,
    stock: 3,
    note: "บัญชีแท้ Mojang/Microsoft (โปรดระวัง TOS การขายบัญชีจริง)",
  },
  {
    id: 3,
    title: "Steam Wallet Code 300 THB",
    platform: "Steam",
    type: "topup",
    price: 315,
    stock: 12,
    note: "โค้ดเติมเงิน Steam Wallet ประเทศไทยมูลค่า 300 บาท",
  },
  {
    id: 4,
    title: "Valorant Points 625 VP",
    platform: "Mobile",
    type: "topup",
    price: 189,
    stock: 8,
    note: "โค้ดเติม VP ใน Riot Account (ตรวจสอบ Region ให้ตรงก่อนซื้อ)",
  },
  {
    id: 5,
    title: "Elden Ring Deluxe DLC Pack",
    platform: "Steam",
    type: "dlc",
    price: 450,
    stock: 4,
    note: "DLC เสริม ต้องมีตัวเกมหลักในไลบรารีก่อนถึงจะใช้ได้",
  },
  {
    id: 6,
    title: "Fortnite V-Bucks 1000",
    platform: "Epic",
    type: "topup",
    price: 320,
    stock: 10,
    note: "โค้ดเติม V-Bucks ใช้ได้กับบัญชี Epic ที่ Region TH/SEA",
  },
];

const productsListEl = document.getElementById("productsList");
const productCountEl = document.getElementById("product-count");
const searchInputEl = document.getElementById("searchInput");
const platformFilterEl = document.getElementById("platformFilter");
const tagEls = document.querySelectorAll(".tag");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalPlatform = document.getElementById("modalPlatform");
const modalType = document.getElementById("modalType");
const modalStock = document.getElementById("modalStock");
const modalNote = document.getElementById("modalNote");
const modalCopyBtn = document.getElementById("modalCopyBtn");
const modalChatBtn = document.getElementById("modalChatBtn");

let currentTypeFilter = "";
let currentProducts = [...PRODUCTS];
let currentModalProduct = null;

function renderProducts() {
  productsListEl.innerHTML = "";
  let keyword = searchInputEl.value.trim().toLowerCase();
  const platform = platformFilterEl.value;

  const filtered = PRODUCTS.filter((p) => {
    const matchKeyword =
      p.title.toLowerCase().includes(keyword) ||
      p.platform.toLowerCase().includes(keyword);
    const matchPlatform = platform ? p.platform === platform : true;
    const matchType = currentTypeFilter ? p.type === currentTypeFilter : true;
    return matchKeyword && matchPlatform && matchType;
  });

  currentProducts = filtered;
  productCountEl.textContent = `รายการทั้งหมด: ${filtered.length} รายการ`;

  if (!filtered.length) {
    productsListEl.innerHTML =
      '<p style="font-size:12px; color:#9ca3af;">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>';
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const metaText = `${p.platform} • สต็อก: ${p.stock}`;

    card.innerHTML = `
      <div class="product-title">${p.title}</div>
      <div class="product-meta">
        <span>${metaText}</span>
        <span>#${p.id.toString().padStart(3, "0")}</span>
      </div>
      <div class="product-badges">
        <span class="badge ${p.stock > 0 ? "green" : ""}">
          ${p.stock > 0 ? "พร้อมส่ง" : "หมด"}
        </span>
        <span class="badge">${
          p.type === "full"
            ? "เกมเต็ม"
            : p.type === "topup"
            ? "โค้ดเติมเงิน"
            : "DLC / เสริม"
        }</span>
      </div>
      <div class="product-footer">
        <div class="price">${p.price.toLocaleString("th-TH")} ฿</div>
        <div style="display:flex; gap:4px;">
          <button class="btn-sm secondary" data-id="${p.id}" data-action="copy">
            คัดลอกชื่อ
          </button>
          <button class="btn-sm" data-id="${p.id}" data-action="detail">
            รายละเอียด
          </button>
        </div>
      </div>
    `;

    productsListEl.appendChild(card);
  });
}

// event กรอง
searchInputEl.addEventListener("input", () => renderProducts());
platformFilterEl.addEventListener("change", () => renderProducts());

tagEls.forEach((tag) => {
  tag.addEventListener("click", () => {
    tagEls.forEach((t) => t.classList.remove("active"));
    tag.classList.add("active");
    currentTypeFilter = tag.dataset.type || "";
    renderProducts();
  });
});

// event คลิกปุ่มใน card
productsListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  if (action === "copy") {
    const text = `${product.title} - ราคา ${product.price.toLocaleString(
      "th-TH"
    )} บาท`;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("คัดลอกชื่อเกม + ราคาแล้ว"))
      .catch(() => alert("ไม่สามารถคัดลอกได้ กรุณาคัดลอกเอง"));
  } else if (action === "detail") {
    openModal(product);
  }
});

function openModal(product) {
  currentModalProduct = product;
  modalTitle.textContent = product.title;
  modalPlatform.textContent = `แพลตฟอร์ม: ${product.platform}`;
  modalType.textContent =
    "ประเภท: " +
    (product.type === "full"
      ? "เกมเต็ม (Full Game)"
      : product.type === "topup"
      ? "โค้ดเติมเงิน / Point"
      : "DLC / เสริม");
  modalStock.textContent = `สต็อกคงเหลือ: ${product.stock} โค้ด`;
  modalNote.textContent = `หมายเหตุ: ${product.note}`;
  modalBackdrop.style.display = "flex";
}

function closeModal() {
  modalBackdrop.style.display = "none";
  currentModalProduct = null;
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

modalCopyBtn.addEventListener("click", () => {
  if (!currentModalProduct) return;
  const text = `สั่งซื้อ: ${currentModalProduct.title} (${currentModalProduct.platform}) ราคา ${currentModalProduct.price.toLocaleString(
    "th-TH"
  )} บาท`;
  navigator.clipboard
    .writeText(text)
    .then(() => alert("คัดลอกข้อความสำหรับสั่งซื้อแล้ว"))
    .catch(() => alert("คัดลอกไม่สำเร็จ"));
});

modalChatBtn.addEventListener("click", () => {
  // ตรงนี้ในอนาคตสามารถเปลี่ยนเป็นเปิด Line OA / Discord / หน้าแชทร้าน
  alert(
    "ตรงนี้สามารถลิงก์ไปหน้าแชทร้านหรือบอทแชทของคุณวาเลนได้ เช่น line:// หรือ https://…"
  );
});

// initial render
renderProducts();

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (!confirm('ต้องการออกจากระบบใช่ไหม?')) return;

    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      // ถ้าออกสำเร็จก็เด้งไปหน้า login
      if (data.ok) {
        window.location.href = '/login.html'; // หรือ '/login' ถ้าตั้ง route ไว้
      } else {
        alert('ออกจากระบบไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง');
    }
  });
}
