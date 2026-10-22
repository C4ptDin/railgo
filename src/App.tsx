import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, ArrowRight, Bookmark, CalendarDays, Check, ChevronDown, Clock3, Compass, MapPin, Menu, Plus, Search, SlidersHorizontal, TrainFront, Users, X } from 'lucide-react';
import { journeys, stations, formatDuration, type Journey } from './data';

type SearchForm = { origin: string; destination: string; date: string; passengers: number };
const today = () => new Date().toLocaleDateString('en-CA');
const initialSearch: SearchForm = { origin: 'KL Sentral', destination: 'Ipoh', date: today(), passengers: 1 };
const SAVED_KEY = 'railflow:saved-journeys';
const PREF_KEY = 'railflow:preferences';
function readSaved(): string[] { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as string[]; } catch { return []; } }
function readPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{"compact":false,"currency":"MYR"}') as {compact:boolean;currency:string}; } catch { return {compact:false,currency:'MYR'}; } }

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return <header className="site-header"><div className="nav-wrap">
    <Link to="/" className="brand" aria-label="RAILFLOW home"><span className="brand-mark"><TrainFront size={19}/></span><span>RAILFLOW<span className="brand-dot">.</span></span></Link>
    <button className="mobile-toggle icon-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">
      <NavLink to="/" end>Home</NavLink><NavLink to="/journeys">Find a journey</NavLink><NavLink to="/my-trips">My trips</NavLink>
      <Link to="/journeys" className="nav-cta">Plan a trip <ArrowRight size={16}/></Link>
    </nav>
  </div></header>;
}
function Footer() { return <footer className="footer"><div className="footer-inner"><Link to="/" className="brand"><span className="brand-mark"><TrainFront size={18}/></span><span>RAILFLOW<span className="brand-dot">.</span></span></Link><p>Thoughtful planning for the journeys ahead.</p><div className="footer-bottom"><span>Independent journey-planning prototype · <Link to="/profile">Preferences</Link></span><span>All schedules and fares are illustrative sample data.</span></div></div></footer>; }

function StationField({ label, value, onChange, exclude }: {label:string;value:string;onChange:(v:string)=>void;exclude:string}) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  useEffect(() => setQuery(value), [value]);
  const suggestions = stations.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) && s.name !== exclude).slice(0,5);
  return <div className="station-field"><label>{label}</label><div className="station-input"><MapPin size={17}/><input value={query} onChange={e => {setQuery(e.target.value);onChange(e.target.value);}} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false),120)} aria-label={label} aria-autocomplete="list" aria-expanded={focused && suggestions.length>0} placeholder="Choose a station"/></div>
    {focused && suggestions.length>0 && <div className="suggestions" role="listbox">{suggestions.map(s=><button type="button" key={s.id} role="option" onMouseDown={e=>e.preventDefault()} onClick={()=>{setQuery(s.name);onChange(s.name);setFocused(false);}}><span className="suggestion-icon"><TrainFront size={16}/></span><span><strong>{s.name}</strong><small>{s.region}</small></span></button>)}</div>}
  </div>;
}
function SearchPanel({ compact=false, onSearch }: {compact?:boolean;onSearch?:(f:SearchForm)=>void}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form,setForm] = useState<SearchForm>(()=>({origin:params.get('from')||initialSearch.origin,destination:params.get('to')||initialSearch.destination,date:params.get('date')||today(),passengers:Number(params.get('pax')||1)}));
  const [error,setError] = useState('');
  const update = (key:keyof SearchForm,value:string|number) => setForm(old=>({...old,[key]:value}));
  function submit(e:React.FormEvent) {
    e.preventDefault();
    if(!form.origin.trim() || !form.destination.trim()){setError('Choose both an origin and a destination.');return;}
    if(form.origin.trim().toLowerCase()===form.destination.trim().toLowerCase()){setError('Origin and destination must be different stations.');return;}
    if(!stations.some(s=>s.name===form.origin)||!stations.some(s=>s.name===form.destination)){setError('Please select stations from the suggestions.');return;}
    if(form.date<today()){setError('Choose today or a future travel date.');return;}
    setError(''); if(onSearch) onSearch(form); else navigate('/journeys?'+new URLSearchParams({from:form.origin,to:form.destination,date:form.date,pax:String(form.passengers)}).toString());
  }
  return <form className={compact?'search-panel compact':'search-panel'} onSubmit={submit} noValidate>
    <div className="search-fields">
      <StationField label="FROM" value={form.origin} exclude={form.destination} onChange={v=>update('origin',v)}/>
      <button type="button" className="swap-button" title="Swap stations" aria-label="Swap origin and destination" onClick={()=>setForm(f=>({...f,origin:f.destination,destination:f.origin}))}><ArrowDownUp size={17}/></button>
      <StationField label="TO" value={form.destination} exclude={form.origin} onChange={v=>update('destination',v)}/>
      <div className="date-field"><label htmlFor="travel-date">TRAVEL DATE</label><div className="station-input"><CalendarDays size={17}/><input id="travel-date" type="date" min={today()} value={form.date} onChange={e=>update('date',e.target.value)} required/></div></div>
      <div className="passenger-field"><label htmlFor="passengers">PASSENGERS</label><div className="passenger-control"><Users size={17}/><select id="passengers" value={form.passengers} onChange={e=>update('passengers',Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?'passenger':'passengers'}</option>)}</select><ChevronDown size={14}/></div></div>
      <button className="search-button" type="submit"><Search size={18}/><span>Search journeys</span></button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
function JourneyCard({journey,saved,onSave,compact=false}:{journey:Journey;saved:boolean;onSave:()=>void;compact?:boolean}) {
  return <article className={compact?'journey-card journey-card-compact':'journey-card'}>
    <div className="journey-main"><div className="service-label"><span className="service-symbol"><TrainFront size={15}/></span><span>{journey.service}</span><span className="sample-chip">SAMPLE</span></div>
      <div className="journey-times"><div><strong>{journey.departure}</strong><span>{journey.origin}</span></div><div className="duration-rail"><span>{formatDuration(journey.duration)}</span><div className="rail-line"><i/><i/></div><small>{journey.changes===0?'Direct':'1 change'}</small></div><div className="arrival"><strong>{journey.arrival}</strong><span>{journey.destination}</span></div></div>
      <div className="journey-meta"><span><Clock3 size={14}/>{formatDuration(journey.duration)}</span><span><MapPin size={14}/>{journey.stops.length-2} intermediate stops</span></div>
    </div><div className="journey-side"><div className="fare"><small>Sample fare / person</small><strong>RM {journey.fare.toFixed(2)}</strong></div><div className="card-actions"><button className={saved?'save-button saved':'save-button'} onClick={onSave} aria-label={saved?'Remove saved journey':'Save journey'} title={saved?'Remove saved journey':'Save journey'}>{saved?<Check size={16}/>:<Bookmark size={16}/>}</button><Link className="details-button" to={'/journeys/'+journey.id}>View journey <ArrowRight size={15}/></Link></div></div>
  </article>;
}
function Home({onSave}:{saved:string[];onSave:(id:string)=>void}) {
  const navigate=useNavigate();
  return <><main><section className="hero"><div className="hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> YOUR NEXT JOURNEY STARTS HERE</div><h1>Less planning.<br/><em>More going.</em></h1><p className="hero-description">A clearer way to explore rail journeys across Malaysia. Compare your options, find your rhythm, and keep every plan in one place.</p><div className="hero-points"><span><Check size={15}/> Compare journey options</span><span><Check size={15}/> Save plans for later</span></div><div className="hero-note"><span className="status-dot"/> Independent planning prototype <span className="note-divider"/> Sample data only</div></div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=85" alt="Railway tracks stretching into a green landscape" /><div className="visual-shade"/><div className="image-caption"><span className="caption-kicker">THE JOY IS IN THE JOURNEY</span><strong>Take the scenic route.</strong><span>Explore Malaysia, one stop at a time.</span></div><div className="floating-stamp"><Compass size={20}/><span>YOUR ROUTE,<br/><b>YOUR PACE</b></span></div></div>
    </div><div className="search-dock"><div className="dock-heading"><div><span className="section-kicker">PLAN WITH CLARITY</span><h2>Where are you headed?</h2></div><span className="sample-chip">ILLUSTRATIVE SCHEDULES</span></div><SearchPanel/></div></section>
    <section className="section featured-section"><div className="section-heading"><div><span className="section-kicker">A LITTLE INSPIRATION</span><h2>Popular ways to go</h2><p>Explore sample connections between places worth the trip.</p></div><Link to="/journeys" className="text-link">Explore all journeys <ArrowRight size={16}/></Link></div>
      <div className="featured-grid">{[{from:'KL Sentral',to:'Ipoh',time:'~ 2h 26m',fare:'From RM 22',image:'photo-1519681393784-d120267933ba',tag:'CITY TO HIGHLANDS'},{from:'Butterworth',to:'KL Sentral',time:'~ 4h 08m',fare:'From RM 52',image:'photo-1500530855697-b586d89ba3ee',tag:'COAST TO CAPITAL'},{from:'Alor Setar',to:'Butterworth',time:'~ 1h 19m',fare:'From RM 16',image:'photo-1501785888041-af3ef285b470',tag:'A SHORT ESCAPE'}].map((r,i)=><button key={r.from+r.to} className="featured-card" onClick={()=>navigate('/journeys?'+new URLSearchParams({from:r.from,to:r.to,date:today(),pax:'1'}))}><div className="featured-image"><img src={'https://images.unsplash.com/'+r.image+'?auto=format&fit=crop&w=700&q=75'} alt="" loading="lazy"/><span>{r.tag}</span><span className="feature-arrow"><ArrowRight size={17}/></span></div><div className="featured-body"><div><small>{r.from}</small><strong>{r.to}</strong></div><div className="featured-time">{r.time}<small>{r.fare}</small></div></div></button>)}</div>
    </section><section className="how-section"><div className="how-intro"><span className="section-kicker">A BETTER WAY TO PLAN</span><h2>Three steps.<br/><em>One smoother trip.</em></h2><p>From first thought to final stop, keep the details simple and the possibilities open.</p></div><div className="steps">{[{n:'01',title:'Search',desc:'Choose your stations, date and travel party.'},{n:'02',title:'Compare',desc:'Review sample times, durations and fares side by side.'},{n:'03',title:'Save',desc:'Keep the journeys you like close at hand.'}].map(s=><div className="step" key={s.n}><span>{s.n}</span><div><h3>{s.title}</h3><p>{s.desc}</p></div><ArrowRight size={18}/></div>)}</div></section>
    </main></>;
}
function Results({saved,onSave}:{saved:string[];onSave:(id:string)=>void}) {
  const [params,setParams]=useSearchParams();
  const from=params.get('from')||initialSearch.origin,to=params.get('to')||initialSearch.destination;
  const [sort,setSort]=useState('departure'); const [direct,setDirect]=useState(false); const [maxDuration,setMaxDuration]=useState(600);
  const matches=useMemo(()=>journeys.filter(j=>j.origin===from&&j.destination===to).filter(j=>!direct||j.changes===0).filter(j=>j.duration<=maxDuration).sort((a,b)=>sort==='fare'?a.fare-b.fare:sort==='duration'?a.duration-b.duration:a.departure.localeCompare(b.departure)),[from,to,sort,direct,maxDuration]);
  const date=params.get('date')||today();
  return <main className="page-shell"><div className="page-title-row"><div><span className="section-kicker">YOUR ROUTE, AT A GLANCE</span><h1>Find your journey</h1><p>Compare sample journeys and choose what works for you.</p></div><span className="prototype-label"><span/> Sample data</span></div><div className="results-search"><SearchPanel compact onSearch={f=>setParams({from:f.origin,to:f.destination,date:f.date,pax:String(f.passengers)})}/></div>
    <div className="results-summary"><div><span className="summary-route">{from} <ArrowRight size={18}/> {to}</span><span className="summary-date"><CalendarDays size={15}/> {date} · {params.get('pax')||'1'} passenger(s)</span></div><span className="results-count">{matches.length} sample {matches.length===1?'journey':'journeys'}</span></div>
    <div className="results-layout"><aside className="filters"><div className="filter-title"><SlidersHorizontal size={17}/> <strong>Refine results</strong></div><div className="filter-group"><label>Sort by</label><select value={sort} onChange={e=>setSort(e.target.value)}><option value="departure">Departure time</option><option value="duration">Shortest duration</option><option value="fare">Lowest sample fare</option></select></div><div className="filter-group"><label>Journey duration</label><div className="range-label"><span>Up to</span><strong>{formatDuration(maxDuration)}</strong></div><input type="range" min="60" max="600" step="30" value={maxDuration} onChange={e=>setMaxDuration(Number(e.target.value))}/><div className="range-ends"><span>1 hour</span><span>10 hours</span></div></div><label className="check-filter"><input type="checkbox" checked={direct} onChange={e=>setDirect(e.target.checked)}/> Direct journeys only</label><button className="clear-filters" onClick={()=>{setSort('departure');setDirect(false);setMaxDuration(600);}}>Reset filters</button></aside>
      <div className="results-list">{matches.length?matches.map(j=><JourneyCard key={j.id} journey={j} saved={saved.includes(j.id)} onSave={()=>onSave(j.id)}/>):<div className="empty-state"><span className="empty-icon"><TrainFront size={25}/></span><h2>No sample journeys found</h2><p>Try another station pair or relax your filters. This prototype includes a limited set of illustrative routes.</p><button className="primary-button" onClick={()=>{setParams({from:initialSearch.origin,to:initialSearch.destination,date,pax:params.get('pax')||'1'});setDirect(false);setMaxDuration(600);}}>Try KL Sentral to Ipoh</button></div>}</div>
    </div><p className="disclosure">Schedules, journey durations and fares shown here are illustrative examples only. They are not live operator data or ticket availability.</p>
  </main>;
}
function Details({saved,onSave}:{saved:string[];onSave:(id:string)=>void}) {
  const {journeyId}=useParams();const navigate=useNavigate();const journey=journeys.find(j=>j.id===journeyId);
  if(!journey)return <main className="page-shell"><div className="empty-state"><h2>Journey not found</h2><p>This sample journey may no longer be available in this prototype.</p><Link className="primary-button" to="/journeys">Back to journeys</Link></div></main>;
  return <main className="page-shell detail-shell"><button className="back-link" onClick={()=>navigate(-1)}>← Back to results</button><div className="detail-heading"><div><span className="section-kicker">JOURNEY OVERVIEW · SAMPLE</span><h1>{journey.origin} <ArrowRight size={28}/> {journey.destination}</h1><p>{journey.service} · Illustrative timetable</p></div><button className={saved.includes(journey.id)?'primary-button is-saved':'primary-button'} onClick={()=>onSave(journey.id)}>{saved.includes(journey.id)?<Check size={17}/>:<Bookmark size={17}/>} {saved.includes(journey.id)?'Saved to My Trips':'Save journey'}</button></div>
    <div className="detail-grid"><section className="detail-card"><div className="detail-card-heading"><div><span className="section-kicker">YOUR ROUTE</span><h2>Journey timeline</h2></div><span className="sample-chip">SAMPLE</span></div><div className="timeline"><div className="timeline-line"/>{journey.stops.map((stop,i)=><div className={i===0||i===journey.stops.length-1?'timeline-stop terminal':'timeline-stop'} key={stop.station+i}><div className="timeline-marker">{i===0||i===journey.stops.length-1?<span/>:null}</div><div className="timeline-time">{i===0?stop.departure:i===journey.stops.length-1?stop.arrival:stop.arrival}</div><div className="timeline-station"><strong>{stop.station}</strong><small>{i===0?'Departure':i===journey.stops.length-1?'Arrival':'Intermediate stop'}</small></div><div className="timeline-extra">{i===journey.stops.length-1?'':i===0?'Departs '+stop.departure:'Arr. '+stop.arrival+' · Dep. '+stop.departure}</div></div>)}</div></section>
      <aside className="journey-facts"><div className="fact"><span>Departure</span><strong>{journey.departure}</strong><small>{journey.origin}</small></div><div className="fact"><span>Arrival</span><strong>{journey.arrival}</strong><small>{journey.destination}</small></div><div className="fact"><span>Estimated duration</span><strong>{formatDuration(journey.duration)}</strong></div><div className="fact"><span>Sample fare per person</span><strong className="fact-fare">RM {journey.fare.toFixed(2)}</strong><small>Illustrative only</small></div><div className="fact-note"><Check size={16}/><p>This is a planning prototype. No ticket is reserved and no payment can be made.</p></div></aside></div>
    <div className="detail-bottom"><div><h3>Planning ahead?</h3><p>Save this example to compare it with other journeys later.</p></div><button className="outline-button" onClick={()=>navigate('/journeys?'+new URLSearchParams({from:journey.origin,to:journey.destination}).toString())}>Compare sample journeys <ArrowRight size={16}/></button></div>
  </main>;
}
function MyTrips({saved,onSave}:{saved:string[];onSave:(id:string)=>void}) {
 const list=journeys.filter(j=>saved.includes(j.id));
 return <main className="page-shell"><div className="page-title-row"><div><span className="section-kicker">YOUR PERSONAL SHORTLIST</span><h1>My trips</h1><p>Keep your favourite journey options together.</p></div><Link to="/journeys" className="primary-button"><Plus size={17}/> Find a journey</Link></div>
 {list.length?<><div className="saved-intro"><Bookmark size={17}/><span>{list.length} saved {list.length===1?'journey':'journeys'} on this device</span></div><div className="results-list">{list.map(j=><JourneyCard key={j.id} journey={j} saved onSave={()=>onSave(j.id)}/>)}</div><p className="disclosure">Saved journeys stay in this browser using local storage. They are not synced to other devices.</p></>:<div className="empty-state my-trips-empty"><span className="empty-icon"><Bookmark size={25}/></span><h2>Your next trip starts with a plan</h2><p>Save journeys as you compare options. They’ll be waiting here when you return to this browser.</p><Link to="/journeys" className="primary-button">Explore journeys <ArrowRight size={16}/></Link></div>}
 </main>;
}
function Profile() {
 const [prefs,setPrefs]=useState(readPrefs);const [notice,setNotice]=useState(false);
 function update(next:typeof prefs){setPrefs(next);localStorage.setItem(PREF_KEY,JSON.stringify(next));setNotice(true);window.setTimeout(()=>setNotice(false),2200);}
 return <main className="page-shell profile-shell"><div className="page-title-row"><div><span className="section-kicker">MAKE IT YOURS</span><h1>Preferences</h1><p>Small choices to make planning feel more comfortable.</p></div></div><section className="profile-card"><div className="profile-section-title"><span className="profile-icon"><SlidersHorizontal size={19}/></span><div><h2>Interface preferences</h2><p>These settings are saved in this browser only.</p></div></div><div className="preference-row"><div><strong>Compact journey cards</strong><p>Show journey information in a denser layout.</p></div><button className={prefs.compact?'toggle-switch active':'toggle-switch'} role="switch" aria-checked={prefs.compact} aria-label="Compact journey cards" onClick={()=>update({...prefs,compact:!prefs.compact})}><span/></button></div><div className="preference-row"><div><strong>Fare display</strong><p>Sample fare currency shown throughout the prototype.</p></div><select value={prefs.currency} onChange={e=>update({...prefs,currency:e.target.value})}><option value="MYR">MYR · Malaysian Ringgit</option></select></div><div className="profile-disclaimer"><span className="status-dot"/><p><strong>Prototype account</strong><br/>RAILFLOW does not need an account, password or personal profile to save journeys. Your saved trips and preferences stay in this browser.</p></div>{notice&&<p className="save-notice" role="status"><Check size={15}/> Preferences saved</p>}</section><section className="profile-card about-card"><span className="section-kicker">ABOUT RAILFLOW</span><h2>Made for the journey, not the noise.</h2><p>RAILFLOW is an independent personal project exploring clearer railway journey planning. It is not affiliated with KTMB or any transport operator.</p><p className="disclosure">All stations, schedules, journey durations and fares are illustrative sample data. There is no live service, booking, payment or ticket availability integration.</p></section></main>;
}
function App() {
 const [saved,setSaved]=useState<string[]>(readSaved);
 const [toast,setToast]=useState('');
 useEffect(()=>{localStorage.setItem(SAVED_KEY,JSON.stringify(saved));},[saved]);
 function toggleSaved(id:string){const exists=saved.includes(id);setSaved(old=>exists?old.filter(x=>x!==id):[...old,id]);setToast(exists?'Journey removed from My Trips':'Journey saved to My Trips');window.setTimeout(()=>setToast(''),2400);}
 useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;let ctx:{revert:()=>void}|undefined;let cancelled=false;import('gsap').then(({gsap})=>{if(cancelled)return;ctx=gsap.context(()=>{gsap.fromTo('.hero-copy > *',{y:14,opacity:0},{y:0,opacity:1,duration:.55,stagger:.07,ease:'power2.out',clearProps:'all'});});});return()=>{cancelled=true;ctx?.revert();};},[]);
 return <><Header/><Routes><Route path="/" element={<Home saved={saved} onSave={toggleSaved}/>}/><Route path="/journeys" element={<Results saved={saved} onSave={toggleSaved}/>}/><Route path="/journeys/:journeyId" element={<Details saved={saved} onSave={toggleSaved}/>}/><Route path="/my-trips" element={<MyTrips saved={saved} onSave={toggleSaved}/>}/><Route path="/profile" element={<Profile/>}/><Route path="*" element={<main className="page-shell empty-state"><h1>Page not found</h1><Link to="/" className="primary-button">Return home</Link></main>}/></Routes><Footer/>{toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}<Link to="/profile" className="floating-profile" aria-label="Preferences"><SlidersHorizontal size={18}/></Link></>;
}
export default App;