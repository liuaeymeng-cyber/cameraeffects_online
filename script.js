let takenPhotos = [], isLiveView = true, currentStyle = 'none';
const styles = [
    { id: 'none', name: '原图' }, { id: 'vivid', name: '鲜艳' }, { id: 'cool', name: '冷色' }, { id: 'grayscale', name: '黑白' }, { id: 'neon', name: '霓虹' }, { id: 'sketch', name: '素描' }, { id: 'mirror', name: '镜像' }, { id: 'glitch', name: '故障' }
];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const loader = document.getElementById('loader');
const filterCarousel = document.getElementById('filter-carousel');
const allButtons = document.querySelectorAll('button, .shutter-btn, .four-snap-btn');
const thumbnailGallery = document.getElementById('thumbnail-gallery');
const returnToLiveBtn = document.getElementById('return-to-live');
const downloadAllBtn = document.getElementById('download-all');
const galleryPreview = document.getElementById('gallery-preview');
const galleryPreviewImg = document.getElementById('gallery-preview-img');
const galleryContainer = document.getElementById('gallery-container');
const helpOverlay = document.getElementById('help-overlay');
const helpBtn = document.getElementById('help-btn');
const closeHelpBtn = document.getElementById('close-help');

function initUI() { styles.forEach(style => { const item = document.createElement('div'); item.className = 'filter-item'; item.dataset.style = style.id; item.title = style.name; if (style.id === 'none') item.classList.add('active'); item.innerHTML = `<div class="preview" style="filter: ${getFilterString(style.id)}"></div><span>${style.name}</span>`; filterCarousel.appendChild(item); }); }
async function startCamera() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); video.srcObject = stream; } catch (err) { alert("错误：无法访问摄像头。"); loader.style.display = 'none'; } }
function getFilterString(style) { if (style === 'grayscale') return 'grayscale(100%)'; if (style === 'vivid') return 'saturate(160%) contrast(110%)'; if (style === 'cool') return 'contrast(110%) brightness(95%) sepia(20%)'; if (style === 'neon') return 'saturate(200%) contrast(150%) brightness(70%)'; if (style === 'sketch') return 'grayscale(100%) contrast(200%) invert(1)'; return ''; }
function drawFrameWithEffects() { const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height; const style = currentStyle; if (style === 'mirror') { ctx.save(); ctx.drawImage(video, 0, 0, w / 2, h, 0, 0, w / 2, h); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(video, 0, 0, w / 2, h, 0, 0, w / 2, h); ctx.restore(); return; } ctx.filter = getFilterString(style); ctx.drawImage(video, 0, 0, w, h); if (style === 'glitch') { for (let i = 0; i < 5; i++) { const x = Math.random() * w, y = Math.random() * h, sw = w - x, sh = h / 20, d = (Math.random() - .5) * 40; ctx.drawImage(canvas, x, y, sw, sh, x + d, y, sw, sh); } } }
function renderFrame() { if (isLiveView && !video.paused && video.readyState >= 3) { drawFrameWithEffects(); } requestAnimationFrame(renderFrame); }
function startSingleSnap() { if (!isLiveView) return; isLiveView = false, allButtons.forEach(t => t.disabled = true); runCountdown(2, () => { const t = canvas.getContext("2d"); t.fillStyle = "white", t.fillRect(0, 0, canvas.width, canvas.height); setTimeout(() => { drawFrameWithEffects(), takenPhotos.push({ id: Date.now(), dataUrl: canvas.toDataURL("image/jpeg", .9) }), renderThumbnails(), isLiveView = true, allButtons.forEach(t => t.disabled = false) }, 50) }) }
function startFourSnap() { if (!isLiveView) return; isLiveView = false, allButtons.forEach(t => t.disabled = true); const e = []; runCountdown(2, () => { runSnapSequence(4, e, () => createCompositeImage(e)) }) }
function runCountdown(t, e) { let a = t; const o = setInterval(() => { drawFrameWithEffects(); const t = canvas.getContext("2d"); t.fillStyle = "rgba(0,0,0,0.5)", t.fillRect(0, 0, canvas.width, canvas.height), t.fillStyle = "white", t.font = "bold 150px 'Poppins'", t.textAlign = "center", t.textBaseline = "middle", t.fillText(a, canvas.width / 2, canvas.height / 2), --a < 0 && (clearInterval(o), e()) }, 1e3) }
async function runSnapSequence(t, e, a) { for (let o = 0; o < t; o++) { const t = canvas.getContext("2d"); t.fillStyle = "white", t.fillRect(0, 0, canvas.width, canvas.height), await new Promise(t => setTimeout(t, 50)), drawFrameWithEffects(), e.push(canvas.toDataURL("image/jpeg", .9)), await new Promise(t => setTimeout(t, 950)) } a() }
function createCompositeImage(t) { const e = document.createElement("canvas"), a = e.getContext("2d"), o = canvas.width, n = canvas.height; e.width = o, e.height = n; const i = t.map(t => new Promise(e => { const a = new Image; a.onload = () => e(a), a.src = t })); Promise.all(i).then(t => { a.drawImage(t[0], 0, 0, o / 2, n / 2), a.drawImage(t[1], o / 2, 0, o / 2, n / 2), a.drawImage(t[2], 0, n / 2, o / 2, n / 2), a.drawImage(t[3], o / 2, n / 2, o / 2, n / 2), takenPhotos.push({ id: Date.now(), dataUrl: e.toDataURL("image/jpeg", .9) }), renderThumbnails(), isLiveView = !0, allButtons.forEach(t => t.disabled = !1) }) }
function renderThumbnails() { thumbnailGallery.innerHTML = ""; if(takenPhotos.length > 0) { const latestPhoto = takenPhotos[takenPhotos.length - 1]; galleryPreviewImg.src = latestPhoto.dataUrl; galleryPreview.style.display = 'block'; } else { galleryPreview.style.display = 'none'; } takenPhotos.forEach(t => { const e = document.createElement("div"); e.className = "thumbnail"; const a = document.createElement("img"); a.src = t.dataUrl, a.onclick = () => showPhotoInCanvas(t.dataUrl); const o = document.createElement("div"); o.className = "delete-btn", o.innerHTML = "&times;", o.onclick = e => { e.stopPropagation(), deletePhoto(t.id) }, e.appendChild(a), e.appendChild(o), thumbnailGallery.appendChild(e) }) }
function showPhotoInCanvas(t) { isLiveView = !1, returnToLiveBtn.style.display = "inline-block"; const e = new Image; e.onload = () => { const t = canvas.getContext("2d"); t.filter = "none", t.drawImage(e, 0, 0, canvas.width, canvas.height) }, e.src = t }
function deletePhoto(t) { takenPhotos = takenPhotos.filter(e => e.id !== t), renderThumbnails() }

filterCarousel.addEventListener('click', (e) => { const targetItem = e.target.closest('.filter-item'); if (targetItem) { filterCarousel.querySelectorAll('.filter-item').forEach(item => item.classList.remove('active')); targetItem.classList.add('active'); currentStyle = targetItem.dataset.style; }});
galleryPreview.addEventListener('click', () => { galleryContainer.scrollIntoView({ behavior: 'smooth' }); });
document.getElementById('shutter-btn').addEventListener('click', startSingleSnap);
document.getElementById('four-snap-btn').addEventListener('click', startFourSnap);
document.getElementById('download-current').addEventListener('click', () => { const t=canvas.toDataURL("image/jpeg",.9),e=document.createElement("a");e.href=t,e.download=`photo-${Date.now()}.jpg`,e.click()});
document.getElementById('download-all').addEventListener('click', () => { if (0===takenPhotos.length) return void alert("相册中没有照片可以下载！"); const t=new JSZip; downloadAllBtn.textContent="正在压缩...",takenPhotos.forEach(e=>{const a=e.dataUrl.split(",")[1];t.file(`photo-${e.id}.jpg`,a,{base64:!0})}),t.generateAsync({type:"blob"}).then(function(t){const e=document.createElement("a");e.href=URL.createObjectURL(t),e.download="my-photos.zip",e.click(),downloadAllBtn.textContent="打包下载"})});
returnToLiveBtn.addEventListener('click', () => { isLiveView = !0, returnToLiveBtn.style.display = "none" });
document.getElementById('reset-all').addEventListener('click', () => { takenPhotos = [], renderThumbnails(), isLiveView || returnToLiveBtn.click(), currentStyle = "none", filterCarousel.querySelectorAll(".filter-item").forEach(t=>t.classList.remove("active")), filterCarousel.querySelector('[data-style="none"]').classList.add("active")});
helpBtn.addEventListener('click', () => helpOverlay.classList.remove('hidden'));
closeHelpBtn.addEventListener('click', () => helpOverlay.classList.add('hidden'));
helpOverlay.addEventListener('click', (e) => { if(e.target === helpOverlay) helpOverlay.classList.add('hidden'); });
document.addEventListener('keydown', (e) => { if (e.key === "Escape") helpOverlay.classList.add('hidden'); });

initUI();
startCamera();
video.addEventListener('loadedmetadata', () => { canvas.width = video.videoWidth; canvas.height = video.videoHeight; });
video.addEventListener('play', () => { loader.classList.add('hidden'); renderFrame(); });
