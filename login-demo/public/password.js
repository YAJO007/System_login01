// ใช้ localStorage เก็บรายการลงขายในเครื่อง
const STORAGE_KEY = "gamecode_market_listings";

const sellForm = document.getElementById("sellForm");
const formMessage = document.getElementById("formMessage");
const listingContainer = document.getElementById("listingContainer");
const listingCount = document.getElementById("listingCount");
const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");

function loadListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadListings error", e);
    return [];
  }
}

function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

let listings = loadListings();

// แปลงประเภทให้เป็นข้อความไทย
function getTypeLabel(type) {
  switch (type) {
    case "full":
      return "เกมเต็ม";
    case "topup":
      return "โค้ดเติมเงิน";
    case "dlc":
      return "DLC / เสริม";
    case "account":
      return "ขายไอดี / บัญชี";
    default:
      return type;
  }
}

// แสดงรายการ
function renderListings(filterKeyword = "") {
  listingContainer.innerHTML = "";

  const kw = filterKeyword.trim().toLowerCase();
  let filtered = listings;

  if (kw) {
    filtered = listings.filter((item) => {
      return (
        item.gameName.toLowerCase().includes(kw) ||
        item.platform.toLowerCase().includes(kw)
      );
    });
  }

  if (!filtered.length) {
    listingCount.textContent = "ยังไม่มีประกาศ หรือไม่พบตามคำค้นหา";
    listingContainer.innerHTML =
      '<p style="font-size:12px; color:#9ca3af;">ยังไม่มีข้อมูล หรือไม่พบรายการตรงกับคำค้นหา</p>';
    return;
  }

  listingCount.textContent = `ทั้งหมด ${filtered.length} ประกาศ`;

  filtered.forEach((item) => {
    const div = document.createElement("div");
    div.className = "listing-item";

    const dateText = new Date(item.createdAt).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });

    div.innerHTML = `
      <div class="listing-title">${item.gameName}</div>
      <div class="listing-meta">
        <span>${item.platform}</span>
        <span>${item.price.toLocaleString("th-TH")} ฿</span>
      </div>
      <div class="listing-tags">
        <span class="tag-chip">${getTypeLabel(item.type)}</span>
        <span class="tag-chip green">จำนวน ${item.stock} ชิ้น</span>
      </div>
      ${
        item.note
          ? `<div class="listing-note">หมายเหตุ: ${item.note}</div>`
          : ""
      }
      <div class="listing-contact">ติดต่อผู้ขาย: ${item.contact}</div>
      <div class="listing-footer">
        <span>โพสต์เมื่อ: ${dateText}</span>
        <span>#${item.id}</span>
      </div>
    `;

    listingContainer.appendChild(div);
  });
}

// จัดการ submit ฟอร์ม
sellForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const gameName = document.getElementById("gameName").value.trim();
  const platform = document.getElementById("platform").value;
  const type = document.getElementById("type").value;
  const priceValue = document.getElementById("price").value;
  const stockValue = document.getElementById("stock").value;
  const contact = document.getElementById("contact").value.trim();
  const note = document.getElementById("note").value.trim();

  const price = Number(priceValue);
  const stock = Number(stockValue);

  if (!gameName || !platform || !type || !priceValue || !stockValue || !contact) {
    formMessage.textContent = "กรุณากรอกข้อมูลที่มี * ให้ครบถ้วน";
    formMessage.style.color = "#f97316";
    return;
  }

  if (price <= 0 || stock <= 0) {
    formMessage.textContent = "ราคาหรือจำนวนต้องมากกว่า 0";
    formMessage.style.color = "#f97316";
    return;
  }

  const id = (Date.now() + "-" + Math.floor(Math.random() * 1000)).slice(-8);

  const newItem = {
    id,
    gameName,
    platform,
    type,
    price,
    stock,
    contact,
    note,
    createdAt: new Date().toISOString(),
  };

  listings.unshift(newItem); // ใส่ด้านหน้า
  saveListings(listings);
  renderListings(searchInput.value);

  sellForm.reset();
  formMessage.textContent = "โพสต์ประกาศเรียบร้อย (เก็บไว้ในเครื่องของคุณเท่านั้น)";
  formMessage.style.color = "#22c55e";

  setTimeout(() => {
    formMessage.textContent = "";
  }, 2500);
});

// ค้นหา
searchInput.addEventListener("input", (e) => {
  renderListings(e.target.value);
});

// ล้างข้อมูลทั้งหมด (ลบจาก localStorage)
clearAllBtn.addEventListener("click", () => {
  if (!listings.length) return;
  const ok = confirm("ต้องการลบประกาศทั้งหมดที่เก็บในเครื่องนี้หรือไม่?");
  if (!ok) return;
  listings = [];
  saveListings(listings);
  renderListings(searchInput.value);
});

// initial
renderListings();
