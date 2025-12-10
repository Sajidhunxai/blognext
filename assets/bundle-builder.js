// Bundle Builder JavaScript
let bundle = {};
let currentProductData = null;
let currentImageIndex = 0;
let modalQuantity = 1;
let scrollPosition = 0;

// Get settings from data attributes
function getBundleSettings() {
  const container = document.querySelector('.bundle-builder-container');
  if (!container) return {};
  
  return {
    tier1Qty: parseInt(container.dataset.tier1Qty) || 7,
    tier2Qty: parseInt(container.dataset.tier2Qty) || 14,
    tier3Qty: parseInt(container.dataset.tier3Qty) || 21,
    tier1Percent: parseInt(container.dataset.tier1Percent) || 5,
    tier2Percent: parseInt(container.dataset.tier2Percent) || 20,
    tier3Percent: parseInt(container.dataset.tier3Percent) || 30,
    tier1Code: container.dataset.tier1Code || 'BUNDLE5',
    tier2Code: container.dataset.tier2Code || 'BUNDLE20',
    tier3Code: container.dataset.tier3Code || 'BUNDLE30'
  };
}

// ---- NOTIFICATION FUNCTION ----
function showNotification(message, type = 'error') {
  const notification = document.getElementById('bundle-notification');
  const notificationText = document.getElementById('bundle-notification-text');
  
  if (!notification || !notificationText) return;
  
  notificationText.textContent = message;
  notification.className = `bundle-notification ${type}`;
  notification.classList.add('show');
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ---- SAVE TO LOCALSTORAGE ----
function saveBundle() {
  localStorage.setItem("bundle_data", JSON.stringify(bundle));
}

// ---- GET CURRENT TOTAL ----
function getCurrentTotal() {
  let total = 0;
  if (bundle && typeof bundle === 'object' && !Array.isArray(bundle)) {
    Object.keys(bundle).forEach(key => {
      const qty = parseInt(bundle[key]);
      if (!isNaN(qty) && qty > 0) {
        total += qty;
      }
    });
  }
  return total;
}

// ---- CHECK IF CAN ADD MORE ITEMS ----
function canAddMoreItems(quantityToAdd = 1) {
  const settings = getBundleSettings();
  const currentTotal = getCurrentTotal();
  return (currentTotal + quantityToAdd) <= settings.tier3Qty;
}

// ---- LOAD FROM LOCALSTORAGE ----
function loadBundle() {
  const saved = localStorage.getItem("bundle_data");
  if (saved) {
    try {
      bundle = JSON.parse(saved);
      // Validate bundle object - ensure it's an object and clean invalid entries
      if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
        bundle = {};
        localStorage.removeItem("bundle_data"); // Clear invalid data
      } else {
        // Clean up any invalid entries
        let hasValidData = false;
        Object.keys(bundle).forEach(key => {
          const qty = parseInt(bundle[key]);
          if (isNaN(qty) || qty <= 0) {
            delete bundle[key];
          } else {
            bundle[key] = qty;
            hasValidData = true;
          }
        });
        // If no valid data after cleanup, clear localStorage
        if (!hasValidData) {
          bundle = {};
          localStorage.removeItem("bundle_data");
        }
      }
    } catch(e) {
      console.error('Error loading bundle:', e);
      bundle = {};
      localStorage.removeItem("bundle_data"); // Clear corrupted data
    }
  } else {
    bundle = {};
  }

  // Update card displays
  document.querySelectorAll(".bundle-card").forEach(card=>{
    let id = card.dataset.variantId;
    let qty = bundle[id] || 0;
    if(qty == 0){
      card.querySelector(".qty-display").style.display = 'none';
    }else{
      card.querySelector(".qty-display").innerText = qty;
      card.querySelector(".qty-display").style.display = 'flex';
    }
  });

  // Always update UI to ensure progress bar and other elements are initialized
  updateBundleUI();
}

// ---- PRODUCT MODAL FUNCTIONS ----
async function fetchProductDetails(productHandle) {
  try {
    const response = await fetch(`/products/${productHandle}.js`);
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

async function openProductModal(card) {
  const productHandle = card.dataset.productHandle;
  const variantId = card.dataset.variantId;
  
  if (!productHandle) {
    console.error('Product handle not found');
    return;
  }

  const modal = document.getElementById('bundle-product-modal');
  if (!modal) return;

  // Store current scroll position BEFORE any changes
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Lock scroll position immediately
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  
  // Prevent body scroll and show modal
  document.body.classList.add('bundle-modal-open');
  modal.classList.add('active');
  
  // Ensure modal scrolls to top
  requestAnimationFrame(() => {
    modal.scrollTop = 0;
  });

  try {
    // Fetch product details
    const productData = await fetchProductDetails(productHandle);
    currentProductData = productData;
    currentImageIndex = 0;
    modalQuantity = 1;

    // Find the variant
    const variant = productData.variants.find(v => v.id.toString() === variantId) || productData.variants[0];

    // Populate modal with product data
    document.getElementById('bundle-modal-title').textContent = productData.title;
    
    // Format price
    const price = (variant.price / 100).toFixed(2);
    document.getElementById('bundle-modal-price').textContent = `$${price}`;

    // Set description
    const description = productData.description || 'No description available';
    document.getElementById('bundle-modal-description').innerHTML = description;

    // Set images
    const images = productData.images && productData.images.length > 0 
      ? productData.images 
      : (productData.featured_image ? [productData.featured_image] : []);

    if (images.length > 0) {
      document.getElementById('bundle-modal-main-img').src = images[0];
      document.getElementById('bundle-modal-main-img').alt = productData.title;
    }

    // Populate thumbnails
    const thumbnailsContainer = document.getElementById('bundle-modal-thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    if (images.length > 1) {
      images.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `bundle-modal-thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${img}" alt="${productData.title}" width="80" height="80">`;
        thumbnail.addEventListener('click', () => {
          currentImageIndex = index;
          updateModalImage();
        });
        thumbnailsContainer.appendChild(thumbnail);
      });
    }
    
    // Update navigation button visibility
    const prevBtn = document.getElementById('bundle-modal-prev');
    const nextBtn = document.getElementById('bundle-modal-next');
    if (prevBtn) prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = images.length > 1 ? 'flex' : 'none';

    // Sync modal quantity with bundle quantity
    const currentQty = bundle[variantId] || 0;
    modalQuantity = currentQty > 0 ? currentQty : 1;
    document.getElementById('bundle-modal-qty-display').textContent = modalQuantity;

    // Store variant ID for add to cart
    modal.dataset.variantId = variant.id;

  } catch (error) {
    console.error('Error loading product:', error);
    showNotification('Failed to load product details. Please try again.', 'error');
    closeProductModal();
  }
}

function closeProductModal() {
  const modal = document.getElementById('bundle-product-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('bundle-modal-open');
    
    // Restore body styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }
  currentProductData = null;
  currentImageIndex = 0;
  modalQuantity = 1;
  scrollPosition = 0;
}

function updateModalImage() {
  if (!currentProductData || !currentProductData.images) return;
  
  const images = currentProductData.images;
  if (images.length === 0) return;

  // Update main image
  document.getElementById('bundle-modal-main-img').src = images[currentImageIndex];

  // Update thumbnail active state
  document.querySelectorAll('.bundle-modal-thumbnail').forEach((thumb, index) => {
    if (index === currentImageIndex) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });

  // Show/hide navigation buttons
  const prevBtn = document.getElementById('bundle-modal-prev');
  const nextBtn = document.getElementById('bundle-modal-next');
  if (prevBtn) prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
}

function initializeProductModal() {
  // Card click handlers (excluding quantity buttons)
  document.querySelectorAll('.bundle-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking on quantity buttons or controls
      const clickedQtyControl = e.target.closest('.bundle-qty') || 
                                e.target.closest('.qty-btn') ||
                                e.target.classList.contains('qty-btn') ||
                                e.target.classList.contains('qty-minus') ||
                                e.target.classList.contains('qty-plus') ||
                                e.target.classList.contains('qty-display');
      
      if (!clickedQtyControl) {
        e.preventDefault();
        e.stopPropagation();
        openProductModal(card);
      }
    });
  });

  // Close modal handlers
  const closeBtn = document.getElementById('bundle-modal-close');
  const overlay = document.querySelector('.bundle-modal-overlay');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeProductModal);
  }

  // Image navigation
  const prevBtn = document.getElementById('bundle-modal-prev');
  const nextBtn = document.getElementById('bundle-modal-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentProductData && currentProductData.images) {
        currentImageIndex = (currentImageIndex - 1 + currentProductData.images.length) % currentProductData.images.length;
        updateModalImage();
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentProductData && currentProductData.images) {
        currentImageIndex = (currentImageIndex + 1) % currentProductData.images.length;
        updateModalImage();
      }
    });
  }

  // Modal quantity controls
  const qtyPlus = document.getElementById('bundle-modal-qty-plus');
  const qtyMinus = document.getElementById('bundle-modal-qty-minus');
  
  if (qtyPlus) {
    qtyPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      // Check if increasing quantity would exceed tier3 limit
      const currentTotal = getCurrentTotal();
      const modal = document.getElementById('bundle-product-modal');
      const variantId = modal ? modal.dataset.variantId : null;
      const currentItemQty = variantId ? (bundle[variantId] || 0) : 0;
      const settings = getBundleSettings();
      
      // Calculate what the new total would be if we increase modalQuantity
      const newTotal = currentTotal - currentItemQty + (modalQuantity + 1);
      
      if (newTotal > settings.tier3Qty) {
        showNotification(`You can only add up to ${settings.tier3Qty} items to your bundle.`, 'error');
        return;
      }
      
      modalQuantity++;
      document.getElementById('bundle-modal-qty-display').textContent = modalQuantity;
    });
  }
  
  if (qtyMinus) {
    qtyMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('bundle-modal-qty-display').textContent = modalQuantity;
      }
    });
  }

  // Add to Box button in modal
  const modalAddBtn = document.getElementById('bundle-modal-add-btn');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.getElementById('bundle-product-modal');
      const variantId = modal.dataset.variantId;
      
      if (!variantId) {
        showNotification('Product variant not found', 'error');
        return;
      }

      // Check if adding would exceed tier3 limit
      if (!canAddMoreItems(modalQuantity)) {
        const settings = getBundleSettings();
        showNotification(`You can only add up to ${settings.tier3Qty} items to your bundle.`, 'error');
        return;
      }

      // Add items to bundle
      bundle[variantId] = (bundle[variantId] || 0) + modalQuantity;
      
      // Update card display
      document.querySelectorAll('.bundle-card').forEach(card => {
        if (card.dataset.variantId === variantId) {
          const qty = bundle[variantId] || 0;
          if(qty > 0){
            card.querySelector('.qty-display').innerText = qty;
            card.querySelector('.qty-display').style.display = 'flex';
          } else {
            card.querySelector('.qty-display').style.display = 'none';
          }
        }
      });
      
      saveBundle();
      updateBundleUI();
      closeProductModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('bundle-product-modal');
      if (modal && modal.classList.contains('active')) {
        closeProductModal();
      }
    }
  });
}

function updateBundleUI() {
  // Ensure bundle is an object
  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
    bundle = {};
  }
  
  // Get all valid variant IDs from product cards to validate bundle entries
  const validVariantIds = new Set();
  document.querySelectorAll(".bundle-card").forEach(card => {
    const variantId = card.dataset.variantId;
    if (variantId) {
      validVariantIds.add(variantId);
    }
  });
  
  // Calculate total - ONLY count actual items from bundle object, NOT empty slots
  // Also clean up any invalid entries that don't match actual product variant IDs
  let total = 0;
  let cleanedBundle = false;
  if (bundle && typeof bundle === 'object' && !Array.isArray(bundle)) {
    Object.keys(bundle).forEach(key => {
      const qty = parseInt(bundle[key]);
      // Only count if: qty is valid AND > 0 AND the variant ID exists in the product cards
      if (!isNaN(qty) && qty > 0 && validVariantIds.has(key)) {
        total += qty;
      } else {
        // Remove invalid entries (invalid qty or non-existent variant IDs)
        delete bundle[key];
        cleanedBundle = true;
      }
    });
  }
  
  // Save cleaned bundle back to localStorage only if we cleaned something
  if (cleanedBundle) {
    if (Object.keys(bundle).length === 0) {
      localStorage.removeItem("bundle_data");
    } else {
      saveBundle();
    }
  }

  const settings = getBundleSettings();
  let tier1Qty = settings.tier1Qty;
  let tier2Qty = settings.tier2Qty;
  let tier3Qty = settings.tier3Qty;

  let discountPercent = 0;

  if (total >= tier3Qty) {
    discountPercent = settings.tier3Percent;
  } else if (total >= tier2Qty) {
    discountPercent = settings.tier2Percent;
  } else if (total >= tier1Qty) {
    discountPercent = settings.tier1Percent;
  }

  // Update total display FIRST - before creating bundleItems array
  const totalItemsEl = document.getElementById("bundle-total-items");
  const discountLabelEl = document.getElementById("bundle-discount-label");
  
  if(totalItemsEl) {
    totalItemsEl.innerText = total; // Use actual total, not bundleItems.length
  }
  if(discountLabelEl) {
    discountLabelEl.innerText = discountPercent + "%";
  }

  let list = document.getElementById("bundle-items-list");
  list.innerHTML = "";

  // Create array of all bundle items (expanded - one entry per item)
  // This is ONLY for display, NOT for counting total
  let bundleItems = [];
  document.querySelectorAll(".bundle-card").forEach(card=>{
    let id = card.dataset.variantId;
    let qty = bundle[id] || 0;
    
    // Only add if qty > 0
    if (qty > 0) {
      // Add each item individually (not grouped)
      for(let i = 0; i < qty; i++){
        bundleItems.push({
          id: id,
          card: card,
          title: card.dataset.title,
          price: card.dataset.price,
          img: card.dataset.img
        });
      }
    }
  });

  // Display filled items
  bundleItems.forEach((item, index) => {
    list.innerHTML += `
      <div class="bundle-sidebar-item" data-variant-id="${item.id}">
        <div class="sidebar-img-container">
          <img src="${item.img}" class="sidebar-thumb">
        </div>
        <div class="sidebar-item-info">
          <div class="sidebar-item-title">${item.title}</div>
          <div class="sidebar-item-price">${item.price}</div>
        </div>
        <button class="sidebar-delete-btn bundle-remove-item" data-variant-id="${item.id}" aria-label="Remove item">×</button>
      </div>
    `;
  });

  // Add empty slots up to tier3Qty - use actual total, not bundleItems.length
  let emptySlots = Math.max(0, tier3Qty - total);
  const isBundleFull = total >= tier3Qty;
  
  for(let i = 0; i < emptySlots; i++){
    const emptySlot = document.createElement('div');
    emptySlot.className = 'bundle-sidebar-item-empty';
    if (isBundleFull) {
      emptySlot.style.opacity = '0.5';
      emptySlot.style.cursor = 'not-allowed';
      emptySlot.style.pointerEvents = 'none';
    }
    emptySlot.innerHTML = `
      <div class="sidebar-no-img-container">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="sidebar-plus-icon">
          <path d="M12 5V19M5 12H19" stroke="#969696" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="sidebar-item-info">
        <div class="sidebar-empty-text">SELECT A PRODUCT</div>
      </div>
    `;
    if (!isBundleFull) {
      emptySlot.addEventListener('click', () => {
        // Open modal for first available product card
        const firstCard = document.querySelector('.bundle-card');
        if(firstCard) {
          openProductModal(firstCard);
        }
      });
    }
    list.appendChild(emptySlot);
  }

  // Attach remove handlers to delete buttons
  document.querySelectorAll('.bundle-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const variantId = btn.dataset.variantId;
      if(bundle[variantId] && bundle[variantId] > 0){
        bundle[variantId]--;
        if(bundle[variantId] === 0){
          delete bundle[variantId];
        }
        
        // Update card display
        document.querySelectorAll('.bundle-card').forEach(card => {
          if(card.dataset.variantId === variantId){
            const qty = bundle[variantId] || 0;
            if(qty === 0){
              card.querySelector('.qty-display').style.display = 'none';
            } else {
              card.querySelector('.qty-display').innerText = qty;
              card.querySelector('.qty-display').style.display = 'flex';
            }
          }
        });
        
        saveBundle();
        updateBundleUI();
      }
    });
  });

  // Calculate progress bar width
  let max = tier3Qty;
  let progress = 0;
  if (total > 0 && max > 0) {
    progress = Math.min((total / max) * 100, 100);
  }
  
  const progressFill = document.getElementById("bundle-progress-fill");
  if(progressFill) {
    // Force reset width - remove any inline styles first, then set
    progressFill.removeAttribute('style');
    if (total === 0) {
      progressFill.style.width = '0%';
      progressFill.style.minWidth = '0%';
    } else {
      progressFill.style.width = progress + '%';
    }
  }
  
  // Update cart button total
  let totalPrice = 0;
  bundleItems.forEach(item => {
    const priceRaw = parseFloat(item.card.dataset.priceRaw || 0);
    totalPrice += priceRaw;
  });
  const cartBtn = document.getElementById("bundle-add-to-cart");
  if(cartBtn) {
    cartBtn.textContent = `BUILD MY BUNDLE | CART $${totalPrice.toFixed(2)}`;
  }
}


// ---- QUANTITY BUTTONS ----
document.querySelectorAll(".bundle-card").forEach(card=>{
  let id = card.dataset.variantId;

  card.querySelector(".qty-plus").addEventListener("click",(e)=>{
    e.stopPropagation();
    
    // Check if adding would exceed tier3 limit
    if (!canAddMoreItems(1)) {
      const settings = getBundleSettings();
      showNotification(`You can only add up to ${settings.tier3Qty} items to your bundle.`, 'error');
      return;
    }
    
    bundle[id] = (bundle[id]||0)+1;
    const qty = bundle[id];
    card.querySelector(".qty-display").innerText = qty;
    card.querySelector(".qty-display").style.display = 'flex';
    saveBundle();
    updateBundleUI();
  });

  card.querySelector(".qty-minus").addEventListener("click",(e)=>{
    e.stopPropagation();
    if((bundle[id]||0)>0){
      bundle[id]--;
      const qty = bundle[id];
      if(qty === 0){
        card.querySelector(".qty-display").style.display = 'none';
        delete bundle[id];
      } else {
        card.querySelector(".qty-display").innerText = qty;
      }
      saveBundle();
      updateBundleUI();
    }
  });
});


// ---- ADD TO CART ----
document.getElementById("bundle-add-to-cart").addEventListener("click", async ()=>{

  // Create items array - each item added individually (not grouped by variant)
  let items = [];
  Object.keys(bundle).forEach(id => {
    let qty = bundle[id];
    // Add each item separately (quantity 1 for each)
    for(let i = 0; i < qty; i++){
      items.push({
        id: Number(id),
        quantity: 1
      });
    }
  });

  if(items.length === 0){
    showNotification("Please add items to your bundle first", 'error');
    return;
  }

  // Add all items to cart
  await fetch("/cart/add.js",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ items })
  });

  let total = Object.values(bundle).reduce((a,b)=>a+b,0);

  const settings = getBundleSettings();
  let tier1Qty = settings.tier1Qty;
  let tier2Qty = settings.tier2Qty;
  let tier3Qty = settings.tier3Qty;

  if(total>=tier3Qty) window.location.href="/cart?discount=" + settings.tier3Code;
  else if(total>=tier2Qty) window.location.href="/cart?discount=" + settings.tier2Code;
  else if(total>=tier1Qty) window.location.href="/cart?discount=" + settings.tier1Code;
  else window.location.href="/cart";
});

// ---- RESTORE BUNDLE ON PAGE LOAD ----
document.addEventListener("DOMContentLoaded", function() {
  // Initialize bundle if not already set
  if (!bundle || typeof bundle !== 'object') {
    bundle = {};
  }
  
  // Initialize progress bar to 0% before loading bundle data
  const progressFill = document.getElementById("bundle-progress-fill");
  if(progressFill) {
    progressFill.removeAttribute('style');
    progressFill.style.width = "0%";
    progressFill.style.minWidth = "0%";
  }
  
  loadBundle();
  initializeProductModal();
  
  // Double-check progress bar after a short delay to ensure it's correct
  setTimeout(() => {
    const progressFillCheck = document.getElementById("bundle-progress-fill");
    const totalCheck = Object.values(bundle).reduce((a,b)=>{
      const val = parseInt(b) || 0;
      return a + (val > 0 ? val : 0);
    }, 0);
    if(progressFillCheck && totalCheck === 0) {
      progressFillCheck.removeAttribute('style');
      progressFillCheck.style.width = "0%";
      progressFillCheck.style.minWidth = "0%";
    }
  }, 100);
});

document.querySelector(".mbl-drop").addEventListener("click", function() {
  const bundleList = document.querySelector(".bundle-items-list");
  bundleList.classList.toggle("hidden"); // toggles visibility
});

