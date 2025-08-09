
// app.js - Supabase integration and UI logic
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function slugify(t){ return t.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,''); }

async function loadGrid(){
  const grid = document.getElementById('grid');
  grid.innerHTML = '<p>Loading…</p>';
  try {
    let { data, error } = await supabase.from('videos').select('*').order('date_added', {ascending:false}).limit(500);
    if (error) throw error;
    if (!data || data.length===0){ grid.innerHTML = '<p class="center">No videos yet. Use Add Subpage.</p>'; return; }
    grid.innerHTML = '';
    data.forEach((v) => {
      const thumb = v.thumbnail_url || '/assets/coming-soon.png';
      const slug = v.slug || v.id;
      const a = document.createElement('a');
      a.href = `/v/${slug}`;
      a.innerHTML = `<div class="card"><img src="${thumb}" alt="${v.title||'Video'}"><div class="meta"><strong>${v.title || 'Video'}</strong></div></div>`;
      grid.appendChild(a);
    });
  } catch(e){
    grid.innerText = 'Error loading videos: ' + e.message;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const addBtn = document.getElementById('addBtn');
  const modal = document.getElementById('modal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('addForm');
  addBtn.onclick = ()=> modal.classList.remove('hidden');
  cancelBtn.onclick = ()=> modal.classList.add('hidden');
  form.onsubmit = async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const title = fd.get('title');
    const thumbnail = fd.get('thumbnail') || '/assets/coming-soon.png';
    const embed = fd.get('embed') || '';
    const slug = fd.get('slug') || slugify(title || Date.now());
    document.getElementById('status').innerText = 'Creating...';
    try {
      const { data, error } = await supabase.from('videos').insert([{
        title, thumbnail_url: thumbnail, iframe_code: embed, slug, date_added: new Date().toISOString()
      }]);
      if (error) throw error;
      document.getElementById('status').innerText = 'Created';
      form.reset();
      modal.classList.add('hidden');
      await loadGrid();
    } catch(err){
      document.getElementById('status').innerText = 'Error: ' + err.message;
    }
  };

  if (location.pathname.endsWith('video.html') || location.search.includes('slug=')){
    renderVideoPage();
  } else {
    loadGrid();
    // banner ad (actual script included)
    document.getElementById('home-banner').innerHTML = '<script type="text/javascript">atOptions = {\"key\" : \"e3cae57f32856ca2fc6707e364f8482d\",\"format\" : \"iframe\",\"height\" : 90,\"width\" : 728,\"params\" : {}};</script><script type="text/javascript" src="//rougefictionnoose.com/e3cae57f32856ca2fc6707e364f8482d/invoke.js"></script>';
  }
});

async function renderVideoPage(){
  let slug = null;
  const params = new URLSearchParams(location.search);
  if (params.has('slug')) slug = params.get('slug');
  if (!slug){
    const m = location.pathname.match(/\/v\/([^\/]+)/);
    if (m) slug = m[1];
  }
  if (!slug) {
    document.getElementById('video-title').innerText = 'No video specified';
    return;
  }
  // banner ad
  document.getElementById('page-banner').innerHTML = '<script type="text/javascript">atOptions = {\"key\" : \"e3cae57f32856ca2fc6707e364f8482d\",\"format\" : \"iframe\",\"height\" : 90,\"width\" : 728,\"params\" : {}};</script><script type="text/javascript" src="//rougefictionnoose.com/e3cae57f32856ca2fc6707e364f8482d/invoke.js"></script>';
  try {
    const { data, error } = await supabase.from('videos').select('*').eq('slug', slug).limit(1);
    if (error) throw error;
    if (!data || data.length===0){ document.getElementById('video-title').innerText = 'Video not found'; return; }
    const v = data[0];
    document.title = v.title || 'Video';
    document.getElementById('video-title').innerText = v.title || 'Video';
    const wrap = document.getElementById('video-wrap');
    wrap.innerHTML = v.iframe_code || `<img src="${v.thumbnail_url || '/assets/coming-soon.png'}" alt="${v.title}" style="width:100%">`;
    // direct link ad (actual)
// direct iframe
    document.getElementById('direct-ad').innerHTML = `<iframe id="directLink" src="https://rougefictionnoose.com/qpwkqjj2wn?key=081c26f296bab55c72233678bbaf04a1" style="width:100%;border:0;" scrolling="no"></iframe>`;
// in-page push ad
    document.getElementById('push-ad').innerHTML = "<script type='text/javascript' src='//rougefictionnoose.com/f7/b1/86/f7b186a2b459b9efe56f157381196765.js'></script>";
    // try resize direct link iframe after load (best-effort)
    setTimeout(()=>{
      try{
        var ifr = document.getElementById('directLink');
        if(ifr && ifr.contentWindow) {
          ifr.style.height = (ifr.contentWindow.document.body.scrollHeight || 600) + 'px';
        } else {
          ifr.style.height = '600px';
        }
      }catch(e){
        // cross-origin likely; use fallback
        var ifr2 = document.getElementById('directLink');
        if(ifr2) ifr2.style.height = '600px';
      }
    },1000);

  } catch(err){
    document.getElementById('video-title').innerText = 'Error: ' + err.message;
  }
}
